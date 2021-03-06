import express from 'express';
import http from 'http';
import { createClient } from 'redis';
import { Server as SocketIO } from 'socket.io';
import { AttacksConfig, BattleHistory, Character } from '../both/src/character';
import { Game } from '../both/src/game';
import { Item } from '../both/src/item';
import { GameMap } from '../both/src/map';

// log helper
var log = function (...args: any[]) { return console.log.apply(console, ['[' + new Date().toISOString().slice(11, -5) + ']'].concat(Array.prototype.slice.call(arguments))); };

type GameClient = {
	socketId: string;
	gameId: string;
	charId?: string;
}

type GameClientMap = { [key: string]: GameClient }

type GameList = { [key: string]: Game }

// config
const PORT = process.env.SOCKET_PORT ?? 8010;
const REDIS_HOST = process.env.REDIS_HOST ?? 'redis://localhost';

// game config
const gameConfig = {
	attacks: {
		"attack1": {
			damage: 1,
			repeats: 10,
		},
		"attack2": {
			damage: 10,
			repeats: 1,
		}
	} as AttacksConfig
}

log('hi!');

(async () => {
	// create express app
	log('create express server...');
	const app = express();

	// start server
	log('create http server...');
	const server = http.createServer(app);

	log('start redis...', REDIS_HOST);
	// start redis
	const redisSub = createClient({ url: REDIS_HOST });
	const redisPub = createClient({ url: REDIS_HOST });
	redisSub.on('error', (err) => log('redis error: ', err))
	redisPub.on('error', (err) => log('redis error: ', err))

	await redisSub.connect();
	await redisPub.connect();
	log('redis connected!');

	// clients
	const clients = {} as GameClientMap;
	// games
	const games = {} as GameList;

	setInterval(countuser, 15000);
	function countuser() {
		log('Auslastung: ' + Object.keys(clients).length + ' User');
	}

	// start socket io
	const io = new SocketIO(server)
	io.on('connection', (socket) => {
		// client meldet sich an
		socket.on('join', function (data) {
			const client = {
				socketId: socket.id,
				gameId: data.gameid,
				charId: undefined,
			}

			if (data.hasOwnProperty('charid')) {
				// todo: wenn es den char gibt!

				client.charId = data.charid;
			}

			if (!games.hasOwnProperty(client.gameId)) {
				const gameMap = new GameMap();
				games[client.gameId] = new Game(client.gameId, gameMap);
			}

			// subscribe game informations and send to socket io client
			redisSub.subscribe('game:' + client.gameId, (message, channelname) => {
				socket.emit('game', message);
			});

			//
			redisSub.subscribe('game:' + client.gameId + ':' + client.socketId, (message, channelname) => {
				socket.emit('game', message);
			});

			// add Client to CLient Array
			clients[socket.id] = client
			log('Neuer Client', client.socketId);

			sendState(client, false)
		});

		socket.on('game', function (action) {
			try {
				log("socketIO[game]:", action)

				if (!action.hasOwnProperty("actiontype")) {
					return
				}

				// verarbeiten
				switch (action.actiontype) {
					case "createChar":
						createChar(action.data, clients[socket.id]);
						break;
					case "move":
						moveChar(action.data, clients[socket.id]);
						break;
					case "attack":
						attackChar(action.data, clients[socket.id]);
						break;
					case "finishturn":
						finishTurn(action.data, clients[socket.id]);
				}
			} catch (e) {
				log("socketIO[game]:", 'message error: ', e);
			}

			//console.log('game:' + clients[socket.id].gameId, JSON.stringify(message));
		});

		socket.on('disconnect', reason => {
			if (!clients.hasOwnProperty(socket.id)) {
				return;
			}

			const client = clients[socket.id];
			const game = games[client.gameId];
			if (!game) {
				log("socketIO[disconnect]", "game already deleted!", socket.id);
				return;
			}
			const char = game.getChar(socket.id)
			if (char !== undefined) {
				log("socketIO[disconnect]", "delete char", char.id)
				game.removeChar(char);
			}

			if (game.chars.length == 0) {
				log("socketIO[disconnect]", "delete game", client.gameId)
				delete games[client.gameId];
			}

			delete clients[socket.id];
			log("socketIO[disconnect]", "delete client", socket.id)
			//redisClient.removeListener('message', NewMsg);
			// @TODO: Pr??fen ob noch jemand anders in der Lobby ist fehlt hier noch
			//redisClient.unsubscribe('gamey:' + socket.lobby);
		});
	});

	// start all
	server.listen(PORT)
	log('http server started!');
	// Send State
	function sendState(client: GameClient, sendToAll: boolean) {
		const game = games[client.gameId];

		const chars = game.chars.map((char: Character) => {
			return char.export
		})

		// broadcast
		let topic = 'game:' + client.gameId
		if (!sendToAll) {
			topic += ':' + client.socketId
		}

		redisPub.publish(topic, JSON.stringify({
			actiontype: 'state',
			data: {
				chars: chars,
				currentPlayer: game.currentChar?.id
			}
		}));
		log("sendState:", "send state to: ", topic, chars);
	}

	// Create a Character
	function createChar(action: { name: string, resistance: string, attack: string }, client: GameClient) {
		// spieler hat schon einen char!!!!!!!!!!!!
		if (client.charId !== undefined) {
			log("createChar:", "client charId already exists :(", client.charId)
			return;
		}

		let username = '#' + Math.round(Math.random() * 1000);

		if (action.name.length > 0 && action.name.length < 15) {
			username = action.name;
		}

		const char = new Character(client.socketId, 1, 0, 100, 3);
		const game = games[client.gameId];
		char.name = username;
		char.setPosition(2, 2);
		while(!game._map.isPositionFree(char.position))
		{
			char.setPosition(Math.round(Math.random() * 8), Math.round(Math.random() * 8));
		}

		char.addAttack(action.attack, gameConfig);
		// todo: add resistance

		game.addChar(char);

		// save char on client
		client.charId = char.id

		// broadcast
		sendState(client, true);
		/*redisPub.publish('game:' + client.gameId, JSON.stringify({ 'actiontype': 'addChar', 'data': char.export }));
		log("createChar:", "char created.", client.charId, char);*/
	}

	// Move char
	function moveChar(action: { q: number, r: number }, client: GameClient) {
		if (client.charId === undefined) {
			log("moveChar:", "client has no charId :(((", client.socketId);
			return;
		}
		const game = games[client.gameId];
		const char = game.getChar(client.charId);
		if (char !== undefined) {
			// move
			const success = game.moveChar(char, { q: action.q, r: action.r });
			if (!success) {
				log("moveChar:", "char not moved.", client.charId);
				return;
			}
			// broadcast
			redisPub.publish('game:' + client.gameId, JSON.stringify({ 'actiontype': 'move', 'data': char.export }));
			log("moveChar:", "char moved.", client.charId, char);
		}
	}

	// attack char
	function attackChar(action: { charId: string, attackName: string }, client: GameClient) {
		if (client.charId === undefined) {
			log("attackChar:", "client has no charId :(((", client.socketId);
			return;
		}

		if (client.charId === action.charId) {
			log("attackChar:", "client self attack :(((", client.socketId);
			return;
		}

		const game = games[client.gameId];
		const challenger = game.getChar(client.charId);
		if (challenger === undefined) {
			return;
		}

		const challenged = game.getChar(action.charId);
		if (challenged === undefined) {
			return;
		}

		// attack
		const battleLog = game.attackChar(challenger, action.attackName, challenged, gameConfig);
		if (battleLog === null) {
			log("attackChar:", "char not attacked.", challenger, action.attackName, challenged);
			return;
		}

		const history = battleLog.history.map((history: BattleHistory) => {
			return {
				attackerId: history.attacker.char.id,
				defenderId: history.defender.char.id,
				damage: history.damage,
			}
		})

		// broadcast
		redisPub.publish('game:' + client.gameId, JSON.stringify({
			actiontype: 'attack',
			data: {
				challengerDirection: challenger.direction,
				challengedDirection: challenged.direction,
				history: history
			}
		}));
		log("attackChar:", "char attack.", challenger, action.attackName, challenged);
	}

	// finish turn
	function finishTurn(action: {}, client: GameClient) {
		if (client.charId === undefined) {
			log("createChar:", "client has no charId :(((", client.socketId);
			return;
		}
		const game = games[client.gameId];
		const char = game.getChar(client.charId);
		if (char !== undefined) {
			const success = game.finishTurn(char);
			if (!success) {
				log("moveChar:", "turn dont finished.", client.charId);
				return;
			}
			char.reset();
			sendState(client, true);
		}
	}

	function collectItem(client: GameClient, item: Item) {
		if (client.charId === undefined) {
			log("createChar:", "client has no charId :(((", client.socketId);
			return;
		}
		const char = games[client.gameId].getChar(client.charId);

		redisPub.publish('game:' + client.gameId, JSON.stringify({ 'actiontype': 'collectitem', 'data': item }));
		log("collectItem:", "item collected:", client.charId, item);
	}

	function dropItem(client: GameClient, item: Item) {
		if (client.charId === undefined) {
			log("createChar:", "client has no charId :(((", client.socketId);
			return;
		}
		const char = games[client.gameId].getChar(client.charId);

		redisPub.publish('game:' + client.gameId, JSON.stringify({ 'actiontype': 'dropitem', 'data': item }));
		log("dropItem:", "item dropped:", client.charId, item);
	}

	// trade items
	function tradeRequest(client: GameClient, receiver: GameClient, item: Item) {

		redisPub.publish('game:' + client.gameId, JSON.stringify({ 'traderequest': 'collectitem', 'data': { item, receiver } }));
		log("collectItem:", "item collected:", client.charId, item);
	}

	function tradeAccept(client: GameClient, item: Item) {

	}

})();
