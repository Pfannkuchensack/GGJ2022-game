import { io, Socket } from "socket.io-client";
import { Character } from '../../both/src/character';
import { GameMap } from '../../both/src/map';
import { Renderer } from './render';

const music = new Audio('assets/ambience_music.mp3')
music.loop = true;

const attacksound = new Audio('assets/attack.mp3')
attacksound.volume = 0.1; // Mir fallen sonst die Ohren ab :(
attacksound.loop = false;

window.addEventListener('load', () => {
	'use strict';

	let canvas = document.getElementById('canvas') as
		HTMLCanvasElement;
	let context = canvas.getContext('2d');
	if (context !== null) {
		startApp(canvas, context);
	}
});

class App {
	_map: GameMap;
	_socket: Socket;
	_canvas: HTMLCanvasElement;
	_context: CanvasRenderingContext2D;
	_renderer: Renderer

	constructor(gameMap: GameMap, socket: Socket, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this._map = gameMap;
		this._socket = socket;
		this._canvas = canvas;
		this._context = context;
		this._renderer = new Renderer(this._map, this._canvas, this._context);
	}

	startLoop(now: number) {
		this._renderer.draw(now)
		window.requestAnimationFrame(this.startLoop.bind(this));
	}

	join(gameid: string) {
		this._socket.emit('join', { gameid: gameid });
	}

	createChar(name: string, resistance: string, attack: string) {
		this._socket.emit('game', {
			actiontype: "createChar",
			data: {
				name: name,
				resistance: resistance,
				attack: attack
			}
		})
	}

	move(q: number, r: number) {
		this._socket.emit('game', {
			actiontype: "move",
			data: {
				q: q,
				r: r
			}
		})
	}

	attack(charId: string, attackName: string) {
		this._socket.emit('game', {
			actiontype: "attack",
			data: {
				attackName: attackName,
				charId: charId
			}
		})
	}

	finishturn() {
		this._socket.emit('game', {
			actiontype: "finishturn",
			data: {}
		})
	}

	click(x: number, y: number) {
		const pos = this._renderer.screenToMap(x, y);

		const char = this._map.getCharAt(pos.q, pos.r)
		if (char === undefined) {
			this.move(pos.q, pos.r);
		} else if (this._map._playerChar !== undefined && this._map._playerChar.attacks.length > 0) {
			this.attack(char.id, this._map._playerChar?.attacks[0])
		}
	}

	hover(x: number, y: number) {
		this._renderer.hoverScreen(x, y)
	}

	reciveState(event: any) {
		if (!event.hasOwnProperty('actiontype')) {
			return;
		}

		switch (event.actiontype) {
			case 'state':
				this._renderer.stopAttackAnimation();

				if (event.data.currentPlayer == this._socket.id) {
					this._renderer.showMapOptions = true;
					(document.getElementById('info') as HTMLSpanElement).innerHTML = 'you are next';
					(document.getElementById('toolbar') as HTMLDivElement).style.display = 'block';
				}
				else {
					this._renderer.showMapOptions = false;
					(document.getElementById('info') as HTMLSpanElement).innerHTML = 'you must wait';
					(document.getElementById('toolbar') as HTMLDivElement).style.display = 'none';
				}
				let insertedids = [] as string[];
				event.data.chars.forEach((charData: any) => {
					let char = this._map.getCharById(charData.id)

					if (char === undefined) {
						char = new Character("", 0, 0, 0, 0)
						this._map.addChar(char);
					}

					char.import(charData);
					insertedids.push(char.id);

					if (char.id === this._socket.id) {
						this._map._playerChar = char;
					}
				});
				this._map.chars.forEach((char: Character) => {
					if (insertedids.indexOf(char.id) === -1) {
						this._map.removeChar(char);
					}
				});
				break;
			/*
			case 'addChar':
				const newChar = new Character("", 0, 0, 0, 0)
				newChar.import(event.data)

				if (newChar.id === this._socket.id) {
					this._map._playerChar = newChar
				}	

				this._map.addChar(newChar);
				break;
				*/
			case 'move':
				this._renderer.stopAttackAnimation();
				const oldChar = this._map.getCharById(event.data.id)
				if (oldChar !== undefined) {
					oldChar.import(event.data)
					console.log(oldChar, oldChar.position);
				}
				break;
			case 'attack':
				console.log("attack", event.data)
				this._renderer.startAttackAnimation(event.data)

				if (event.data.history.length > 0) {
					const challenger = this._map.getCharById(event.data.history[0].attackerId)
					if (challenger !== undefined) {
						challenger._direction = event.data.challengerDirection;
						attacksound.play();	
					}

					const challenged = this._map.getCharById(event.data.history[0].defenderId)
					if (challenged !== undefined) {
						challenged._direction = event.data.challengedDirection;
						attacksound.play();						
					}
				}

				if (this._map._playerChar !== undefined) {
					this._map._playerChar._remaining_attacks--;
				}
				break;
			default:
				console.log("?!?!?!?!ß111elf", event.actiontype, event.data);
		}
	}
}

function startApp(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	const socket = io({ transports: ['websocket'], forceNew: true });

	const gameMap = new GameMap()
	const app = new App(gameMap, socket, canvas, context);

	socket.on('connect', () => {
		let hash = "default"
		if(window.location.hash) {
			hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
		}
		console.log("join game "+hash+"...");

		app.join(hash);
	});

	socket.on('game', (data) => {
		const msg = JSON.parse(data);
		console.log("socketIO[game]:", msg);
		app.reciveState(msg);
	});

	canvas.addEventListener('click', (event) => {
		app.click(event.offsetX, event.offsetY);
	})

	canvas.addEventListener('mousemove', (event) => {
		app.hover(event.offsetX, event.offsetY);
	})

	const createCharBtn = document.getElementById('createChar') as HTMLCanvasElement;
	createCharBtn.addEventListener('click', () => {
		app.createChar('TestDerErste', 'hallo', 'attack1');
	});

	const startBtn = document.getElementById('start') as HTMLCanvasElement;
	startBtn.addEventListener('click', () => {
		music.play();

		const userinput = (document.getElementById('username') as HTMLInputElement);

		app.createChar(userinput.value, 'hallo', 'attack1');
		(document.getElementById('overlay') as HTMLCanvasElement).classList.remove('active');
	});

	const finishturn = document.getElementById('finishturn') as HTMLCanvasElement;
	finishturn.addEventListener('click', () => {
		app.finishturn();
	});

	app.startLoop(0);
}