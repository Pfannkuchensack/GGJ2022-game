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

    addItem(itemName: string): boolean {
        this._itemNames.push(itemName);
        return true;
    }

    removeItem(itemName: string): boolean {
        const indexOf = this._itemNames.indexOf(itemName);
        if (indexOf !== -1) {
            this._itemNames.splice(indexOf, 1);
            return true;
        }

        return false;
    }

    attackChar(attackName: string, otherChar: Character, dryRun: boolean, config: { attacks: { [key: string]: { repeats: number, damage: number } } }) {
        const challenger = {
            char: this,
            attack: config[attackName],
            health: this.hp,
            remainingRepetitions: config[attackName].repeats
        }

        const challenged = {
            char: otherChar,
            attack: config[otherChar.attacks[0]],
            health: otherChar.hp,
            remainingRepetitions: config[otherChar.attacks[0]].repeats
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

        if (!dryRun) {
            challenger.char._hp = Math.max(0, challenger.health)
            challenged.char._hp = Math.max(0, challenged.health)            
        }

        return {
            history: history,
            challenger: challenger,
            challenged: challenged,
        };
    }

    _calcTurn(attacker: { remainingRepetitions: number, attack: { damage: number } }, defender: { health: number }): number {
        const damage = attacker.attack.damage;

        // todo: add level
        // todo: add resistance
        // todo: add item stuff to attack

        defender.health = damage;
        attacker.remainingRepetitions--;

        return damage;
    }
}