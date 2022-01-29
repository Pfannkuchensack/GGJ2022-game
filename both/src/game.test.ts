import { strict as assert } from 'assert';
import 'mocha';
import { Character } from './character';
import { Game } from './game';
import { GameMap } from './map';

describe('game', () => {
	it('can create', () => {
		const map = new GameMap()
		const game = new Game('gameId', map)
		assert.notEqual(game, null)
	})

	describe('char managment', () => {
		it('add char', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char = new Character('charId', 1, 1, 100, 10)
			game.addChar(char)

			assert.equal(game._chars.length, 1)
		})

		it('add more chars', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)
			const char3 = new Character('char3', 1, 1, 100, 10)
			game.addChar(char3)

			assert.equal(game._chars.length, 3)
			assert.equal(game._chars[0], char1)
			assert.equal(game._chars[1], char2)
			assert.equal(game._chars[2], char3)
		})

		it('remove char', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)
			const char3 = new Character('char3', 1, 1, 100, 10)
			game.addChar(char3)

			game._currentPosition = 2

			game.removeChar(char1)
			assert.equal(game._chars.length, 2)
			assert.equal(game._currentPosition, 1)
			assert.equal(game._chars[0], char2)
			assert.equal(game._chars[1], char3)
		})
	})

	describe('moveing', () => {
		it('not your turn', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			char1.setPosition(1, 1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)

			game._currentPosition = 0;

			const isSuccess = game.moveChar(char2, { q: 10, r: 10 })
			assert.equal(isSuccess, false, "not players turn!")
			assert.deepEqual(char2.position, { q: 0, r: 0 })
		})

		it('your turn', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			char1.setPosition(1, 1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)

			game._currentPosition = 0;

			const isSuccess = game.moveChar(char1, { q: 2, r: 1 })
			assert.equal(isSuccess, true, "players turn!")
			assert.deepEqual(char1.position, { q: 2, r: 1 })
		})

		it('not a neighbor field', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			char1.setPosition(1, 1)

			game._currentPosition = 0;

			const isSuccess = game.moveChar(char1, { q: 5, r: 1 })
			assert.equal(isSuccess, false, "detect neighbor field")
			assert.deepEqual(char1.position, { q: 1, r: 1 })
		})
	})

	describe('attack', () => {
		const config = {
			attacks: {
				"attack1": {
					damage: 10,
					repeats: 0
				},
				"attack2": {
					damage: 2,
					repeats: 10
				}
			}
		}

		it('not your turn', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			char1.setPosition(1, 1)
			char1._attackNames.push("attack1")
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)
			char2._attackNames.push("attack2")

			game._currentPosition = 0;

			const battleLog = game.attackChar(char2, "attack2", char1, config)
			assert.equal(battleLog, null, "not players turn!")
			assert.deepEqual(char2.position, { q: 0, r: 0 })
		})

		it('your turn', () => {
			const map = new GameMap()
			const game = new Game('gameId', map)

			const char1 = new Character('char1', 1, 1, 100, 10)
			game.addChar(char1)
			char1.setPosition(1, 1)
			char1._attackNames.push("attack1")
			const char2 = new Character('char2', 1, 1, 100, 10)
			game.addChar(char2)
			char2._attackNames.push("attack2")

			game._currentPosition = 0;

			const battleLog = game.attackChar(char1, "attack1", char2, config)
			assert.notEqual(battleLog, null)
			if (battleLog != null) {
				assert.equal(battleLog.history.length > 0, true, "players turn!")
			}
		})
	})

	it('finish turn', () => {
		const map = new GameMap()
		const game = new Game('gameId', map)

		const char1 = new Character('char1', 1, 1, 100, 10)
		game.addChar(char1)
		const char2 = new Character('char2', 1, 1, 100, 10)
		game.addChar(char2)
		const char3 = new Character('char3', 1, 1, 100, 10)
		game.addChar(char3)

		game.finishTurn(char1)
		assert.equal(game._currentPosition, 1)
		game.finishTurn(char2)
		assert.equal(game._currentPosition, 2)
		game.finishTurn(char3)
		assert.equal(game._currentPosition, 0)
	})
})