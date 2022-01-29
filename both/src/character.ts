import { Tile } from './tile'

export type Attack = {
    repeats: number;
    damage: number;
}

export type AttacksConfig = {
    [key: string]: Attack;
}

export type BattleHistory = {
    attacker: BattleParticipant;
    defender: BattleParticipant;
    damage: number;
    isDefenderDead: boolean;
}

export type BattleLog = {
    isDryRun: boolean;
    history: BattleHistory[];
    challenger: BattleParticipant;
    challenged: BattleParticipant;
}

export type BattleParticipant = {
    char: Character;
    tile: Tile;
    attack: Attack;
    health: number;
    remainingRepetitions: number;
}

export class Character {
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
    // position
    _q: number;
    _r: number;

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
        this._q = 0;
        this._r = 0;
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

    set movePoints(movePoints: number) {
        this._movePoints = movePoints;
    }

    get position(): { q: number, r: number } {
        return { q: this._q, r: this._r }
    }

    setPosition(q: number, r: number) {
        this._q = q;
        this._r = r;
    }

    equalPosition(pos: { q: number, r: number }): boolean {
        return (this._q === pos.q && this._r === pos.r)
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
        if (this._itemNames.length >= 6) {
            return false
        }

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

    get defendAttackName(): string | null {
        if (this.attacks.length == 0) {
            return null
        }

        return this.attacks[0]
    }

    attackChar(attackName: string, tile: Tile, otherChar: Character, otherCharTile: Tile, dryRun: boolean, config: { attacks: AttacksConfig }): BattleLog {
        const challenger = {
            char: this,
            tile: tile,
            attack: config.attacks[attackName],
            health: this.hp,
            remainingRepetitions: config.attacks[attackName].repeats
        }

        const challengedAttackname = otherChar.defendAttackName
        let challengedAttack = {
            repeats: 0,
            damage: 0
        } as Attack

        if (challengedAttackname != null) {
            challengedAttack = config.attacks[challengedAttackname]
        }

        const challenged = {
            char: otherChar,
            tile: otherCharTile,
            attack: config.attacks[otherChar.attacks[0]],
            health: otherChar.hp,
            remainingRepetitions: challengedAttack.repeats
        }

        const maxRounds = challenger.remainingRepetitions + challenged.remainingRepetitions;

        const history = [] as BattleHistory[];

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
            isDryRun: dryRun,
            history: history,
            challenger: challenger,
            challenged: challenged,
        };
    }

    _calcTurn(attacker: BattleParticipant, defender: BattleParticipant): number {
        const damage = attacker.attack.damage;

        // todo: add level
        // todo: add resistance
        // todo: add item stuff to attack
        // todo: add tile defense bonus

        defender.health -= damage;
        attacker.remainingRepetitions--;

        return damage;
    }
}