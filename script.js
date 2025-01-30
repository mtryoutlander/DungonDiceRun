const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function rollDice() {
    const diceElement = document.getElementById('dice');
    const randomIndex = Math.floor(Math.random() * diceFaces.length);
    diceElement.textContent = diceFaces[randomIndex];
}