import './main.scss';
import Game from "./Game";

const io = require("socket.io-client");

window.addEventListener('load', ()=>{
	'use strict';

	var socket = io.connect('ws://localhost:8010', { reconnect: true, transports: ['websocket'], forceNew: true });
	socket.on('connect', function (data) {
		socket.emit('join', { gameid: 'test'});
	});

	socket.on('game', function (data) {
		const json = JSON.parse(data);
		console.log(data);
	});

	socket.on('debug', function (data) {
		console.log(data);
	});

	document.getElementById('test').addEventListener('click', ()=>{
		socket.emit('game', { gameid: 'test', charid: 'test1', actiontype: 'createChar', data: { name: 'TestDerErste', resistance: 'hallo', attack: 'attack1' } });
	});

	document.getElementById('test2').addEventListener('click', ()=>{
		socket.emit('game', { gameid: 'test', charid: 'test1', actiontype: 'move', data: { q: document.getElementById('q').value, r: document.getElementById('r').value} });
	});
	
	document.getElementById('test3').addEventListener('click', ()=>{
		socket.emit('game', { gameid: 'test', charid: 'test1', actiontype: 'finishturn', data: {} });
	});

	new Game({
		canvas: document.getElementById('canvas'),
		socket
	}).start();

});