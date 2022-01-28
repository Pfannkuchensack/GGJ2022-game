class Tile {

    constructor(name, movementCost, defenseBonus) {
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