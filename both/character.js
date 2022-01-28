class Character {
    constructor(level, xp, hp, movePoints) {
        this._level = level;
        this._xp = xp;
        this._hp = hp;
        this._movePoints = movePoints;
        this._baseResistance = {
            blade: 0,
            impact: 0,
            pierce: 0,
            cold: 0,
            fire: 0,
            arcane: 0
        };
        this._attacks = [];
        this._items = [];
    }

    get xp() {
        return this._xp;
    }

    get level() {
        return this._level;
    }

    get hp() {
        // todo: add items bonus
        return this._hp;
    }

    get movePoints() {
        // todo: add items bonus
        return this._movePoints;
    }

    get resistance() {
        // todo: add items bonus
        return {
            blade: this._baseResistance,
            impact: this._baseResistance,
            pierce: this._baseResistance,
            cold: this._baseResistance,
            fire: this._baseResistance,
            arcane: this._baseResistance
        };
    }

    get attacks() {
        return this._attacks;
    }

    get items() {
        return this._items;
    }

    addItem(itemName) {
        this._items.push(itemName);
        return true;
    }

    removeItem(itemName) {
        const indexOf = this._items.indexOf(itemName);
        if (indexOf !== -1) {
            this._items.splice(indexOf, 1);
            return true;
        }

        return false;
    }

    attackChar(attack, otherChar) {
        // from config
        // -> attack
        const selectedAttack = {
            repeats: 5
        };
        // otherChar select attack (anzahl * damage * trefferchance)
        // -> from config
        const otherCharAttack = {
            repeats: 3
        };

        const challenger = {
            char: this,
            attack: selectedAttack,
            health: this.hp,
            remainingRepetitions: selectedAttack.repeats
        }

        const challenged = {
            char: otherChar,
            attack: otherCharAttack,
            health: otherChar.hp,
            remainingRepetitions: otherCharAttack.repeats
        }

        const maxRounds = Math.max(challenger.remainingRepetitions, challenged.remainingRepetitions);

        const history = [];

        let turn = "self";
        for (let round = 1; round <= maxRounds; round++) {
            let hpDiff = 0;

            if (turn === "self") {
                hpDiff = this._calc(challenger, challenged)
                history.push({
                    attacker: challenger,
                    defender: challenged,
                    damage: hpDiff,
                    defenderDead: ((challenger)),
                })
            } else {
                hpDiff = this._calc(challenged, challenger)
                history.push({
                    attacker: challenged,
                    defender: challenger,
                    damage: hpDiff,
                    defenderDead: (()),
                })
            }


            if (turn === "self") {
                turn = "opposite"
            } else {
                turn = "self"
            }
        }

        return history
        // charA "schwert" -> charB
        // wiederholungen: charA 3 / charB 5
        // w1: charA -> charB -> hp abgezogen
        // w1: charB -> charA -> hp abgezogen
        // w2: charA -> charB -> hp abgezogen
        // w2: charB -> charA -> hp abgezogen
        // w3: charA -> charB -> hp abgezogen
        // w3: charB -> charA -> hp abgezogen
        // w4: charB -> charA -> hp abgezogen
        // w5: charB -> charA -> hp abgezogen
    }
}