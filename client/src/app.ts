import { io, Socket } from "socket.io-client";
import { GameMap } from '../../both/src/map';
import { Character } from '../../both/src/character';
import { Renderer } from './render'

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

	startLoop() {
		this._renderer.draw()
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

	finishturn() {
		this._socket.emit('game', {
			actiontype: "finishturn",
			data: {}
		})
	}

	click(x: number, y: number) {
		const pos = this._renderer.screenToMap(x, y);
		this.move(pos.q, pos.r);
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
				if (event.data.currentPlayer == this._socket.id) {
					(document.getElementById('info') as HTMLSpanElement).innerHTML = 'Du bist dran';
				}
				else {
					(document.getElementById('info') as HTMLSpanElement).innerHTML = 'Du musst warten';
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
				const oldChar = this._map.getCharById(event.data.id)
				if (oldChar !== undefined) {
					oldChar.import(event.data)
					console.log(oldChar, oldChar.position);
				}
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

	const moveBtn = document.getElementById('move') as HTMLCanvasElement;
	moveBtn.addEventListener('click', () => {
		const q = document.getElementById('q') as HTMLInputElement;
		const r = document.getElementById('r') as HTMLInputElement;
		if (q !== null && r !== null) {
			app.move(parseInt(q.value), parseInt(r.value));
		}
	});

	const finishturn = document.getElementById('finishturn') as HTMLCanvasElement;
	finishturn.addEventListener('click', () => {
		app.finishturn();
	});

	app.startLoop();
}