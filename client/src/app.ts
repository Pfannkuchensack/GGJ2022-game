import { io, Socket } from "socket.io-client";
import { GameMap } from '../../both/src/map';

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

	constructor(gameMap: GameMap, socket: Socket, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this._map = gameMap;
		this._socket = socket;
		this._canvas = canvas;
        this._context = context;
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

	finishturn() {
		this._socket.emit('game', {
			actiontype: "finishturn",
			data: {}
		})
	}

	reciveState(event: any) {
		if (!event.hasOwnProperty('actiontype')) {
			return;
		}

		switch (event.actiontype) {
			case 'createChar':
				this._map.addChar(event.data);
				break;
			case 'move':
				this._map.updateChar(event.data);
				break;
			default:
				console.log("?!?!?!?!ß111elf", event.actiontype, event.data);
		}
	}
}

function startApp(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
	const socket = io('ws://localhost:8010', { transports: ['websocket'], forceNew: true });

	const gameMap = new GameMap()
	const app = new App(gameMap, socket, canvas, context);

	socket.on('connect', () => {
		app.join("test")
	});

	socket.on('game', (data) => {
		console.log("socketIO[game]:", data);
		app.reciveState(data)
	});
}