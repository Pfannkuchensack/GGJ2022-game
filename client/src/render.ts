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
    _hover: HTMLImageElement;
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
		const hover = document.getElementById('hover') as HTMLImageElement
		this._hover = hover;
	}

	draw() {
        const offsetY = 5

		this._ctx.fillStyle = "rgb(16, 17, 18)";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this._map.tileStore.forEach((tiles, x) => {
			tiles.forEach((tile, y) => {
				const iso = this.mapToScreen(x, y)

				this._ctx.drawImage(this._tile_ground, iso.x, iso.y-offsetY);
			})
		})

		this._map.chars.forEach((char) => {
			const iso = this.mapToScreen(char.position.q, char.position.r);

			this._ctx.drawImage(this._jet_blue, iso.x, iso.y-offsetY);
		})

		if (this._hover_tile) {
			const screen = this.mapToScreen(this._hover_tile.position.q, this._hover_tile.position.r);
			this._ctx.drawImage(this._hover, screen.x, screen.y-offsetY);
		}
	}

	hoverScreen(screenX: number, screenY: number) {
		const iso = this.screenToMap(screenX, screenY);

		const tile = this._map.getTile({q: Math.round(iso.q), r: Math.round(iso.r)});
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

		return { q: Math.floor(mapX), r: Math.round(mapY) }
	}
}