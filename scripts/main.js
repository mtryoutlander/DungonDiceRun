//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packaging app 

(async()=>{


// Load saved data or initialize defaults
const player = JSON.parse(localStorage.getItem('player').length !=0 ? localStorage.getItem('player') : createAdventure());

const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app;
await app.init({
	resizeTo: window
});
app.canvas.style.position = 'absolute';
document.body.appendChild(app.canvas);

const diceUiContainer = new PIXI.Container();
diceUiContainer.position.set(screen.width / 5, screen.height - screen.height / 2);
diceUiContainer.label = 'diceUI';
app.stage.addChild(diceUiContainer);

const dmgContainer = new PIXI.Container();
dmgContainer.position.set(screen.width / 5, screen.height - screen.height / 2.25);
dmgContainer.label = 'dmgUI';
app.stage.addChild(dmgContainer);

//custom objects
function Dice(sprite, sides, face) {
	this.sprite = sprite;
	this.sides = sides;
	this.face = face;
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
// Load the button texture
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
		app.stage.addChild(button);
	}).catch((err) => {
		console.error('Failed to load texture:', err);
	});


//Load enemy
PIXI.Assets.load('assets/goblinTestEnemy.jpg')
	.then((texture) => {
		const enemy = new PIXI.Sprite(texture);

		enemy.scale = 0.5;
		enemy.anchor.set(0.5);
		enemy.x = app.screen.width / 2 - enemy.width;
		enemy.y = app.screen.height / 2 - enemy.height / 2;
		app.stage.addChild(enemy);

	}).catch((err) => {
		console.error('Failed to load texture:', err);
	});
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
				die.sprite = new PIXI.Sprite(texture);
				die.sprite.scale.set(0.25);
				die.sprite.anchor.set(0.5);
				die.sprite.position.set(i * 100, 0);

				const face = new PIXI.Text({text:results[i],style: textStyle});
				face.anchor.set(0.5); // Center the text
				face.x = die.sprite.x;
				face.y = die.sprite.y;

				diceUiContainer.addChild(die.sprite);
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
	const damageTotal = new PIXI.Text({text:dmg, style:textStyle});
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
	dices.push("", 6, 0);
	dices.push("", 6, 0);
	dices.push("", 6, 0);
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
