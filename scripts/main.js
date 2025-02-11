//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 

(async () => {
	// Load saved data or initialize defaults
	const player = JSON.parse(localStorage.getItem('player') !== null ? localStorage.getItem('player') : createAdventure());
	const dungenLv = 0;
	const dungenMap = generateDungonMap();

	const app = new PIXI.Application();
	globalThis.__PIXI_APP__ = app;
	await app.init({
		resizeTo: window
	});
	app.canvas.style.position = 'absolute';
	document.body.appendChild(app.canvas);

	//containers 
	const diceUiContainer = new PIXI.Container();
	diceUiContainer.position.set(screen.width / 5, screen.height - screen.height / 2);
	diceUiContainer.label = 'diceUI';

	const dmgContainer = new PIXI.Container();
	dmgContainer.position.set(screen.width / 5, screen.height - screen.height / 2.25);
	dmgContainer.label = 'dmgUI';

	const enemyContainer = new PIXI.Container();
	enemyContainer.position.set(screen.width / 2, screen.height / 2);
	enemyContainer.label = 'enemyContainer';

	const hub = new PIXI.Container();
	hub.label = "hub";
	hub.addChild(diceUiContainer);
	hub.addChild(dmgContainer);
	//add attack button to hub
	PIXI.Assets.load('assets/attack-button.png')
		.then((texture) => {
			// Create a sprite from the loaded texture
			const button = new PIXI.Sprite(texture);

			//set the button size
			button.scale = 0.5;

			// Set the sprite's position
			button.x = app.screen.width - button.width;
			button.y = app.screen.height - button.height;

			// Set the sprite's anchor point to the center
			button.anchor.set(0.5);

			// Enable interactivity for the sprite
			button.eventMode = 'static'; // Makes the sprite interactive
			button.cursor = 'pointer';  // Changes the cursor to a pointer when hovering over the sprite

			// Add event listeners for interactivity
			button.on('pointerdown', attackedClick);
			hub.addChild(button);
		}).catch((err) => {
			console.error('Failed to load texture:', err);
		});

	const startMenu = new PIXI.Container();
	startMenu.label = "startMenue";

	const options = new PIXI.Container();
	options.label = "optionMenue";

	const createrCreater = new PIXI.Container();
	createrCreater.label = "CCScean"; //createrCreater scean

	const loot = new PIXI.Container();
	loot.label = "lootPopup";  // popup after combat

	const itemDes = new PIXI.Container();
	itemDes.label = "itemDescption";

	const shop = new PIXI.Container();
	shop.label = "shop";

	//custom objects
	function Dice(sides, face) {
		this.sides = sides;
		this.face = face;
	}
	//enemy Stats
	function Enemy(name, hp, attack) {
		this.name = name;
		this.hp = hp;
		this.attack = attack;
	}
	// Define a text style
	const textStyle = new PIXI.TextStyle({
		fontFamily: 'Arial',
		fontSize: 36,
		fill: 0xff1010, // Red color
		align: 'center',
		stroke: 0x000000, // Black stroke
		dropShadow: true,
		dropShadowColor: 0x000000,
		dropShadowBlur: 4,
		dropShadowAngle: Math.PI / 6,
		dropShadowDistance: 6,
	});
	function pause() { //renders the pause container
		app.screen.addChild(options);
	}
	function unpause() {
		app.screen.removeChild(options);
	}
	function mainMnue() { //the main menue

	}
	// Load the button texture
	function startCombat() {
		app.screen.addChild(enemyContainer);
		app.screen.addChild(hub);
	}

	//genrates the dungeon map
	function generateDungonMap() {

	}
	//Load enemy
	function loadEnemy(enemies) {
		const loadPromises = enemies.map((name, i) => {
			let texturePath;
			switch (name) {
				case "":
					texturePath = 'assets/goblinTestEnemy.jpg';
					break;
				default:
					console.error(`Unsupported enemy type: ${enemies.name}`);
					return Promise.resolve();
			}
			return PIXI.Assets.load(texturePath)
				.then((texture) => {
					const enemy = new PIXI.Sprite(texture);
					enemy.label = name;
					enemy.scale = 0.5;
					enemy.anchor.set(0.5);
					enemy.x = enemyContainer.x - enemy.width * i;
					enemy.y = enemyContainer.y - enemy.height / 2;
					enemyContainer.addChild(enemy);

				}).catch((err) => {
					console.error('Failed to load texture:', err);
				});
		});
		// Wait for all enemies to be load
		Promise.all(loadPromises).then(() => {
			console.log('All enemeyies loaded:', enemies);
		});

	}

	function drawDice(results) {
		// Remove all prior loaded dice if there are any
		while (diceUiContainer.children[0]) {
			diceUiContainer.removeChild(diceUiContainer.children[0]);
		}
		// Load Dice 
		const loadPromises = player.dice.map((die, i) => {
			let texturePath;
			switch (die.sides) {
				case 4:
					texturePath = 'assets/D4.png';
					break;
				case 6:
					texturePath = 'assets/D6.png';
					break;
				case 8:
					texturePath = 'assets/D8.png';
					break;
				case 10:
					texturePath = 'assets/D10.png';
					break;
				default:
					console.error(`Unsupported dice type: ${die.sides}`);
					return Promise.resolve();
			}

			return PIXI.Assets.load(texturePath)
				.then((texture) => {
					const dieSprite = new PIXI.Sprite(texture);
					dieSprite.scale.set(0.25);
					dieSprite.anchor.set(0.5);
					dieSprite.position.set(i * 100, 0);

					const face = new PIXI.Text({ text: results[i], style: textStyle });
					face.anchor.set(0.5); // Center the text
					face.x = dieSprite.x;
					face.y = dieSprite.y;

					diceUiContainer.addChild(dieSprite);
					diceUiContainer.addChild(face);
				})
				.catch((err) => {
					console.error('Failed to load texture:', err);
				});
		});

		// Wait for all dice to load
		Promise.all(loadPromises).then(() => {
			console.log('All dice loaded:', diceUiContainer.children);
		});
	}
	function attackedClick() {
		let results = rollDices();  // makes an array of dice values
		let dmg = calculateDmg(results); //adds those dice values together 
		results.sort((a, b) => a - b);
		drawDice(results);
		while (dmgContainer.children[0]) {
			dmgContainer.removeChild(dmgContainer.children[0]);
		}
		const damageTotal = new PIXI.Text({ text: dmg, style: textStyle });
		dmgContainer.addChild(damageTotal);

	}

	function rollDices() {
		const results = [];
		player.dice.forEach((die) => {
			results.push(roll(die));
		});

		return (results);

	}

	function roll(die) {
		const randomIndex = Math.floor(Math.random() * die.sides);
		return (randomIndex + 1);
	}

	function calculateDmg(results) {
		const numberMap = new Map();
		results.forEach((num) => {
			/* diceElement.textContent = diceElement.textContent + ", " result; */
			if (numberMap.has(num)) {
				numberMap.set(num, numberMap.get(num) + 1);
			} else {
				numberMap.set(num, 1);
			}
		});

		let dmg = 0;
		for (const [num, count] of numberMap.entries()) {
			if (count > 1) {
				// If the number appears more than once, sum and multiply by count
				dmg += num * count * count;
			} else {
				// If the number appears only once, add it to the total
				dmg += num;
			}
		}
		return dmg;
	}

	function createAdventure() {
		let dices = [];
		dices.push(new Dice(6, 0));
		dices.push(new Dice(6, 0));
		dices.push(new Dice(6, 0));
		const player = {
			hp: 10,
			money: 0,
			enemiesDefeated: 0,
			dice: dices
		}

		localStorage.setItem("player", JSON.stringify(player));
		return JSON.stringify(player);
	}
})();
