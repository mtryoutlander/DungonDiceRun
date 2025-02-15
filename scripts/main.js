//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 
(async () => {

	const minGameWidth = 1920;
	const minGameHight = 1080;
	let scale =Math.min(window.innerWidth / minGameWidth, window.innerHeight / minGameHight);
	// the app it self
	const app = new PIXI.Application();
	globalThis.__PIXI_APP__ = app;
	await app.init({
		width: window.innerWidth,
    	height: window.innerHeight,
    	autoResize: true,
    	resolution: devicePixelRatio,
		scale:scale
	});
	app.canvas.style.position = 'absolute';
	document.body.appendChild(app.canvas);



	// add global variables 
	const player = JSON.parse(localStorage.getItem('player') !== null ? localStorage.getItem('player') : createAdventure());
	const dungenLv = 0;
	const dungenMap = generateDungonMap();
	let storeDice = [], selectedMonster = null, selectedDice = [], currentlyRolled = [];
	let isPaused = false;
	

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

	//Event binding 
	window.addEventListener('resize', resize);
	resize();

	//containers 
	const diceUiContainer = new PIXI.Container();
	diceUiContainer.label = 'diceUI';
	//bag sprite
	const bagSprite = new PIXI.Sprite('assets/DiceBag.png');
	bagSprite.x= app.screen.width - app.screen.width / 3 +scale;
	bagSprite.y =  app.screen.height / 2+scale;
	bagSprite.scale = scale;
	bagSprite.label ="bagSprite";
	diceUiContainer.addChild(bagSprite);
	let diceInBag = new PIXI.Text({ text: 'Bag: ' + player.dice.length, style: textStyle });
	diceInBag.position.set((app.screen.width - app.screen.width / 3) + 50+scale, app.screen.height / 2+scale);
	diceUiContainer.addChild(diceInBag);
	const currentRollBackground = new PIXI.Graphics();
	currentRollBackground.beginFill(0xB2BEB5, 0.8); // ash grey color with 80% opacity
	currentRollBackground.drawRect(app.screen.width - app.screen.width * 2/3+scale, app.screen.height / 2+scale, 400*scale, 300*scale);
	currentRollBackground.endFill();
	diceUiContainer.addChild(currentRollBackground);
	const bank = new PIXI.Graphics();
	bank.beginFill(0x7393B3, 0.8); // blue grey color with 80% opacity
	bank.drawRect(0+scale, app.screen.height / 2+scale, 300*scale, 300*scale);
	bank.endFill();
	diceUiContainer.addChild(bank);
	let bankLabel = new PIXI.Text({ text: 'Store Dice', style: textStyle });
	bankLabel.position.set(bank.x+scale, app.screen.height / 2+scale);
	diceUiContainer.addChild(bankLabel);




	const dmgContainer = new PIXI.Container();
	dmgContainer.position.set(screen.width / 5+scale, screen.height - screen.height / 2.25+scale);
	dmgContainer.label = 'dmgUI';

	const enemyContainer = new PIXI.Container();
	enemyContainer.position.set(0, 0);
	enemyContainer.label = 'enemyContainer';

	const hub = new PIXI.Container();
	hub.label = "hub";
	hub.addChild(diceUiContainer);
	hub.addChild(dmgContainer);
	//add attack button to hub
	const attackButton = createButton('Attack', app.screen.width / 4, app.screen.height*2/5, () => {
		//logic for the attack button
		attack(storeDice, currentlyRolled);
		player.dice = player.dice.concat(currentlyRolled);
		player.dice = player.dice.concat(storeDice);
		currentlyRolled = [];
		storeDice = [];
		eraseDice('all');
	})
	hub.addChild(attackButton);
	const rollButton = createButton('Roll', app.screen.width * 3 / 4, app.screen.height*2/5, () => {
		//roll dice
		currentlyRolled = roll(player.rollSize);
		console.log(currentlyRolled);
		drawDice(currentlyRolled, 'current');
	})
	hub.addChild(rollButton);
	const storeButton = createButton('store', app.screen.width / 2, app.screen.height*2/5, () => {
		//store dice
		storeDice = selectedDice;
		drawDice(storeDice, 'stored');
		currentlyRolled = removeSelectedFromCurrent(currentlyRolled, selectedDice);
		player.dice = player.dice.concat(currentlyRolled);
		currentlyRolled = [];
		eraseDice('current');
	})
	hub.addChild(storeButton);

	// Create a container for the health bar and text
	const healthBarContainer = new PIXI.Container();
	app.stage.addChild(healthBarContainer);

	// Create the health bar background (gray)
	const healthBarBackground = new PIXI.Graphics();
	healthBarBackground.beginFill(0x808080); // Gray color
	healthBarBackground.drawRect(0, 0, 200*scale, 20*scale); // Width: 200, Height: 20
	healthBarBackground.endFill();
	healthBarContainer.addChild(healthBarBackground);

	// Create the health bar (green)
	const healthBar = new PIXI.Graphics();
	healthBar.beginFill(0x00FF00); // Green color
	healthBar.drawRect(0, 0, 200*scale, 20*scale); // Width: 200, Height: 20
	healthBar.endFill();
	healthBarContainer.addChild(healthBar);

	// Create the health text
	const healthText = new PIXI.Text('HP: 10 / 10', {
		fontFamily: 'Arial',
		fontSize: 18,
		fill: 0xFFFFFF,
		align: 'center'
	});
	healthText.x = 0;
	healthText.y = 25; // Position below the health bar
	healthBarContainer.addChild(healthText);

	// Position the health bar container
	healthBarContainer.x = 0;
	healthBarContainer.y = app.screen.height * 2/5;

	hub.addChild(healthBarContainer);
	//hud postion will move everything on the hud
	hub.position.set(app.screen.width / 20, app.screen.height / 6);


	const startMenu = new PIXI.Container();
	startMenu.label = "startMenue";
	const startButton = createButton('Start', app.screen.width / 2, 200, () => {
		console.log('Start Game!');
		startCombat();
	});
	startMenu.addChild(startButton);

	// Create Options Button
	const optionsButton = createButton('Options', app.screen.width / 2, 300, () => {
		console.log('Options Menu!');
		// Add your options menu logic here
		pause();
	});
	startMenu.addChild(optionsButton);

	// Create Exit Button
	const exitButton = createButton('Exit', app.screen.width / 2, 400, () => {
		console.log('Exiting Game!');
		window.close(); // Note: This may not work in all browsers due to security restrictions
	});
	startMenu.scale = scale;
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

	const backButton = createButton('Back', app.screen.width / 2, 400, () => {
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


	// Function to update the health bar and text
	function updateHealthBar(currentHealth, maxHealth) {
		const healthPercentage = currentHealth / maxHealth;
		healthBar.width = 200 * healthPercentage; // Scale the health bar width

		// Update the health text
		healthText.text = `HP: ${currentHealth} / ${maxHealth}`;
	}


	// Function to create a button
	function createButton(text, xPostion, yPosition, onClick) {
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
		button.position.set(xPostion, yPosition);

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

	function roll(numberOfDiceToRoll) {
		let diceOutOfBag = [];
		if (player.dice.length < numberOfDiceToRoll)
			numberOfDiceToRoll = player.dice.length;
		for (let i = 0; i < numberOfDiceToRoll; i++) {
			let index = Math.floor(Math.random() * player.dice.length - 1);
			diceOutOfBag.push(player.dice[index]);
			player.dice.splice(index, 1);
		}
		return rollDices(diceOutOfBag);
	}
	function rollDices(diceOutOfBag) {
		diceOutOfBag.forEach((die) => {
			die.side = Math.floor(Math.random() * die.sides) + 1;
		});

		return (diceOutOfBag);

	}

	const removeSelectedFromCurrent = (total, selected) => {
		return total.filter(item =>
			!selected.some(selectedItem =>
				JSON.stringify(selectedItem) === JSON.stringify(item)
			)
		);
	};

	function drawDice(dice, place) {
		let diceTextStyle = new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 16,
			fill: 0xffff, // white color
			align: 'center',
			stroke: 0x000000, // Black stroke
		});
		let postionX, postionY;
		switch (place) {
			case 'current':
				postionX = currentRollBackground.x + 10;
				postionY = currentRollBackground.y + 20;
				break;
			case 'bank':
				postionX = bank.x + 10;
				postionY = bank.y + 20
				break;

		}
		dice.forEach((die, i = 0) => {
			let face = new PIXI.Text({
				text: die.face, style: diceTextStyle
			});
			face.x = postionX + i * 10;
			face.y = postionY + (i / 4) * 10;
			i++;
			face.label = place;
			diceUiContainer.addChild(face);

		})
	}
	function eraseDice(place) {
		let diceToRemove = [];
		switch (place) {
			case 'current':
				//finds all the dice 
				diceToRemove = diceUiContainer.querySelectorAll('[label="current"]');
				// Remove each child
				diceToRemove.forEach(child => {
					diceUiContainer.removeChild(child);
				});
				break;
			case 'all':
				//finds all the dice 
				diceToRemove = diceUiContainer.querySelectorAll('[label="current"]');
				diceToRemove.concat(diceUiContainer.querySelectorAll('[label="bank"]'))
				// Remove each child
				diceToRemove.forEach(child => {
					diceUiContainer.removeChild(child);
				});
				break;

		}
	}

	// Load the button texture
	function startCombat() {
		while (app.stage.children[0]) {
			app.stage.removeChild(app.stage.children[0]);
		}
		const enemies = [];
		let attack = [];
		attack.push(new Dice(6, 0));
		attack.push(new Dice(6, 0));
		enemies.push(new Enemy('goblin', 32, attack));
		enemies.push(new Enemy('goblin', 32, attack));
		enemies.push(new Enemy('goblin', 32, attack));
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
					texturePath = 'assets/SickGoblin.png';
					break;
				default:
					console.error(`Unsupported enemy type: ${enemy.name}`);
					return Promise.resolve();
			}
			return PIXI.Assets.load(texturePath)
				.then((texture) => {
					let enemyX = (i*300 + app.screen.width/20) +scale;
					let enemyY = scale + app.screen.height/20;

					//draw enemy sprite
					let enemySprite = new PIXI.Sprite(texture);
					enemySprite.x = enemyX;
					enemySprite.y = enemyY;
					enemySprite.scale = scale;
					enemyContainer.addChild(enemySprite);
					// Create the health bar background (gray)
					let healthBarBackground = new PIXI.Graphics();
					healthBarBackground.beginFill(0x808080); // Gray color
					healthBarBackground.drawRect(enemyX, enemyY+200*scale , 200, 20); // Width: 200, Height: 20
					healthBarBackground.endFill();
					enemyContainer.addChild(healthBarBackground);

					// Create the health bar (green)
					let healthBar = new PIXI.Graphics();
					healthBar.beginFill(0x00FF00); // Green color
					healthBar.drawRect(enemyX, enemyY+200*scale , 200, 20); // Width: 200, Height: 20
					healthBar.endFill();
					enemyContainer.addChild(healthBar);

					// Create the health text
					let healthText = new PIXI.Text({
						text: `HP: ${enemy.hp} / ${enemy.hp}`, style: {
							fontFamily: 'Arial',
							fontSize: 18,
							fill: 0xFFFFFF,
							align: 'center'
						}
					});
					healthText.x = enemyX;
					healthText.y = enemyY+220*scale  ; // Position below the health bar
					enemyContainer.addChild(healthText);



				}).catch((err) => {
					console.error('Failed to load texture:', err);
				});
		});
		// Wait for all enemies to be load
		Promise.all(loadPromises).then(() => {
			console.log('All enemeyies loaded:', enemies);
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
		dices.push(new Dice(6, 0));
		dices.push(new Dice(6, 0));
		dices.push(new Dice(6, 0));
		const player = {
			hp: 10,
			money: 0,
			enemiesDefeated: 0,
			dice: dices,
			rollSize: 3
		}

		localStorage.setItem("player", JSON.stringify(player));
		return JSON.stringify(player);
	}

	// Handle window resizing
	function resize() {
		scale = Math.min(window.innerWidth / minGameWidth, window.innerHeight / minGameHight);
		app.stage.scale.set(scale);
	}
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


/*
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

	*/