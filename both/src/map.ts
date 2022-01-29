// cube coordinates

import { Character } from "./character";
import { Tile, TileStore } from "./tile";

export class GameMap {
	_chars: Character[];
	_tiles: TileStore;

	constructor() {
		this._chars = [] as Character[];
		this._tiles = [];

		const size = 8;

		for (let x = 0; x <= size; x++) {
			this._tiles[x] = [];
			for (let y = 0; y <= size; y++) {
				this._tiles[x][y] = new Tile("grass", 1, 0, x, y);
			}
		}
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

	getTile(pos: { q: number, r: number }): Tile | undefined {
		if (pos.q < 0 || pos.q >= this._tiles.length || pos.r < 0 || pos.r >= this._tiles[pos.q].length) {
			return undefined
		}
		return this._tiles[pos.q][pos.r];
	}

	get tileStore(): TileStore {
		return this._tiles;
	}

	addChar(char: Character) {
		this._chars.push(char)
	}

	getCharAt(q: number, r: number): Character | undefined {
		for (let index = 0; index < this._chars.length; index++) {
			if (this._chars[index].equalPosition({q:q, r:r})) {
				return this._chars[index]
			}
		}

		return undefined;
	}

	get chars(): Character[] {
		return this._chars
	}

	updateChar(char: Character) {
		const indexOf = this._chars.indexOf(char);
		if (indexOf !== -1) {
			this._chars[indexOf] = char;
			console.log(this._chars);
		}
	}

	removeChar(char: Character) {
		const indexOf = this._chars.indexOf(char);
		if (indexOf !== -1) {
			this._chars.splice(indexOf, 1);
		}
	}
}