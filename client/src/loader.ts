export class Loader {
	_imagePaths: { [key: string]: string };
	_loadedImages: { [key: string]: HTMLImageElement };
	_imageCount: number;

	constructor(imagePaths: { [key: string]: string }) {
		this._imagePaths = imagePaths;
		this._loadedImages = {}
		this._imageCount = Object.keys(imagePaths).length;
	}

	_loadImage(path: string): Promise<HTMLImageElement> {
		return new Promise(r => {
			let i = new Image();
			i.onload = (() => r(i));
			i.src = path;

			return i;
		})
	}

	load() {
		const keys = Object.keys(this._imagePaths);
		if (keys.length === 0) {
			return
		}

		const key = keys[0]
		const next = this._imagePaths[key]
		delete this._imagePaths[key]

		this._loadImage(next).then((img: HTMLImageElement) => {
			this._loadedImages[key] = img;
			console.log("loaded: ", next, this.process)

			this.load();
		})
	}

	get process(): string {
		return Object.keys(this._loadedImages).length + "/" + this._imageCount;
	}

	get finish(): boolean {
		return Object.keys(this._loadedImages).length === this._imageCount;		
	}

	getImage(key: string): HTMLImageElement {
		return this._loadedImages[key];
	}
}