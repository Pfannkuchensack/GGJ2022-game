import { Character } from './character';
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
	}

	removeChar(char: Character) {
		const indexOf = this._chars.indexOf(char);
		if (indexOf !== -1) {
			this._chars.splice(indexOf, 1);
		}

		// remove char before current char
		if (indexOf < this._currentPosition) {
			this._currentPosition--;
		}
	}

	// todo: from? to?
	moveChar(char: Character): boolean {
		const indexOf = this._chars.indexOf(char);

		// not your turn!
		if (indexOf == this._currentPosition) {
			return false
		}

		// is movable?
		// distance? / movepoints?

		return true
	}
}