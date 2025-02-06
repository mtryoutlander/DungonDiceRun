//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packageing app 

// Load saved data or initialize defaults
const player = JSON.parse(localStorage.getItem('player') ? localStorage.getItem('player') : createAdventure());

const app = new PIXI.Application();
globalThis.__PIXI_APP__ = app;
await app.init({
	resizeTo: window
});
app.canvas.style.position = 'absolute';
document.body.appendChild(app.canvas);

const container = new PIXI.Container();
app.stage.addChild(container);


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

//load Dice 
PIXI.Assets.load('assets/blank dice.jpg')
	.then((texture) => {
		for (let i = 0; i < player.dice.length; i++) {
			const die = new PIXI.Sprite(texture);

			die.scale = 0.5;
			die.anchor.set(0.5);
			die.x = app.screen.width / 2 - die.width * i;
			die.y = app.screen.height - die.height;

			container.addChild(die);

		}

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
function attackedClick() {

	let results = attack();
	let dmg = caculateDmg(results);
	/* Assuming `app` is your PIXI.Application instance
	app.stage.removeChildren();
	console.log('Button clicked!');
	
	
	console.log("Rolled: " + results + '\n' + "Total Damage: " + dmg);
	for (let i = 0; i < results.length; i++) {
		let dice = new PIXI.Graphics()
			.rect(0, 0, 35, 35)
			.fill({ color: 'red' });
		dice.x = 100 + (i * 40);
		dice.y = 200;
		let face = new PIXI.Text(results[i], textStyle)
		app.stage.addChild(dice);
		dice.addChild(face);
	}
	let damageTotal = new PIXI.Text(dmg, textStyle);
	let blackBox = new PIXI.Graphics()
		.rect(0, 0, 40, 80)
		.fill({ color: 'black' });
	blackBox.x = 140;
	blackBox.y = 300;
	app.stage.addChild(blackBox);
	blackBox.addChild(damageTotal);
	app.stage.addChild(button); 
	*/
}

function attack() {
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

function caculateDmg(results) {
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
	const player = {
		hp: 10,
		money: 0,
		enemiesDefeated: 0,
		dice: [{ sides: 6 }, { sides: 6 }, { sides: 6 }]
	}
	localStorage.setItem("player", JSON.stringify(player));
	return JSON.stringify(player);
}

function formatDice(dice) {
	const combo = "";
	dice.forEach((num) => {
		combo = combo + "[" + num.sides + "], "
	})
}