import { AttacksConfig, BattleLog, Character } from './character';
import { GameMap } from './map';

export class Game {
	_gameId: string;
	_chars: Character[];
	_currentPosition: number;
	_map: GameMap;

	constructor(gameId: string, map: GameMap) {
		this._chars = [];
		this._currentPosition = 0;
		this._map = map;
		this._gameId = gameId;
	}

	get currentChar(): Character | undefined {
		return this._chars[this._currentPosition]
	}

	get isAITurn(): boolean {
		return this._currentPosition === -1
	}

	finishTurn(char: Character): boolean {
		if (this.isAITurn) {
			this._currentPosition++;
			return true;
		}

		if (this.currentChar === undefined || this.currentChar.id !== char.id) {
			return false
		}

		this._currentPosition++;

		if (this._currentPosition >= this._chars.length) {
			this._currentPosition = 0;

			// todo: set currentPosition to -1 to activate KI move phase
		}

		if (this.currentChar.isDead) {
			return this.finishTurn(this.currentChar)
		}

		return true
	}

	addChar(char: Character) {
		this._chars.push(char)
		this._map.addChar(char)
	}

	getChar(charId: string): Character | undefined {
		for (let index = 0; index < this._chars.length; index++) {
			if (this._chars[index].id === charId) {
				return this._chars[index]
			}
		}

		return undefined
	}

	get chars(): Character[] {
		return this._chars
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
			console.log('not your turn!');
			return false
		}

		if (!this._map.isPositionFree(nextPos)) {
			console.log('position not free!');
			return false
		}

		const neededMovepoints = this._map.neededMovepoints(nextPos)
		if (neededMovepoints === 0) {
			console.log('not possible to move!');
			return false
		}

		if (char.currentMovePoints < neededMovepoints) {
			console.log('not enough movepoints!');
			return false
		}


		if (!this.isNeighbor(char.position, nextPos)) {
			//console.log('field not neighboring!');
			return false;
		}

		// face direction
		const vectorX = nextPos.q - char.position.q;
		const vectorY = nextPos.r - char.position.r;
		char.setDirection(vectorX, vectorY);

		char.currentMovePoints = char.currentMovePoints - neededMovepoints;
		char.setPosition(nextPos.q, nextPos.r);

		return true
	}

	attackChar(challenger: Character, challengerAttackName: string, challenged: Character, config: { attacks: AttacksConfig }): BattleLog | null {
		const indexOf = this._chars.indexOf(challenger);

		// not your turn!
		if (indexOf !== this._currentPosition) {
			return null
		}

		if (challenger.isDead || challenged.isDead || challenger.remainingAttacks <= 0) {
			return null;
		}

		if (!this.isNeighbor(challenger.position, challenged.position)) {
			return null;
		}

		// get ground informations
		const challengerTile = this._map.getTile(challenger.position)
		const challengedTile = this._map.getTile(challenged.position)
		if (challengerTile === undefined || challengedTile === undefined) {
			return null;
		}

		return challenger.attackChar(challengerAttackName, challengerTile, challenged, challengedTile, false, config)
	}

	isNeighbor(posA: { q: number, r: number }, posB: { q: number, r: number }): boolean {
		const neighborPositions = [
			[-1, -1],
			[0, -1],
			[1, -1],
			[1, 0],
			[1, 1],
			[0, 1],
			[-1, 1],
			[-1, 0],
		] as number[][]

		for (let index = 0; index < neighborPositions.length; index++) {
			const neighbor = neighborPositions[index];

			if (posB.q === posA.q + neighbor[0] && posB.r === posA.r + neighbor[1]) {
				return true
			}
		}

		return false
	}
}