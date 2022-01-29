export class Tile {
    _name: string;
    _movementCost: number;
    _defenseBonus: number;

    constructor(name: string, movementCost: number, defenseBonus: number) {
        this._name = name;
        this._movementCost = movementCost;
        this._defenseBonus = defenseBonus;
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

}