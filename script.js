const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Load saved data or initialize defaults
let hp = localStorage.getItem('hp') ? parseInt(localStorage.getItem('hp')) : 100;
let money = localStorage.getItem('money') ? parseInt(localStorage.getItem('money')) : 50;
let dice = localStorage.getItem('dice') ? parseInt(localStorage.getItem('dice')) : 1;

function attack() {
	const image = document.getElementById('flash-image');
    const diceElement = document.getElementById('dice');
    const randomIndex = Math.floor(Math.random() * diceFaces.length);
    dice = randomIndex + 1; // Update dice value (1-6)
    diceElement.textContent = diceFaces[randomIndex];
	image.classList.add('flashing');
	image.addEventListener('animationend', () => {
        image.classList.remove('flash-once');
    }, { once: true });
    updateStats(); // Update displayed stats
    saveData(); // Save data to localStorage
	
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

// Display initial stats
updateStats();