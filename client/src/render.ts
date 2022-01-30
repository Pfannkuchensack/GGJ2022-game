import { Character } from '../../both/src/character';
import { GameMap } from '../../both/src/map';
import { Tile } from '../../both/src/tile';
import { Loader } from './loader';

export class Renderer {
	_map: GameMap;
	_canvas: HTMLCanvasElement;
	_ctx: CanvasRenderingContext2D;
	_tileWidth: number;
	_tileHeight: number;
	_tileWidthHalf: number;
	_tileHeightHalf: number;
	_cameraX: number;
	_cameraY: number;
	_hover_tile: Tile | null;
	_showMapOptions: boolean;
	_loader: Loader;

	_blinkAnimationCounter: number;
	_previousTimeStamp: number;
	_currentAttackAnimation: { attackerId: string, defenderId: string, damage: number }[] | undefined;
	_currentAttackAnimationTimer: number;

	constructor(gameMap: GameMap, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
		this._map = gameMap;
		this._canvas = canvas;
		this._ctx = context;

		this._tileWidth = 80;
		this._tileHeight = 40;
		this._tileWidthHalf = this._tileWidth / 2
		this._tileHeightHalf = this._tileHeight / 1.333
		this._cameraX = this._canvas.width / 2 - this._tileWidthHalf;
		this._cameraY = this._tileHeightHalf;

		this._hover_tile = null;
		this._showMapOptions = false;

		this._loader = new Loader({
			tile_ground: 'assets/tile_ground.png',
			jet_blue_E_40: 'assets/jet_blue_E_40.png',
			jet_blue_E_40_shadow: 'assets/jet_blue_E_40_shadow.png',
			jet_blue_N_40: 'assets/jet_blue_N_40.png',
			jet_blue_N_40_shadow: 'assets/jet_blue_N_40_shadow.png',
			jet_blue_S_40: 'assets/jet_blue_S_40.png',
			jet_blue_S_40_shadow: 'assets/jet_blue_S_40_shadow.png',
			jet_blue_W_40: 'assets/jet_blue_W_40.png',
			jet_blue_W_40_shadow: 'assets/jet_blue_W_40_shadow.png',
			cursor_action: 'assets/cursor_action.png',
			cursor_hover: 'assets/cursor_hover.png',
			cursor_attack: 'assets/cursor_attack.png',
		});
		this._loader.load();

		this._blinkAnimationCounter = 0;
		this._previousTimeStamp = 0;
		this._currentAttackAnimation = undefined;
		this._currentAttackAnimationTimer = 0;
	}

	draw(now: number) {
		const offsetY = 5

		const time_delta = now - this._previousTimeStamp
		this._previousTimeStamp = now;
		this._blinkAnimationCounter += time_delta / 500
		if (this._blinkAnimationCounter > 10) {
			this._blinkAnimationCounter = 0
		}

		// draw background
		this._ctx.fillStyle = "rgb(16, 17, 18)";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

		// set text
		this._ctx.font = "14px Arial";

		// wait for image loading
		if (!this._loader.finish) {
			this._ctx.fillText('Load Assets: ' + this._loader.process, 20, 20);
			return
		}

		// draw tiles
		this._map.tileStore.forEach((tiles, x) => {
			tiles.forEach((tile, y) => {
				const iso = this.mapToScreen(x, y)

				this._ctx.drawImage(this._loader.getImage('tile_ground'), iso.x, iso.y - offsetY);
			})
		});

		// draw player options
		if (this._map._playerChar !== undefined && this._showMapOptions && this._currentAttackAnimation === undefined) {
			const currentChar = this._map._playerChar;

			const neighborPositions = [
				[-1, -1],
				[0, -1],
				[1, -1],
				[1, 0],
				[1, 1],
				[0, 1],
				[-1, 1],
				[-1, 0],
			] as number[][]

			neighborPositions.forEach((neighbor: number[]) => {
				const pos = { q: currentChar.position.q + neighbor[0], r: currentChar.position.r + neighbor[1] }
				const neededPoints = this._map.neededMovepoints(pos);
				if (neededPoints > 0 && neededPoints <= currentChar.currentMovePoints) {
					const char = this._map.getCharAt(pos.q, pos.r);
					if (char !== undefined && (char.isDead || currentChar.remainingAttacks <= 0)) {
						return
					}

					const screen = this.mapToScreen(pos.q, pos.r);
					if (char !== undefined) {
						this._ctx.drawImage(this._loader.getImage('cursor_attack'), screen.x, screen.y - offsetY);
					} else {
						this._ctx.drawImage(this._loader.getImage('cursor_action'), screen.x, screen.y - offsetY);
					}
				}
			})
		}

		// draw hover
		if (this._hover_tile && this._blinkAnimationCounter % 2 < 1) {
			const screen = this.mapToScreen(this._hover_tile.position.q, this._hover_tile.position.r);
			this._ctx.drawImage(this._loader.getImage('cursor_hover'), screen.x, screen.y - offsetY);
		}

		// draw chars
		this._map.chars.forEach((char) => {
			// render damage animation
			const attackOffset = this._calcAttackOffset(char)
			const iso = this.mapToScreen(char.position.q + attackOffset.x, char.position.r + attackOffset.y);

			// render ship
			let movementOffset = -3
			if (!char.isDead) {
				const modulo = this._blinkAnimationCounter % 4;
				movementOffset = ((modulo >= 2) ? 4 - modulo : modulo);

				this._ctx.drawImage(this._loader.getImage('jet_blue_' + char.direction + '_40_shadow'), iso.x, iso.y - offsetY);
			}

			this._ctx.drawImage(this._loader.getImage('jet_blue_' + char.direction + '_40'), iso.x, iso.y - offsetY + movementOffset);
		})

		// draw char ui
		this._map.chars.forEach((char) => {
			const attackOffset = this._calcAttackOffset(char);
			const iso = this.mapToScreen(char.position.q + attackOffset.x, char.position.r + attackOffset.y);

			if (this._currentAttackAnimation !== undefined) {
				const step = this._currentAttackAnimation[0];
				if (step.defenderId === char.id) {
					const damageOffsetY = mapRange(this._currentAttackAnimationTimer, 0, 2, 0, 10);
					this._ctx.fillStyle = "black";
					this._ctx.fillText("-" + step.damage, iso.x + this._tileWidthHalf / 2 + 10, iso.y - 40 - damageOffsetY);
				}
			}

			if (!char.isDead) {
				this._ctx.fillStyle = "black";
				this._ctx.fillText(char.name, iso.x + this._tileWidthHalf / 2, iso.y - 28);
				this._ctx.fillText('HP: ' + char.hp, iso.x + this._tileWidthHalf / 2, iso.y - 13);
				this._ctx.beginPath();
				this._ctx.fillStyle = "#0000ff";
				this._ctx.rect(iso.x + this._tileWidthHalf / 2, iso.y - 10, mapRange(char.hp, 0, 100, 0, 46), 5);
				this._ctx.fill();
			} else {
				this._ctx.fillText('DEAD', iso.x + this._tileWidthHalf / 2, iso.y - 10);
			}
		})

		// draw metadata
		this._ctx.fillStyle = "rgb(255, 255, 255)";
		if (this._map._playerChar !== undefined) {
			this._ctx.fillText('Spieler: ' + this._map._playerChar?.name, 20, 50);
			this._ctx.fillText('Moves: ' + this._map._playerChar?.currentMovePoints, 20, 65);
			this._ctx.fillText('Remaining Attacks:' + this._map._playerChar?.remainingAttacks, 20, 80);
			this._ctx.fillText('HP: ' + this._map._playerChar?.hp, 20, 95);
		}

		if (this._currentAttackAnimation !== undefined) {
			this._currentAttackAnimationTimer += time_delta / 500
			if (this._currentAttackAnimationTimer >= 2) {
				const step = this._currentAttackAnimation.shift();
				if (step !== undefined) {
					const char = this._map.getCharById(step.defenderId);
					if (char !== undefined) {
						char._hp -= step.damage;
					}
				}
				this._currentAttackAnimationTimer = 0;

				if (this._currentAttackAnimation.length === 0) {
					this.stopAttackAnimation()
				}
			}
		}
	}

