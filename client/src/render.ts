import { GameMap } from '../../both/src/map';
import { Tile } from '../../both/src/tile';

export class Renderer {
	_map: GameMap;
	_canvas: HTMLCanvasElement;
	_ctx: CanvasRenderingContext2D;
	_tileWidth: number;
	_tileHeight: number;
	_tileWidthHalf: number;
	_tileHeightHalf: number;
	_cameraX: number;
	_cameraY: number;
	_tile_ground: HTMLImageElement;
	_jet_blue: HTMLImageElement;
	_cursor_hover: HTMLImageElement;
	_cursor_action: HTMLImageElement;
	_hover_tile: Tile | null;

	constructor(gameMap: GameMap, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this._map = gameMap;
		this._canvas = canvas;
		this._ctx = context;

		this._tileWidth = 80;
		this._tileHeight = 40;
		this._tileWidthHalf = this._tileWidth / 2
		this._tileHeightHalf = this._tileHeight / 1.333
		this._cameraX = this._canvas.width / 2 - this._tileWidthHalf;
		this._cameraY = this._tileHeightHalf;

		this._hover_tile = null;

		const tile_ground = document.getElementById('tile_ground') as HTMLImageElement
		this._tile_ground = tile_ground;
		const jet_blue = document.getElementById('jet_blue') as HTMLImageElement
		this._jet_blue = jet_blue;
		const cursor_hover = document.getElementById('cursor_hover') as HTMLImageElement
		this._cursor_hover = cursor_hover;
		const cursor_action = document.getElementById('cursor_action') as HTMLImageElement
		this._cursor_action = cursor_action;
	}

	draw() {
		const offsetY = 5

		

		this._ctx.fillStyle = "rgb(16, 17, 18)";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		this._map.tileStore.forEach((tiles, x) => {
			tiles.forEach((tile, y) => {
				const iso = this.mapToScreen(x, y)

				this._ctx.drawImage(this._tile_ground, iso.x, iso.y - offsetY);
			})
		});

<<<<<<< HEAD
		if (this._map._playerChar !== undefined) {
			const currentChar = this._map._playerChar

			this._map.neighborsMovepoints(currentChar.position).forEach((neighbor: number[]) => {
				if (neighbor[2] > 0) {
					const screen = this.mapToScreen(currentChar.position.q + neighbor[0], currentChar.position.q + neighbor[1]);
					this._ctx.drawImage(this._cursor_action, screen.x, screen.y - offsetY);
				}
			})
		}
		
=======
>>>>>>> 3472bf7a1942d83fc2c228b858042329f871bd96
		if (this._hover_tile) {
			const screen = this.mapToScreen(this._hover_tile.position.q, this._hover_tile.position.r);
			this._ctx.drawImage(this._cursor_hover, screen.x, screen.y - offsetY);
		}

		this._map.chars.forEach((char) => {
			const iso = this.mapToScreen(char.position.q, char.position.r);

			this._ctx.drawImage(this._jet_blue, iso.x, iso.y - offsetY);
		})

		this._ctx.fillStyle = "rgb(255, 255, 255)";
		if(this._map._playerChar !== undefined) {
			this._ctx.fillText('Spieler: ' +  this._map._playerChar?.id, 600, 50);
			this._ctx.fillText('Moves: ' +  this._map._playerChar?.currentMovePoints, 600, 65);
		}
	}

	hoverScreen(screenX: number, screenY: number) {
		const iso = this.screenToMap(screenX, screenY);

		const tile = this._map.getTile({ q: Math.round(iso.q), r: Math.round(iso.r) });
		if (tile !== undefined) {
			this._hover_tile = tile;
		} else {
			this._hover_tile = null;
		}
	}

	mapToScreen(mapX: number, mapY: number) {
		const screenX = (mapX - mapY) * this._tileWidthHalf + this._cameraX;
		const screenY = (mapX + mapY) * this._tileHeightHalf + this._cameraY;

		return { x: screenX, y: screenY }
	}

	screenToMap(screenX: number, screenY: number) {
		screenX = screenX - this._cameraX;
		screenY = screenY - this._cameraY;

		const mapX = (screenX / this._tileWidthHalf + screenY / this._tileHeightHalf) / 2;
		const mapY = (screenY / this._tileHeightHalf - (screenX / this._tileWidthHalf)) / 2;

		return { q: Math.floor(mapX), r: Math.round(mapY) };
	}
}
