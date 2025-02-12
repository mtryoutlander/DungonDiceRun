//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 

(async () => {
	// Load saved data or initialize defaults
	const player = JSON.parse(localStorage.getItem('player') !== null ? localStorage.getItem('player') : createAdventure());
	const dungenLv = 0;
	const dungenMap = generateDungonMap();
	let isPaused = false;

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
	enemyContainer.position.set(0, 0);
	enemyContainer.label = 'enemyContainer';

	const hub = new PIXI.Container();
	hub.label = "hub";
	hub.addChild(diceUiContainer);
	hub.addChild(dmgContainer);
	//add attack button to hub
	const attackButton = createButton('Attack', 400, () => {
		//logic for the attack button
		attackedClick();
	})
	hub.addChild(attackButton);
	hub.position.set(0, 0);


	const startMenu = new PIXI.Container();
	startMenu.label = "startMenue";
	const startButton = createButton('Start', 200, () => {
		console.log('Start Game!');
		startCombat();
	});
	startMenu.addChild(startButton);

	// Create Options Button
	const optionsButton = createButton('Options', 300, () => {
		console.log('Options Menu!');
		// Add your options menu logic here
		pause();
	});
	startMenu.addChild(optionsButton);

	// Create Exit Button
	const exitButton = createButton('Exit', 400, () => {
		console.log('Exiting Game!');
		window.close(); // Note: This may not work in all browsers due to security restrictions
	});
	startMenu.addChild(exitButton);

	const options = new PIXI.Container();
	options.label = "optionMenue";
	// Create a dark transparent overlay
	const overlay = new PIXI.Graphics();
	overlay.beginFill(0x000000, 0.7); // Black color with 70% opacity
	overlay.drawRect(0, 0, app.screen.width, app.screen.height);
	overlay.endFill();
	options.addChild(overlay);

	// Create a black box in the center of the screen
	const centerBoxWidth = app.screen.width / 2;
	const centerBoxHeight = app.screen.height;
	const centerBox = new PIXI.Graphics();
	centerBox.beginFill(0x000000); // Black color
	centerBox.drawRect(
		(app.screen.width - centerBoxWidth) / 2, 0, centerBoxWidth, centerBoxHeight
	);
	centerBox.endFill();
	options.addChild(centerBox);

	const backButton = createButton('Back', 400, () => {
		unpause()
	});
	options.addChild(backButton);

	// Create a volume slider
	const sliderWidth = 200;
	const sliderHeight = 10;
	const slider = new PIXI.Graphics();
	slider.beginFill(0xcccccc); // Light gray color
	slider.drawRect(
		(app.screen.width - sliderWidth) / 2,
		(app.screen.height - sliderHeight) / 2,
		sliderWidth,
		sliderHeight
	);
	slider.endFill();
	options.addChild(slider);

	const sliderButton = new PIXI.Graphics();
	sliderButton.beginFill(0xffffff); // White color
	sliderButton.drawCircle(0, 0, 10); // Circle for the slider button
	sliderButton.endFill();
	sliderButton.x = (app.screen.width - sliderWidth) / 2;
	sliderButton.y = (app.screen.height - sliderHeight) / 2;
	sliderButton.interactive = true;
	sliderButton.buttonMode = true;
	options.addChild(sliderButton);
	let isDragging = false;
	sliderButton.on('pointerdown', () => {
		isDragging = true;
	});
	sliderButton.on('pointerup', () => {
		isDragging = false;
	});
	sliderButton.on('pointerupoutside', () => {
		isDragging = false;
	});
	sliderButton.on('pointermove', (event) => {
		if (isDragging) {
			const newX = event.data.global.x;
			const minX = (app.screen.width - sliderWidth) / 2;
			const maxX = minX + sliderWidth;
			sliderButton.x = Math.min(Math.max(newX, minX), maxX);

			// Calculate volume based on slider position
			const volume = (sliderButton.x - minX) / sliderWidth;
			console.log('Volume:', volume);
			// Add your volume control logic here
		}
	});

	const createrCreater = new PIXI.Container();
	createrCreater.label = "CCScean"; //createrCreater scean

	const loot = new PIXI.Container();
	loot.label = "lootPopup";  // popup after combat

	const itemDes = new PIXI.Container();
	itemDes.label = "itemDescption";

	const shop = new PIXI.Container();
	shop.label = "shop";

	mainMenue();
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

	// Function to create a button
	function createButton(text, yPosition, onClick) {
		const button = new PIXI.Text({
			text: text, style: {
				fontFamily: 'Arial',
				fontSize: 36,
				fill: 0xffffff,
				align: 'center',
			}
		});
		button.interactive = true;
		button.buttonMode = true;
		button.anchor.set(0.5);
		button.position.set(app.screen.width / 2, yPosition);

		// Add event listeners
		button.on('pointerdown', onClick);
		button.on('pointerover', () => (button.tint = 0xaaaaaa));
		button.on('pointerout', () => (button.tint = 0xffffff));

		return button;
	}

	// Create Start Button

	function pause() { //renders the pause container
		app.stage.addChild(options);
		isPaused = true;
	}
	function unpause() {
		app.stage.removeChild(options);
		isPaused = false;
	}
	function mainMenue() { //the main menue
		app.stage.addChild(startMenu);
	}
	// Load the button texture
	function startCombat() {
		while (app.stage.children[0]) {
			app.stage.removeChild(app.stage.children[0]);
		}
		const enemies = [];
		enemies.push(new Enemy('goblin', 10, 1));
		loadEnemy(enemies);
		app.stage.addChild(enemyContainer);
		app.stage.addChild(hub);
	}

	//genrates the dungeon map
	function generateDungonMap() {

	}
	//Load enemy
	function loadEnemy(enemies) {
		const loadPromises = enemies.map((enemy, i) => {
			let texturePath;
			console.log(enemy.name + " the enemy name");
			switch (enemy.name) {
				case 'goblin':
					texturePath = 'assets/goblinTestEnemy.jpg';
					break;
				default:
					console.error(`Unsupported enemy type: ${enemy.name}`);
					return Promise.resolve();
			}
			return PIXI.Assets.load(texturePath)
				.then((texture) => {
					const enemy = new PIXI.Sprite(texture);
					enemy.label = name;
					enemy.scale = 0.5;
					enemy.anchor.set(0.5);
					enemy.x = enemyContainer.x + enemy.width * (i + 1);
					enemy.y = enemyContainer.y + enemy.height / 2;
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

	// Handle window resizing
	window.addEventListener('resize', () => {
		app.renderer.resize(window.innerWidth, window.innerHeight);
		overlay.clear();
		overlay.beginFill(0x000000, 0.7);
		overlay.drawRect(0, 0, app.screen.width, app.screen.height);
		overlay.endFill();

		centerBox.clear();
		centerBox.beginFill(0x000000);
		centerBox.drawRect(
			(app.screen.width - centerBoxWidth) / 2,
			(app.screen.height - centerBoxHeight) / 2,
			centerBoxWidth,
			centerBoxHeight
		);
		centerBox.endFill();

		backButton.x = (app.screen.width - backButton.width) / 2;
		backButton.y = (app.screen.height - centerBoxHeight) / 2 + 20;

		slider.clear();
		slider.beginFill(0xcccccc);
		slider.drawRect(
			(app.screen.width - sliderWidth) / 2,
			(app.screen.height - sliderHeight) / 2 + 80,
			sliderWidth,
			sliderHeight
		);
		slider.endFill();

		sliderButton.x = (app.screen.width - sliderWidth) / 2;
		sliderButton.y = (app.screen.height - sliderHeight) / 2 + 80;
	});
	//key press event listener
	window.addEventListener('keydown', (event) => {
		if (event.key === 'p' || event.key === 'P') {
			if (!isPaused) {
				pause();
			} else {
				unpause();
			}
		}
	});
})();