export class Tile {
    _name: string;
    _movementCost: number;
    _defenseBonus: number;
	_q: number;
	_r: number;

    constructor(name: string, movementCost: number, defenseBonus: number, q: number, r: number) {
        this._name = name;
        this._movementCost = movementCost;
        this._defenseBonus = defenseBonus;
		this._q = q;
		this._r = r;
    }
    
    get name() {
        return this._name;
    }

    get movementCost() {
        return this._movementCost;
    }

    get defenseBonus() {
        return this._defenseBonus;
    }

    get position(): { q: number, r: number } {
        return { q:this._q, r:this._r }
    }

}

export type TileStore = Tile[][]