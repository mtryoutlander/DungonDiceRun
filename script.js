const Dindex = ['1','2','3','4','5','6','7','8'];

// Load saved data or initialize defaults
let hp = localStorage.getItem('hp') ? parseInt(localStorage.getItem('hp')) : 100;
let money = localStorage.getItem('money') ? parseInt(localStorage.getItem('money')) : 50;
const dice = JSON.parse(localStorage.getItem("player") ).dice ;

function attack() {
	const image = document.getElementById('flash-image');
    const diceElement = document.getElementById('dice');
	const results= [];
	forEach(die in dice){
		results.add(roll(die));
	}
	diceElement.textContent ="";
	const numberMap = new Map();
	forEach(result in results){
		diceElement.textContent = diceElement.textContent +","+ Dindex[result];
		if (numberMap.has(num)) {
            numberMap.set(num, numberMap.get(num) + 1);
        } else {
            numberMap.set(num, 1);
        }
	}
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
	damage-container.textContent = dmg;
	
	image.classList.add('flashing');
	image.addEventListener('animationend', () => {
        image.classList.remove('flash-once');
    }, { once: true });
    updateStats(); // Update displayed stats
    saveData(); // Save data to localStorage
	
}

function roll(die){
	const randomIndex = Math.floor(Math.random() * die.sides);
    return (randomIndex + 1);
}

function updateStats() {
    document.getElementById('hp').textContent = hp;
    document.getElementById('money').textContent = money;
    document.getElementById('dice-value').textContent = dice;
}

function saveData() {
    localStorage.setItem('hp', hp);
    localStorage.setItem('money', money);
    localStorage.setItem('dice', dice);
}
function createAdventure(){
	const player ={
		hp: 10,
		money: 0,
		enemiesDefeated: 0,
		dice:[{sides:6},{sides:6},{sides:6}]
	}
	localStorage.setItem("player", JSON.stringify(player));

}
// Display initial stats
updateStats();