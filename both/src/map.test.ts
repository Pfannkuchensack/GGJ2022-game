import { strict as assert } from 'assert';
import 'mocha';
import { Character } from './character';
import { GameMap } from './map';

describe('map', () => {
	it('can create', () => {
		const map = new GameMap()
		assert.notEqual(map, null)
	})

	describe('is position free', () => {
		it('yes', () => {
			const map = new GameMap()

			const char = new Character('charId', 1, 1, 100, 10)
			map.addChar(char)
			char.setPosition(5, 5)

			assert.equal(map.isPositionFree({ q: 10, r: 10 }), true)
		})

		it('no', () => {
			const map = new GameMap()

			const char = new Character('charId', 1, 1, 100, 10)
			map.addChar(char)
			char.setPosition(10, 10)

			assert.equal(map.isPositionFree({ q: 10, r: 10 }), false)
		})
	})

	describe('char managment', () => {
		it('add char', () => {
			const map = new GameMap()

			const char = new Character('charId', 1, 1, 100, 10)
			map.addChar(char)

			assert.equal(map._chars.length, 1)
		})

		it('add more chars', () => {
			const map = new GameMap()

			const char1 = new Character('char1', 1, 1, 100, 10)
			map.addChar(char1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			map.addChar(char2)
			const char3 = new Character('char3', 1, 1, 100, 10)
			map.addChar(char3)

			assert.equal(map._chars.length, 3)
			assert.equal(map._chars[0], char1)
			assert.equal(map._chars[1], char2)
			assert.equal(map._chars[2], char3)
		})

		it('remove char', () => {
			const map = new GameMap()

			const char1 = new Character('char1', 1, 1, 100, 10)
			map.addChar(char1)
			const char2 = new Character('char2', 1, 1, 100, 10)
			map.addChar(char2)
			const char3 = new Character('char3', 1, 1, 100, 10)
			map.addChar(char3)

			map.removeChar(char1)
			assert.equal(map._chars.length, 2)
			assert.equal(map._chars[0], char2)
			assert.equal(map._chars[1], char3)
		})
	})

	describe('needed movepoints', () => {
		it('tile found', () => {
			const map = new GameMap()
			assert.equal(map.neededMovepoints({ q: 5, r: 5 }), 1)
		})

		it('tile not found', () => {
			const map = new GameMap()
			assert.equal(map.neededMovepoints({ q: 5, r: 5000 }), 0)
		})
	})
})