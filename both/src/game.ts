import { AttacksConfig, BattleLog, Character } from './character';
import { GameMap } from './map';

export class Game {
	_chars: Character[];
	_currentPosition: number;
	_map: GameMap;

	constructor(map: GameMap) {
		this._chars = [];
		this._currentPosition = 0;
		this._map = map;
	}

	get currentChar(): Character {
		return this._chars[this._currentPosition]
	}

	get isAITurn(): boolean {
		return this._currentPosition === -1
	}

	finishTurn() {
		this._currentPosition++;

		if (this._currentPosition >= this._chars.length) {
			this._currentPosition = -1;
		}
	}

	addChar(char: Character) {
		this._chars.push(char)
		this._map.addChar(char)
	}

	removeChar(char: Character) {
		const indexOf = this._chars.indexOf(char);
		if (indexOf !== -1) {
			this._chars.splice(indexOf, 1);
		}

		this._map.removeChar(char)

		// remove char before current char
		if (indexOf < this._currentPosition) {
			this._currentPosition--;
		}
	}

	moveChar(char: Character, nextPos: { q: number, r: number }): boolean {
		const indexOf = this._chars.indexOf(char);

		// not your turn!
		if (indexOf !== this._currentPosition) {
			return false
		}

		if (!this._map.isPositionFree(nextPos)) {
			return false
		}

		const neededMovepoints = this._map.neededMovepoints(nextPos)
		if (neededMovepoints === 0) {
			return false
		}

		if (char.movePoints < neededMovepoints) {
			return false
		}

		// todo: is field neighboring?

		char.movePoints = char.movePoints - neededMovepoints;
		char.setPosition(nextPos.q, nextPos.r);

		return true
	}

	attackChar(challenger: Character, challengerAttackName: string, challenged: Character, config: { attacks: AttacksConfig }): BattleLog | null {
		const indexOf = this._chars.indexOf(challenger);

		// not your turn!
		if (indexOf !== this._currentPosition) {
			return null
		}

		// todo: check range

		// get ground informations
		const challengerTile = this._map.getTile(challenger.position)
		const challengedTile = this._map.getTile(challenged.position)

		return challenger.attackChar(challengerAttackName, challengerTile, challenged, challengedTile, false, config)
	}
}