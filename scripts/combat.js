import { player } from './main.js';
export function roll(dice, numberOfDiceToRoll) {
    let diceOutOfBag = [];
    if (dice.length < numberOfDiceToRoll)
        numberOfDiceToRoll = dice.length;
    for (let i = 0; i < numberOfDiceToRoll; i++) {
        let index = Math.floor(Math.random() * (dice.length));
        diceOutOfBag.push(dice[index]);
        dice.splice(index, 1);
    }
    diceOutOfBag.forEach((die) => {
        die.face = Math.floor(Math.random() * die.sides) + 1;
    });
    diceOutOfBag = diceOutOfBag.sort((a, b) => a.face - b.face);
    return ([diceOutOfBag, dice]);
}

export function calculateDmg(dmgDice) {  /// change it so give an array of dmgDice will out put dmg
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
function readEffect() {  // this will store the search though all effects in the json and return the need info

}

export function playerAttack(dice, effects) {




    /*
    old code
    let enemyHp = selectedEnemy.logic.hp;
    enemyHp = enemyHp - dmgTotal;
    selectedEnemy.visural.children.find((element) => element.label == 'currentHp').
    diceUiContainer.removeChild(diceUiContainer.children.find((element) => element.label == 'dmgText'));
    const dmgText = new PIXI.Text({ text: "Dmg Total: " + dmgTotal, style: textStyle });
    dmgText.label = 'dmgText';
    dmgText.position.set(diceUiContainer.width / 3 * scale, diceUiContainer.height * scale);
    diceUiContainer.addChild(dmgText);
    */
}
