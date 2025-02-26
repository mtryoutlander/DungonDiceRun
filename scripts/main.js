//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 
import { eraseDice, createButton, drawDice } from './ui.js'
import { roll, playerAttack } from './combat.js'
const minGameWidth = 1920;
const minGameHight = 1080;
let scale = Math.min(window.innerWidth / minGameWidth, window.innerHeight / minGameHight);
// the app it self
const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app;
await app.init({
	width: window.innerWidth,
	height: window.innerHeight,
	autoResize: true,
	resolution: devicePixelRatio,
	scale: scale
});
app.canvas.style.position = 'absolute';
document.body.appendChild(app.canvas);

//preload texturers
PIXI.Assets.add({ alias: 'd4', src: 'assets/D4.png' });
PIXI.Assets.add({ alias: 'd6', src: 'assets/D6.png' });
PIXI.Assets.add({ alias: 'd8', src: 'assets/D8.png' });
PIXI.Assets.add({ alias: 'd10', src: 'assets/D10.png' });
PIXI.Assets.add({ alias: 'bag', src: 'assets/DiceBag.png' });

const texturesPromise = PIXI.Assets.load(['d4', 'd6', 'd8', 'd10', 'bag']);

// add global variables 
const player = JSON.parse(localStorage.getItem('player') !== null ? localStorage.getItem('player') : createAdventure());
const dungenLv = 0;
const dungenMap = generateDungonMap();
let storedDice = [], selectedMonster = null, selectedDice = [], currentlyRolled = [], dmgTotal, selectedEnemy;
let isPaused = false;


// Define a text style
const textStyle = new PIXI.TextStyle({
	fontFamily: 'Arial',
	fontSize: scale * 60,
	fill: 0xffffff, // white color
	align: 'center',
	stroke: 0x000000, // Black stroke
});

//Event binding 
window.addEventListener('resize', resize);
resize();

//containers 
const diceUiContainer = new PIXI.Container();
diceUiContainer.label = 'diceUI';
//bag sprite
texturesPromise.then((textures) => {
	const bagSprite = new PIXI.Sprite(textures.bag);
	console.log(bagSprite.width, bagSprite.height); // Should now have valid dimensions
	bagSprite.x = app.screen.width - app.screen.width / 3 + scale;
	bagSprite.y = app.screen.height / 2 + scale;
	bagSprite.scale = scale;
	bagSprite.label = "bagSprite";
	diceUiContainer.addChild(bagSprite);
	let diceInBag = new PIXI.Text({ text: 'Bag: ' + player.dice.length, style: textStyle });
	diceInBag.position.set(bagSprite.x + bagSprite.width / 4, bagSprite.y + bagSprite.height / 2)
	diceInBag.label = "diceBagNum";
	diceUiContainer.addChild(diceInBag);
});


const currentRollBackground = new PIXI.Graphics();
currentRollBackground.beginFill(0xB2BEB5, 0.8); // ash grey color with 80% opacity
currentRollBackground.drawRect(0, 0, 400 * scale, 300 * scale);
currentRollBackground.endFill();
currentRollBackground.position.set(app.screen.width - app.screen.width * 2 / 3 + scale, app.screen.height / 2 + scale);
diceUiContainer.addChild(currentRollBackground);
const bank = new PIXI.Graphics();
bank.beginFill(0x7393B3, 0.8); // blue grey color with 80% opacity
bank.drawRect(0, 0, 300 * scale, 300 * scale);
bank.endFill();
bank.position.set(scale, app.screen.height / 2 + scale);
diceUiContainer.addChild(bank);
let bankLabel = new PIXI.Text({ text: 'Store Dice', style: textStyle });
bankLabel.position.set(bank.x + scale, app.screen.height / 2 + scale);
diceUiContainer.addChild(bankLabel);




const dmgContainer = new PIXI.Container();
dmgContainer.position.set(screen.width / 5 + scale, screen.height - screen.height / 2.25 + scale);
dmgContainer.label = 'dmgUI';

const enemyContainer = new PIXI.Container();
enemyContainer.position.set(0, 0);
enemyContainer.label = 'enemyContainer';

const hub = new PIXI.Container();
hub.label = "hub";
hub.addChild(diceUiContainer);
hub.addChild(dmgContainer);
//add attack button to hub
const attackButton = createButton('Attack', app.screen.width * 3 / 4 * scale, app.screen.height * 1 / 8 * scale, () => {
	//logic for the attack button
	eraseDice('all');
	playerAttack(storedDice, currentlyRolled);
	player.dice = player.dice.concat(currentlyRolled);
	player.dice = player.dice.concat(storedDice);
	currentlyRolled = [];
	storedDice = [];
	diceUiContainer.children.find((element) => element.label == 'diceBagNum').text = "Bag: " + player.dice.length;
});
hub.addChild(attackButton);
const rollButton = createButton('Roll', app.screen.width * 3 / 4 * scale, app.screen.height * 2 / 7 * scale, () => {
	//roll dice
	eraseDice('current');
	player.dice = player.dice.concat(currentlyRolled);
	currentlyRolled = roll(player.rollSize);
	console.log(currentlyRolled);
	drawDice(currentlyRolled, 'current');
	diceUiContainer.children.find((element) => element.label == 'diceBagNum').text = "Bag: " + player.dice.length;
});
hub.addChild(rollButton);
const storeButton = createButton('store', app.screen.width * 3 / 4 * scale, app.screen.height / 5 * scale, () => {
	//store dice
	storedDice = storedDice.concat(selectedDice);
	currentlyRolled = removeSelectedFromCurrent(currentlyRolled, selectedDice);
	console.log('stored dice before draw' + storedDice);
	drawDice(storedDice, 'bank');
	selectedDice = [];
	player.dice = player.dice.concat(currentlyRolled);
	currentlyRolled = [];
	eraseDice('current');
	diceUiContainer.children.find((element) => element.label == 'diceBagNum').text = "Bag: " + player.dice.length;
});
hub.addChild(storeButton);

