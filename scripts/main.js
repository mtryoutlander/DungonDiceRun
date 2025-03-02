//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 
import { roll, playerAttack, calculateDmg, getEffect, setEnemies, setTargetEnemy, getEnemies } from './combat.js'
import fs from 'fs';
import path from 'path';
const minGameWidth = 1920;
const minGameHight = 1080;

let scale = Math.min(window.innerWidth / minGameWidth, window.innerHeight / minGameHight);
// the app it self
export const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app;
app.init({
	width: window.innerWidth,
	height: window.innerHeight,
	autoResize: true,
	resolution: devicePixelRatio,
	scale: scale
});
app.canvas.style.position = 'absolute';
document.body.appendChild(app.canvas);

PIXI.Assets.add({ alias: 'd4', src: 'assets/D4.png' });
PIXI.Assets.add({ alias: 'd6', src: 'assets/D6.png' });
PIXI.Assets.add({ alias: 'd8', src: 'assets/D8.png' });
PIXI.Assets.add({ alias: 'd10', src: 'assets/D10.png' });
PIXI.Assets.add({ alias: 'bag', src: 'assets/DiceBag.png' });

export const texturesPromise = PIXI.Assets.load(['d4', 'd6', 'd8', 'd10', 'bag']);




// add global variables 
export const player = JSON.parse(localStorage.getItem('player') !== null ? localStorage.getItem('player') : createAdventure());
let storedDice = [], selectedMonster = null, selectedDice = [], currentlyRolled = [], dmgTotal, selectedEnemy;
export let isPaused = false;


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
const diceUiContainer = createContainer('diceUi', app.screen.width / 3, app.screen.height / 2, app.screen.width - app.screen.width / 3 + scale, scale);
//bag sprite
texturesPromise.then((textures) => {
	const bagSprite = createSprite('bagSprite', textures.bag, app.screen.width - app.screen.width / 3 + scale, scale, null);
	diceUiContainer.addChild(bagSprite);
	let diceInBag = new PIXI.Text({ text: 'Bag: ' + player.dice.length, style: textStyle });
	diceInBag.position.set(bagSprite.x + bagSprite.width / 4, bagSprite.y + bagSprite.height / 2)
	diceInBag.label = "diceBagNum";
	diceUiContainer.addChild(diceInBag);
});

// replace with sprite later
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




const dmgContainer = createContainer('dmgUI', app.screen.width / 3, app.screen.height / 2, app.screen.width - app.screen.width / 3 + scale, app.screen.height - screen.height / 2.25 + scale);
const enemyContainer = createContainer('enemyContainer', app.screen.width / 3, app.screen.height / 2, 0, 0);
const hub = createContainer('hub', app.screen.width / 3, app.screen.height / 2, app.screen.width / 20, app.screen.height / 6);
//hub is the container that holds all the ui elements
hub.addChild(diceUiContainer);
hub.addChild(dmgContainer);
//add attack button to hub
const attackButton = createButton('Attack', app.screen.width * 3 / 4 * scale, app.screen.height * 1 / 8 * scale, () => {
	//logic for the attack button
	eraseDice('all');
	var temp = '';
	playerAttack(storedDice.concat(currentlyRolled), temp);
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
	var temp = roll(player.dice, player.rollSize);
	currentlyRolled = temp[0]; // get the dice that were taken out and rolled
	player.dice = temp[1];    // get the dice left in the bag
	console.log(currentlyRolled);
	drawDice(currentlyRolled, 'current');
	diceUiContainer.children.find((element) => element.label == 'diceBagNum').text = "Bag: " + player.dice.length;
});
hub.addChild(rollButton);

const storeButton = createButton('store', app.screen.width * 3 / 4 * scale, app.screen.height / 5 * scale, () => {
	//store dice
	storedDice = storedDice.concat(selectedDice);
	currentlyRolled = removeSelectedFromCurrent(currentlyRolled, selectedDice);
	drawDice(storedDice, 'bank');
	selectedDice = [];
	player.dice = player.dice.concat(currentlyRolled);
	currentlyRolled = [];
	eraseDice('current');
	diceUiContainer.children.find((element) => element.label == 'diceBagNum').text = "Bag: " + player.dice.length;
});
hub.addChild(storeButton);

