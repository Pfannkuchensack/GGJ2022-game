// cube coordinates

import { Character } from "./character";
import { Tile } from "./tile";

export class GameMap {
	_chars: Character[];

	constructor() {
		this._chars = [] as Character[];
	}

	isPositionFree(pos: { q: number, r: number }): boolean {
		for (let index = 0; index < this._chars.length; index++) {
			if (this._chars[index].equalPosition(pos)) {
				return false
			}
		}
		return true
	}

	// neededMovepoints return 0 if not possible to move on this tile
	neededMovepoints(pos: { q: number, r: number }): number {
		// todo: check tile

		return 1;
	}

	getTile(pos: { q: number, r: number }): Tile {
		// todo: search tile
		return new Tile("plane", 1, 0)
	}

	addChar(char: Character) {
		this._chars.push(char)
	}

	removeChar(char: Character) {
		const indexOf = this._chars.indexOf(char);
		if (indexOf !== -1) {
			this._chars.splice(indexOf, 1);
		}
	}
}