// Create a container for the health bar and text
const healthBarContainer = new PIXI.Container();
app.stage.addChild(healthBarContainer);

// Create the health bar background (gray)
const healthBarBackground = new PIXI.Graphics();
healthBarBackground.beginFill(0x808080); // Gray color
healthBarBackground.drawRect(0, 0, 200 * scale, 20 * scale); // Width: 200, Height: 20
healthBarBackground.endFill();
healthBarContainer.addChild(healthBarBackground);

// Create the health bar (green)
const healthBar = new PIXI.Graphics();
healthBar.beginFill(0x00FF00); // Green color
healthBar.drawRect(0, 0, 200 * scale, 20 * scale); // Width: 200, Height: 20
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
healthBarContainer.y = app.screen.height * 2 / 5;

hub.addChild(healthBarContainer);
//hud postion will move everything on the hud
hub.position.set(app.screen.width / 20, app.screen.height / 6);


const startMenu = new PIXI.Container();
startMenu.label = "startMenue";
const startButton = createButton('Start', app.screen.width / 2, app.screen.height / 5, () => {
	console.log('Start Game!');
	startCombat();
});
startMenu.addChild(startButton);

// Create Options Button
const optionsButton = createButton('Options', app.screen.width / 2, app.screen.height * 2 / 5, () => {
	console.log('Options Menu!');
	// Add your options menu logic here
	pause();
});
startMenu.addChild(optionsButton);

// Create Exit Button
const exitButton = createButton('Exit', app.screen.width / 2, app.screen.height * 4 / 5, () => {
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



const removeSelectedFromCurrent = (total, selected) => {
	return total.filter(item =>
		!selected.some(selectedItem =>
			JSON.stringify(selectedItem) === JSON.stringify(item)
		)
	);
};



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
				let enemyX = (i * 300 + app.screen.width / 20) + scale;
				let enemyY = scale + app.screen.height / 20;

				//draw enemy sprite
				let enemySprite = new PIXI.Sprite(texture);
				enemySprite.x = enemyX;
				enemySprite.y = enemyY;
				enemySprite.scale = scale;

				enemySprite.interactive = true;
				enemySprite.buttonMode = true;
				enemySprite.on('pointerdown', () => {
					selectedEnemy = { logic: enemy, visural: enemySprite };
				});

				enemySprite.on('pointerover', () => (enemySprite.tint = 0xaaaaaa));
				enemySprite.on('pointerout', () => (enemySprite.tint = 0xffffff));

				enemyContainer.addChild(enemySprite);
				// Create the health bar background (gray)
				let healthBarBackground = new PIXI.Graphics();
				healthBarBackground.beginFill(0x808080); // Gray color
				healthBarBackground.drawRect(0, 0, 200, 20); // Width: 200, Height: 20
				healthBarBackground.endFill();
				enemySprite.addChild(healthBarBackground);

				// Create the health bar (green)
				let healthBar = new PIXI.Graphics();
				healthBar.beginFill(0x00FF00); // Green color
				healthBar.drawRect(0, 0, 200, 20); // Width: 200, Height: 20
				healthBar.endFill();
				healthBar.label = 'currentHp';
				enemySprite.addChild(healthBar);

				// Create the health text
				let healthText = new PIXI.Text({
					text: `HP: ${enemy.hp} / ${enemy.hp}`, style: {
						fontFamily: 'Arial',
						fontSize: 18,
						fill: 0xFFFFFF,
						align: 'center'
					}
				});
				healthText.x = scale;
				healthText.y = scale; // Position below the health bar
				healthText.label = "hpText";
				enemySprite.addChild(healthText);



			}).catch((err) => {
				console.error('Failed to load texture:', err);
			});
	});
	// Wait for all enemies to be load
	Promise.all(loadPromises).then(() => {
		console.log('All enemeyies loaded:', enemies);
	});

}

function playerAttack(dice, effects) {

	let enemyHp = selectedEnemy.logic.hp;
	enemyHp = enemyHp - dmgTotal;
	selectedEnemy.visural.children.find((element) => element.label == 'currentHp').









		diceUiContainer.removeChild(diceUiContainer.children.find((element) => element.label == 'dmgText'));
	const dmgText = new PIXI.Text({ text: "Dmg Total: " + dmgTotal, style: textStyle });
	dmgText.label = 'dmgText';
	dmgText.position.set(diceUiContainer.width / 3 * scale, diceUiContainer.height * scale);
	diceUiContainer.addChild(dmgText);
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