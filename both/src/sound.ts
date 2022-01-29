export class Sound{
    _src: string;

    constructor(src: string) {
        this._src = src;
    }

    playSound(){
        //return new Audio('./assets/'+this._src).play();
    }
}