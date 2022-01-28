class Character {
    _level: number;
    _xp: number;
    _hp: number;
    _movePoints: number;
    _baseResistance: {
        blade: number,
        impact: number,
        pierce: number,
        cold: number,
        fire: number,
        arcane: number
    };
    _attackNames: string[];
    _itemNames: string[];

    constructor(level: number, xp: number, hp: number, movePoints: number) {
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
        this._attackNames = [];
        this._itemNames = [];
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
        return this._attackNames;
    }

    get items() {
        return this._itemNames;
    }

    addItem(itemName: string) {
        this._itemNames.push(itemName);
        return true;
    }

    removeItem(itemName: string) {
        const indexOf = this._itemNames.indexOf(itemName);
        if (indexOf !== -1) {
            this._itemNames.splice(indexOf, 1);
            return true;
        }

        return false;
    }

    attackChar(attackName: string, otherChar: Character) {
        // from config
        // -> attack
        const selectedAttack = {
            repeats: 5,
            damage: 5
        };
        // otherChar select attack (anzahl * damage * trefferchance)
        // -> from config
        const otherCharAttack = {
            repeats: 3,
            damage: 5
        };
        // todo: add item stuff

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
            let isDefenderDead = false;
            
            if (turn === "self") {
                hpDiff = this._calcTurn(challenger, challenged);

                isDefenderDead = (challenged.health <= 0);

                history.push({
                    attacker: challenger,
                    defender: challenged,
                    damage: hpDiff,
                    isDefenderDead: isDefenderDead,
                });

                // does the other side still have repetitions?
                if (challenged.remainingRepetitions > 0) {
                    turn = "opposite";
                }
            } else {
                hpDiff = this._calcTurn(challenged, challenger);

                isDefenderDead = (challenger.health <= 0);

                history.push({
                    attacker: challenged,
                    defender: challenger,
                    damage: hpDiff,
                    isDefenderDead: isDefenderDead,
                })

                // does the other side still have repetitions?
                if (challenger.remainingRepetitions > 0) {
                    turn = "self";
                }
            }

            if (isDefenderDead) {
                break;
            }
        }

        return history;
    }

    _calcTurn(attacker: { remainingRepetitions: number, attack: { damage: number } }, defender: { health: number }) {
        const damage = attacker.attack.damage;

        // todo: add level
        // todo: add resistance

        defender.health = damage;
        attacker.remainingRepetitions--;

        return damage;
    }
}