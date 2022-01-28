import './main.scss';
import Game from "./Game";

const io = require("socket.io-client");
const socket = io(":5000/socket");

socket.on("connect", () => {
    console.log('connected', socket.id);
});
socket.on("disconnect", () => {
    console.log('disconnected', socket.id);
});

new Game({
    canvas: document.getElementById('canvas'),
    socket
}).start();
