import { strict as assert } from 'assert';
import 'mocha';
import { Character } from './character';
import { Game } from './game';
import { GameMap } from './map';

describe('game', () => {
	it('can create', () => {
		const map = new GameMap()
		const game = new Game(map)
		assert.notEqual(game, null)
	})

	it('add char', () => {
		const map = new GameMap()
		const game = new Game(map)

		const char = new Character(1, 1, 100, 10)
		game.addChar(char)

		assert.equal(game._chars.length, 1)
	})

	it('add more chars', () => {
		const map = new GameMap()
		const game = new Game(map)

		const char1 = new Character(1, 1, 100, 10)
		game.addChar(char1)
		const char2 = new Character(1, 1, 100, 10)
		game.addChar(char2)
		const char3 = new Character(1, 1, 100, 10)
		game.addChar(char3)

		assert.equal(game._chars.length, 3)
		assert.equal(game._chars[0], char1)
		assert.equal(game._chars[1], char2)
		assert.equal(game._chars[2], char3)
	})

	it('remove char', () => {
		const map = new GameMap()
		const game = new Game(map)

		const char1 = new Character(1, 1, 100, 10)
		game.addChar(char1)
		const char2 = new Character(1, 1, 100, 10)
		game.addChar(char2)
		const char3 = new Character(1, 1, 100, 10)
		game.addChar(char3)

		game._currentPosition = 2

		game.removeChar(char1)
		assert.equal(game._chars.length, 2)
		assert.equal(game._currentPosition, 1)
		assert.equal(game._chars[0], char2)
		assert.equal(game._chars[1], char3)
	})

	it('finish turn', () => {
		const map = new GameMap()
		const game = new Game(map)

		const char1 = new Character(1, 1, 100, 10)
		game.addChar(char1)
		const char2 = new Character(1, 1, 100, 10)
		game.addChar(char2)
		const char3 = new Character(1, 1, 100, 10)
		game.addChar(char3)

		game.finishTurn()
		assert.equal(game._currentPosition, 1)
		game.finishTurn()
		assert.equal(game._currentPosition, 2)
		game.finishTurn()
		assert.equal(game._currentPosition, -1)
		game.finishTurn()
		assert.equal(game._currentPosition, 0)
	})
})