import { GameMap } from '../../both/src/map';

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

	constructor(gameMap: GameMap, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this._map = gameMap;
		this._canvas = canvas;
        this._ctx = context;
        
        this._tileWidth = 80;
        this._tileHeight = 40;
        this._tileWidthHalf = this._tileWidth / 2
        this._tileHeightHalf = this._tileHeight / 1.333
        this._cameraX = 0;
        this._cameraY = 0;
    }

    draw() {
        this.drawGrid2()
//        this.drawGrid()
        this._ctx.fillStyle = "#ffffff";
        this._ctx.fillText(new Date().toTimeString(), 100, 100);
    }

    mapToScreen(mapX: number, mapY: number) {
        const screenX = (mapX - mapY) * this._tileWidthHalf + this._cameraX
        const screenY = (mapX + mapY) * this._tileHeightHalf + this._cameraY

        return { x: screenX, y: screenY }
    }

    screenToMap(screenX: number, screenY: number) {
        screenX = screenX - this._cameraX
        screenY = screenY - this._cameraY

        const mapX = (screenX / this._tileWidthHalf + screenY / this._tileHeightHalf) / 2
        const mapY = (screenY / this._tileHeightHalf - (screenX / this._tileWidthHalf)) / 2

        return { q: mapX, r: mapY }
    }
}