	set showMapOptions(showOptions: boolean) {
		this._showMapOptions = showOptions
	}

	startAttackAnimation(event: { history: { attackerId: string, defenderId: string, damage: number }[] }) {
		this._currentAttackAnimation = event.history
	}

	stopAttackAnimation() {
		this._currentAttackAnimation = undefined;
		this._currentAttackAnimationTimer = 0;
	}

	hoverScreen(screenX: number, screenY: number) {
		const iso = this.screenToMap(screenX, screenY);

		const tile = this._map.getTile({ q: Math.round(iso.q), r: Math.round(iso.r) });
		if (tile !== undefined) {
			this._hover_tile = tile;
		} else {
			this._hover_tile = null;
		}
	}

	mapToScreen(mapX: number, mapY: number) {
		const screenX = (mapX - mapY) * this._tileWidthHalf + this._cameraX;
		const screenY = (mapX + mapY) * this._tileHeightHalf + this._cameraY;

		return { x: screenX, y: screenY }
	}

	screenToMap(screenX: number, screenY: number) {
		screenX = screenX - this._cameraX;
		screenY = screenY - this._cameraY;

		const mapX = (screenX / this._tileWidthHalf + screenY / this._tileHeightHalf) / 2;
		const mapY = (screenY / this._tileHeightHalf - (screenX / this._tileWidthHalf)) / 2;

		return { q: Math.floor(mapX), r: Math.round(mapY) };
	}

	_calcAttackOffset(char: Character): { x: number, y: number } {
		let attackOffsetX = 0;
		let attackOffsetY = 0;
		if (this._currentAttackAnimation !== undefined) {
			const step = this._currentAttackAnimation[0];
			if (step.attackerId === char.id) {
				const defender = this._map.getCharById(step.defenderId);
				if (defender !== undefined) {
					const vectorX = defender.position.q - char.position.q
					const vectorY = defender.position.r - char.position.r;
					const speed = 2;
					attackOffsetX = vectorX * mapRange(Math.min(this._currentAttackAnimationTimer * speed, 2), 0, 2, 0, 0.5);
					attackOffsetY = vectorY * mapRange(Math.min(this._currentAttackAnimationTimer * speed, 2), 0, 2, 0, 0.5);
				}
			}
		}

		return { x: attackOffsetX, y: attackOffsetY };
	}
}

function mapRange(value: number, a: number, b: number, c: number, d: number): number {
	// first map value from (a..b) to (0..1)
	value = (value - a) / (b - a);
	// then map it from (0..1) to (c..d) and return it
	return c + value * (d - c);
}