
function roll(numberOfDiceToRoll) {
    let diceOutOfBag = [];
    if (player.dice.length < numberOfDiceToRoll)
        numberOfDiceToRoll = player.dice.length;
    for (let i = 0; i < numberOfDiceToRoll; i++) {
        let index = Math.floor(Math.random() * (player.dice.length));
        diceOutOfBag.push(player.dice[index]);
        player.dice.splice(index, 1);
    }
    diceOutOfBag.forEach((die) => {
        die.face = Math.floor(Math.random() * die.sides) + 1;
    });
    diceOutOfBag = diceOutOfBag.sort((a, b) => a.face - b.face);
    return (diceOutOfBag);
}

function calculateDmg(dmgDice) {  /// change it so give an array of dmgDice will out put dmg
    const numberMap = new Map();
    dmgDice.forEach((dice) => {
        /* diceElement.textContent = diceElement.textContent + ", " result; */
        if (numberMap.has(dice.face)) {
            numberMap.set(dice.face, numberMap.get(dice.face) + 1);
        } else {
            numberMap.set(dice.face, 1);
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
function playerAttack(dice, effects) {

}