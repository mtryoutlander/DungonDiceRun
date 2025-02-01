//import { Application, Graphics, Text, TextStyle } from "pixi.js";  // will use onces packageing app 

// Load saved data or initialize defaults
const player = JSON.parse(localStorage.getItem('player') ? localStorage.getItem('player') : createAdventure());

//controls the game state and draws to the canvas
(async () => {
	//stuff
	const app = new PIXI.Application();
	globalThis.__PIXI_APP__ = app;
	await app.init({
		resizeTo: window
	});
	app.canvas.style.position = 'absolute';
	document.body.appendChild(app.canvas);

	//text styles
	const textStyle = new PIXI.TextStyle({
		fill: 0xffffff,  //white
		fontSize: 30,
		fontFamily: 'Montserrat Medium'
	})
	// create button image
	const button = new PIXI.Graphics()
		.rect(424.5, 224, 108, 158)
		.fill({
			color: 0xffea00,
			alpha: 0.8
		})
		.stroke({
			width: 8,
			color: 0x00ff00
		});

	// Enable interactivity
	button.interactive = true;
	button.buttonMode = true; // Changes the cursor to a pointer when hovering over the button

	// Add event listeners
	button.on('pointerdown', () => {
		console.log('Button clicked!');
		let results = attack();
		let dmg = caculateDmg(results);
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
	});

	// Add the button to the stage
	app.stage.addChild(button);

})();


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