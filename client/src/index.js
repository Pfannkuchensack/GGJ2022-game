import './main.scss';
import Game from "./Game";

const io = require("socket.io-client");

window.addEventListener('load', ()=>{
	'use strict';

	var socket = io.connect('ws://localhost:8010', { reconnect: true, transports: ['websocket'], forceNew: true });
	socket.on('connect', function (data) {
		socket.emit('go', { gameid: 'test', charid: 'test1'});
	});

	socket.on('game', function (data) {
		const json = JSON.parse(data);
		console.log(data);
	});

	socket.on('debug', function (data) {
		console.log(data);
	});

	document.getElementById('test').addEventListener('click', ()=>{
		// alex hier spass haben darf
		console.log('i clicked UwU');
		socket.emit('game', { gameid: 'test', charid: 'test1'});
	});

	new Game({
		canvas: document.getElementById('canvas'),
		socket
	}).start();

});