export default class Game {
    constructor({
        canvas,
        socket
    }) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext('2d');
        this._socket = socket;

        this.size = 60;
        this.w = Math.sqrt(3) * this.size;
        this.h = 2 * this.size;

        this.hexCoords = [
            [0, 0],
            [1 / 2, -1 / 4],
            [1 / 2, -3 / 4],
            [0, -1],
            [-1 / 2, -3 / 4],
            [-1 / 2, -1 / 4]
        ];
    }
    start() {
        for (let q = 0; q < 3; q++) {
            for (let r = 0; r < 3; r++) {
                this.drawHexagon(q, r);
            }
        }
    }
    drawHexagon(q, r){
        this._ctx.strokeStyle = "white";
        this._ctx.beginPath();
        for (const cord of this.hexCoords) {
            let wOffset = r % 2 === 0 ? 0 : -1 / 2 * this.w;
            this._ctx.lineTo(q * this.w + cord[0] * this.w + 2 * this.size + wOffset, r * 3 / 4 * this.h + cord[1] * this.h + 2 * this.size);
        }
        this._ctx.closePath();
        this._ctx.fillStyle = "green";
        this._ctx.fill();
        this._ctx.stroke();
    }
}
