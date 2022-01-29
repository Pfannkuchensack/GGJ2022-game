export default class Game {
    constructor({
        canvas,
        socket
    }) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._socket = socket;
    }
    start() {
        // render tiles
        

        // render chars

    }
}


// hexagons
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var size = 60;
var w = Math.sqrt(3) * size;
var h = 2 * size;

var hexCoords = [[0, 0], [1 / 2, -1 / 4], [1 / 2, -3 / 4], [0, -1], [-1 / 2, -3 / 4], [-1 / 2, -1 / 4]];

drawHexagon(0, 0);
drawHexagon(1, 0);
drawHexagon(2, 0);

drawHexagon(0, 1);
drawHexagon(1, 1);
drawHexagon(2, 1);

drawHexagon(0, 2);
drawHexagon(1, 2);
drawHexagon(2, 2);

function drawHexagon(q, r) {
    ctx.strokeStyle = "white";
    ctx.beginPath();
    for (const cord of hexCoords) {
        var wOffset = r % 2 == 0 ? 0 : -1 / 2 * w;
        ctx.lineTo(q * w + cord[0] * w + 2 * size + wOffset, r * 3 / 4 * h + cord[1] * h + 2 * size);
    }
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.stroke();
}