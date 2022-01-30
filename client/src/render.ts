import { GameMap } from '../../both/src/map';
import { Tile } from '../../both/src/tile';
import { Loader } from './loader';

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
	_hover_tile: Tile | null;
	_showMapOptions: boolean;
	_loader: Loader;

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
		this._showMapOptions = false;

		this._loader = new Loader({
			tile_ground: 'assets/tile_ground.png',
			jet_blue_E_40: 'assets/jet_blue_E_40.png',
			cursor_action: 'assets/cursor_action.png',
			cursor_hover: 'assets/cursor_hover.png',
		});
		this._loader.load();
	}

	draw() {
		const offsetY = 5

		this._ctx.fillStyle = "rgb(16, 17, 18)";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		if (!this._loader.finish) {
			this._ctx.fillText('Load Assets: ' + this._loader.process, 20, 20);
			return
		}

		this._map.tileStore.forEach((tiles, x) => {
			tiles.forEach((tile, y) => {
				const iso = this.mapToScreen(x, y)

				this._ctx.drawImage(this._loader.getImage('tile_ground'), iso.x, iso.y - offsetY);
			})
		});

		if (this._map._playerChar !== undefined && this._showMapOptions) {
			const currentChar = this._map._playerChar;

			const neighborPositions = [
				[-1, -1],
				[0, -1],
				[1, -1],
				[1, 0],
				[1, 1],
				[0, 1],
				[-1, 1],
				[-1, 0],
			] as number[][]

			neighborPositions.forEach((neighbor: number[]) => {
				const pos = { q: currentChar.position.q + neighbor[0], r: currentChar.position.r + neighbor[1] }
				const neededPoints = this._map.neededMovepoints(pos);
				if (neededPoints > 0 && neededPoints <= currentChar.currentMovePoints) {
					const screen = this.mapToScreen(pos.q, pos.r);
					this._ctx.drawImage(this._loader.getImage('cursor_action'), screen.x, screen.y - offsetY);
				}
			})
		}

		if (this._hover_tile) {
			const screen = this.mapToScreen(this._hover_tile.position.q, this._hover_tile.position.r);
			this._ctx.drawImage(this._loader.getImage('cursor_hover'), screen.x, screen.y - offsetY);
		}

		this._map.chars.forEach((char) => {
			const iso = this.mapToScreen(char.position.q, char.position.r);

			this._ctx.drawImage(this._loader.getImage('jet_blue_E_40'), iso.x, iso.y - offsetY);
		})

		this._ctx.fillStyle = "rgb(255, 255, 255)";
		if (this._map._playerChar !== undefined) {
			this._ctx.fillText('Spieler: ' + this._map._playerChar?.id, 600, 50);
			this._ctx.fillText('Moves: ' + this._map._playerChar?.currentMovePoints, 600, 65);
			this._ctx.fillText('Moves: ' + this._map._playerChar?.position.q, 600, 80);
			this._ctx.fillText('Moves: ' + this._map._playerChar?.position.r, 600, 95);
		}
	}

	set showMapOptions(showOptions: boolean) {
		this._showMapOptions = showOptions
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
