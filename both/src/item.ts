import {Sound} from './sound';

export type Resistance = {
    blade: number,
    impact: number,
    pierce: number,
    cold: number,
    fire: number,
    arcane: number
};

export class Item{
    _name: string;
    _resistance: Resistance;
    _sound: Sound

    constructor(name: string, resistance: Resistance) {
        this._name = name;
        this._resistance = resistance;
        this._sound = new Sound('pick_up.mp3');
    }

    get name(){
        return this._name;
    }

    getResistance(){
        return this._resistance;
    }

    pickUp(){
        this._sound.playSound();
    }
}