// Create a container for the health bar and text
const healthBarContainer = createContainer('healthBarContainer', 200, 50, 0, app.screen.height * 2 / 5);
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

hub.addChild(healthBarContainer);

const startMenu = createContainer('startMenue', app.screen.width, app.screen.height, 0, 0);
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
startMenu.addChild(exitButton);

const options = createContainer('optionMenue', app.screen.width, app.screen.height, 0, 0);
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

const createrCreater = createContainer('createrCreater', app.screen.width, app.screen.height, 0, 0);//createrCreater scean

const loot = createContainer('loot', app.screen.width, app.screen.height, 0, 0);// popup after combat

const itemDes = createContainer('itemDes', app.screen.width, app.screen.height, 0, 0);

const shop = createContainer('shop', app.screen.width, app.screen.height, 0, 0);

mainMenue();

export function pause() { //renders the pause container
	app.stage.addChild(options);
	isPaused = true;
}
export function unpause() {
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
//load the current enemy group
function combatLoadEnemies(lv) {
	let enemies = [];
	try {
		const data = fs.readFileSync(path.resolve(__dirname, lv), 'utf8');
		enemies = JSON.parse(data);
		setEnemies(enemies);
	} catch (error) {
		console.error("Error reading or parsing " + lv, error);
	}


}
function startCombat() {
	while (app.stage.children[0]) {
		app.stage.removeChild(app.stage.children[0]);
	}
	combatLoadEnemies('goblins.json');
	loadEnemy();
	app.stage.addChild(enemyContainer);
	app.stage.addChild(hub);
}

function eraseDice(place) {
	let diceToRemove = []
	switch (place) {
		case 'current':
			//finds and removes all the dice
			if (currentRollBackground.children != null)
				currentRollBackground.children.forEach(element => {
					if (element.label == "dice") {
						diceToRemove.push(element);
					}
				});
			break;
		case 'all':
			//finds and removes all the dice
			if (currentRollBackground.children != null)
				currentRollBackground.children.forEach(element => {
					if (element.label == "dice") {
						diceToRemove.push(element);
					}
				});
			if (bank.children != null)
				bank.children.forEach(element => {
					if (element.label == "dice") {
						diceToRemove.push(element);
					}
				});
			break;

	}
	if (currentRollBackground.children != null)
		diceToRemove.forEach(element => {
			currentRollBackground.removeChild(element);
		});
	if (bank.children != null)
		diceToRemove.forEach(element => {
			bank.removeChild(element);
		})
}
function storeDice(diceToStore) {
	// Check if diceToStore is already in selectedDice
	const index = selectedDice.findIndex(dice => dice === diceToStore);

	if (index !== -1) {
		// If diceToStore is found, remove it from the array
		selectedDice.splice(index, 1);
	} else {
		// If diceToStore is not found, add it to the array
		selectedDice.push(diceToStore);
	}

}
function scaleTextToFitSprite(sprite, text, padding) {
	const maxWidth = sprite.width - padding * 2; // Max width for the text
	const maxHeight = sprite.height - padding * 2; // Max height for the text
	console.log('before: ' + text.style.fontSize);
	// Start with a large font size and reduce it until the text fits
	let fontSize = 100; // Start with a large font size
	text.style.fontSize = fontSize;

	// Reduce font size until the text fits within the sprite's width
	while (text.width > maxWidth || text.height > maxHeight) {
		fontSize--;
		text.style.fontSize = fontSize;
	}

	// Center the text within the sprite
	text.x = (sprite.width);
	text.y = (sprite.height);
}
function drawDice(dice, place) {

	texturesPromise.then((textures) => {
		dice.forEach((dice, i) => {
			drawHelp(createSprite(dice.name, dice.image, 0, 0, () => {
				let tempDice = dice;
				storeDice(tempDice);
			}), i, dice, place);
			i++;
		});
	});
	dmgTotal = calculateDmg(currentlyRolled.concat(storedDice), player.items);
	diceUiContainer.removeChild(diceUiContainer.children.find((element) => element.label == 'dmgText'));
	const dmgText = new PIXI.Text({ text: "Dmg Total: " + dmgTotal, style: textStyle });
	dmgText.label = 'dmgText';
	dmgText.position.set(diceUiContainer.width / 3 * scale, diceUiContainer.height * scale);
	diceUiContainer.addChild(dmgText);
}
function drawHelp(sprite, i, die, place) {
	let position;
	switch (place) {
		case 'current':
			position = currentRollBackground;
			break;
		case 'bank':
			position = bank;
			sprite.interactive = false;
			break;

	}
	sprite.scale = scale / 2;
	sprite.x = i * scale * sprite.width;
	sprite.y = Math.floor(i / 3);
	let face = new PIXI.Text({
		text: die.face, style: {
			fontFamily: 'Arial',
			fontSize: scale,
			fill: 0x000000, // black color
			align: 'center',
			stroke: 0x000000, // Black stroke
		}
	});
	scaleTextToFitSprite(sprite, face, -25);
	position.addChild(sprite);
	sprite.addChild(face);
}
// Function to create a button
function createButton(text, xPostion, yPosition, onClick) {
	const button = new PIXI.Text({
		text: text, style: {
			fontFamily: 'Arial',
			fontSize: Math.min(36 * scale * 10, 64),
			fill: 0xffffff,
			align: 'center',
		}
	});
	button.interactive = true;
	button.buttonMode = true;
	button.anchor.set(0.5);
	button.position.set(xPostion, yPosition);
	button.scale = scale;

	// Add event listeners
	button.on('pointerdown', onClick);
	button.on('pointerover', () => (button.tint = 0xaaaaaa));
	button.on('pointerout', () => (button.tint = 0xffffff));

	return button;
}
//Function create container
function createContainer(label, width, height, x, y) {
	const container = new PIXI.Container();
	container.label = label;
	container.x = x;
	container.y = y;
	container.width = width;
	container.height = height;
	container.scale = scale;
	return container;
}
function createSprite(label, texture, x, y, onClick) {
	const sprite = new PIXI.Sprite(texture);
	sprite.label = label;
	sprite.x = x;
	sprite.y = y;
	if (onclick != null) {
		sprite.interactive = true;
		sprite.buttonMode = true;
		sprite.on('pointerdown', onClick);
		sprite.on('pointerover', () => (sprite.tint = 0xaaaaaa));
		sprite.on('pointerout', () => (sprite.tint = 0xffffff));

	}
	sprite.scale = scale;
	return sprite;
}
// Function to update the health bar and text
function updateHealthBar(currentHealth, maxHealth) {
	const healthPercentage = currentHealth / maxHealth;
	healthBar.width = 200 * healthPercentage; // Scale the health bar width

	// Update the health text
	healthText.text = `HP: ${currentHealth} / ${maxHealth}`;
}
//Load enemy
function loadEnemy() {
	const loadPromises = getEnemies().map((enemy, i) => {

		let texturePath = enemy.sprite;
		PIXI.Assets.load(texturePath)
			.then((texture) => {
				let enemyX = (i * 300 + app.screen.width / 20) + scale;
				let enemyY = scale + app.screen.height / 20;

				//draw enemy sprite
				let enemySprite = createSprite(enemy.name, texture, enemyX, enemyY, () => {
					selectedEnemy = { logic: enemy, visural: enemySprite };

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
	});
}

function loadPlayer() {

	let playerData;
	try {
		playerData = JSON.parse(localStorage.getItem('player'));
	} catch (error) {
		console.error("Error parsing player data from localStorage", error);
	}
	if (playerData) {
		player.name = playerData.name;
		player.hp = playerData.hp;
		player.dice = playerData.dice;
		player.rollSize = playerData.rollSize;
	}
}
function createPlayer(playerId) {
	//i want to load player from player.json and save it to localstorage and set the player object
	let playerData;
	try {
		playerData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../assets/player.json'), 'utf8'));
	} catch (error) {
		console.error("Error reading or parsing player.json:", error);
	}
	switch (playerId) {
		case 1:
			playerData = playerData[0];
			break;
	}
	if (playerData) {
		player.name = playerData.name;
		player.hp = playerData.hp;
		player.dice = playerData.dice;
		player.rollSize = playerData.rollSize;
		localStorage.setItem('player', JSON.stringify(player));
	}
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
