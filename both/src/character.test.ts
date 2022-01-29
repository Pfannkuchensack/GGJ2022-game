import { strict as assert } from 'assert';
import 'mocha';
import { Attack, AttacksConfig, BattleParticipant, Character } from './character';
import { Tile } from './tile';

describe('character', () => {
	it('can create', () => {
		const char = new Character('charId', 10, 10, 10, 10);
		assert.equal(char._level, 10)
		assert.equal(char._xp, 10)
		assert.equal(char._hp, 10)
		assert.equal(char._baseMovePoints, 10)
	})

	it('getter', () => {
		const char = new Character('charId', 10, 10, 10, 10);
		assert.equal(char.level, 10)
		assert.equal(char.xp, 10)
		assert.equal(char.hp, 10)
		assert.equal(char._baseMovePoints, 10)
	})

	describe('position', () => {
		it('set position', () => {
			const char = new Character('charId', 10, 10, 10, 10);
			char.setPosition(10, 5)
			assert.equal(char._q, 10)
			assert.equal(char._r, 5)
			assert.deepEqual(char.position, { q: 10, r: 5 })
		})
		it('equal position', () => {
			const char = new Character('charId', 10, 10, 10, 10);
			assert.equal(char.equalPosition({ q: 0, r: 0 }), true)
			char.setPosition(10, 5)
			assert.equal(char.equalPosition({ q: 10, r: 5 }), true)
		})
	})

	describe('items', () => {
		it('add a item', () => {
			const char = new Character('charId', 10, 10, 10, 10);
			const success = char.addItem("item1")
			assert.equal(success, true)
			assert.equal(char._itemNames.length, 1)

			// getter
			assert.equal(char.items.length, 1)
		})
		it('add to much item', () => {
			const char = new Character('charId', 10, 10, 10, 10);
			char.addItem("item1")
			char.addItem("item2")
			char.addItem("item3")
			char.addItem("item4")
			char.addItem("item5")
			char.addItem("item6")
			assert.equal(char._itemNames.length, 6)

			const success = char.addItem("item7")
			assert.equal(success, false)
			assert.equal(char._itemNames.length, 6)
		})
		it('remove a item', () => {
			const char = new Character('charId', 10, 10, 10, 10);
			char.addItem("item1")
			char.addItem("item2")
			char.addItem("item3")
			char.addItem("item4")
			char.addItem("item5")
			char.addItem("item6")
			assert.equal(char._itemNames.length, 6)

			const success = char.removeItem("item4")
			assert.equal(success, true)
			assert.equal(char._itemNames.length, 5)
		})
	})

	describe('attack', () => {
		describe('defend attack', () => {
			it('select', () => {
				const attackerChar = new Character('charId', 10, 10, 10, 10);
				attackerChar._attackNames.push("attack1")

				assert.equal(attackerChar.defendAttackName, "attack1")
			})

			it('no attack found', () => {
				const attackerChar = new Character('charId', 10, 10, 10, 10);

				assert.equal(attackerChar.defendAttackName, null)
			})
		})

		it('calc turn', () => {
			const attackerChar = new Character('charId', 10, 10, 10, 10);
			const attackerAttack = {
				repeats: 5,
				damage: 5,
			} as Attack
			const defenderChar = new Character('charId', 10, 10, 10, 10);
			const defenderAttack = {
				repeats: 5,
				damage: 5,
			} as Attack

			const attacker = {
				char: attackerChar,
				attack: attackerAttack,
				health: attackerChar.hp,
				remainingRepetitions: attackerAttack.repeats,
			} as BattleParticipant
			const defender = {
				char: defenderChar,
				attack: defenderAttack,
				health: defenderChar.hp,
				remainingRepetitions: defenderAttack.repeats,
			} as BattleParticipant

			const damage = attackerChar._calcTurn(attacker, defender)

			assert.equal(damage, 5)
			assert.equal(defender.health, defenderChar.hp - attackerAttack.damage)
			assert.equal(attacker.remainingRepetitions, attackerAttack.repeats - 1)
		})

		it('no dry run, one char dead', () => {
			const config = {
				attacks: {
					"attack1": {
						repeats: 5,
						damage: 5,
					},
					"attack2": {
						repeats: 5,
						damage: 5,
					}
				} as AttacksConfig
			}

			const attackerChar = new Character('charId', 10, 10, 10, 10);
			attackerChar._attackNames.push("attack1")
			const tile = new Tile("gras", 1, 0, 10, 10)

			const defenderChar = new Character('charId', 10, 10, 10, 10);
			defenderChar._attackNames.push("attack2")
			const defenderCharTile = new Tile("gras", 1, 0, 11, 10)

			const result = attackerChar.attackChar("attack1", tile, defenderChar, defenderCharTile, false, config)
			// history check, stop if one char is dead
			assert.equal(result.history.length, 3, "too few moves")

			// result
			assert.equal(result.challenger.health, 5)
			assert.equal(result.challenged.health, 0)

			// char check
			assert.equal(attackerChar.hp, 5, "attacker hp wrong")
			assert.equal(defenderChar.hp, 0, "defender hp wrong")
		})

		it('no dry run, no char dead', () => {
			const config = {
				attacks: {
					"attack1": {
						repeats: 5,
						damage: 1,
					},
					"attack2": {
						repeats: 5,
						damage: 1,
					}
				} as AttacksConfig
			}

			const attackerChar = new Character('charId', 10, 10, 10, 10);
			attackerChar._attackNames.push("attack1")
			const attackerTile = new Tile("gras", 1, 0, 10, 10)

			const defenderChar = new Character('charId', 10, 10, 10, 10);
			defenderChar._attackNames.push("attack2")
			const defenderTile = new Tile("gras", 1, 0, 11, 10)

			const result = attackerChar.attackChar("attack1", attackerTile, defenderChar, defenderTile, false, config)
			// history check, stop if one char is dead
			assert.equal(result.history.length, 10, "too few moves")

			// result
			assert.equal(result.challenger.health, 5)
			assert.equal(result.challenged.health, 5)

			// char check
			assert.equal(attackerChar.hp, 5, "attacker hp wrong")
			assert.equal(defenderChar.hp, 5, "defender hp wrong")
		})
	})
})