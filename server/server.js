var express = require('express');
var fs = require('fs');
//    https =      require('https'),
var http = require('http');
/* var server = https.createServer({
				key: fs.readFileSync('/etc/letsencrypt/live/DOMAIN/privkey.pem'),
				cert: fs.readFileSync('/etc/letsencrypt/live/DOMAIN/cert.pem'),
		ca: fs.readFileSync('/etc/letsencrypt/live/DOMAIN/chain.pem'),
		requestCert: false, rejectUnauthorized: false
				},app); */
var app = express();
var server = http.createServer(app);
var dotenv = require('dotenv').config();
var crypto = require('crypto');
var clients = [];
/* Besseres logging */
var log = function () { return console.log.apply(console, ['[' + new Date().toISOString().slice(11, -5) + ']'].concat(Array.prototype.slice.call(arguments))); };

/* redis + socket.io */
const redis = require('redis');
const io = require('socket.io')(server);
const { argv } = require('process');
server.listen(8010);
log('Starte Websocket Server');

process.on('uncaughtException', function (e) {
	log(e);
	process.exit(1);
});

/* alle 15 Sekunden Auslatung posten */
setInterval(countuser, 15000);
function countuser() {
	log('Auslastung: ' + Object.keys(clients).length + ' User');
}
const RetryStrategy = function (options) {
	if (options.error && (options.error.code === 'ECONNREFUSED' || options.error.code === 'NR_CLOSED')) {
		// Try reconnecting after 5 seconds
		log('The server refused the connection. Retrying connection...');
		return 5000;
	}
	if (options.total_retry_time > 1000 * 60 * 60) {
		// End reconnecting after a specific timeout and flush all commands with an individual error
		return new Error('Retry time exhausted');
	}
	if (options.attempt > 50) {
		// End reconnecting with built in error
		log('Redis Server 50 Times');
		return undefined;
	}
	// reconnect after
	return Math.min(options.attempt * 100, 3000);
}
const redisClient = redis.createClient({ host: '127.0.0.1', port: 6379, retry_strategy: RetryStrategy, lazyConnect: true, retry_unfulfilled_commands: true });
const redispub = redis.createClient({ host: '127.0.0.1', port: 6379, retry_strategy: RetryStrategy, lazyConnect: true, retry_unfulfilled_commands: true });
//redisClient.auth(process.env.REDIS_PASSWORD); // Nicht nötig local
redisClient.connect();
redispub.connect();




io.on('connection', function (socket) {
	// var hostname = socket.handshake.headers.host.toLowerCase();
	socket.on('go', function (data) {
		redisClient.subscribe('game:' + data.gameid, (message, channelName) => {
			//console.info(message, channelName);
			redispub.publish('game:' + clients[socket.id].lobby, JSON.stringify(message));
		});
		//redisClient.addListener('message', NewMsg);

		clients[socket.id] = { socket: socket.id, lobby: data.gameid, charId: data.charid };
		log('Neuer Client', socket.id, data);
	});

	socket.on('game', function (message) {
		console.log('game:' + clients[socket.id].lobby, JSON.stringify(message));
	});

	socket.on('disconnect', reason => {
		delete clients[socket.id];
		//redisClient.removeListener('message', NewMsg);
		// @TODO: Prüfen ob noch jemand anders in der Lobby ist fehlt hier noch
		//redisClient.unsubscribe('gamey:' + socket.lobby);
	});

	function NewMsg(channel, message) {
		if (channel == 'game:' + clients[socket.id].lobby) {
			try {
				const obj = JSON.parse(message);
				if (obj.charId !== clients[socket.id].charid) {
					socket.emit('game', message);
					//log(message);
				}
			} catch (error) {
				log(error);
			}
		}
	}
});