import fs from 'fs';
import path from 'path';

var enemies = [];
var targetEnemy = null;

let effects = [];
try {
    const data = fs.readFileSync(path.resolve(__dirname, '../assets/effects.json'), 'utf8');
    effects = JSON.parse(data);
} catch (error) {
    console.error("Error reading or parsing effects.json:", error);
}

export function getEffect(id) {
    let effect = effects.find((element) => element.id == id);
    if (effect == null) {
        console.error("Effect not found");
        return null;
    }
    return effect;
}

export function setEnemies(enemyList) {
    enemies = enemyList;
}
export function getEnemies() {
    return enemies;
}
export function setTargetEnemy(enemy) {
    targetEnemy = enemies.findIndex((element) => element == enemy);
    if (targetEnemy == -1) {
        targetEnemy = null;
    }
    return targetEnemy;
}

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
        die.face = die.sides[Math.floor(Math.random() * die.sides.length)];
    });
    diceOutOfBag = diceOutOfBag.sort((a, b) => a.face - b.face);
    enemies.forEach((enemy) => {
        if (enemy.statusEffects != null) {
            ticDmgEnemy(enemy);
        }
        if (enemy.hp <= 0) {
            enemies.splice(enemies.indexOf(enemy), 1);
        }
    });
    return ([diceOutOfBag, dice]);
}

export function calculateDmg(dmgDice, playerItems) {
    const numberMap = new Map();
    let posion = 0, burn = 0, bleed = 0;
    let dmg = {
        total: 0,
        effects: []
    }
    if (dmgDice.length == 0) {
        return 0;
    }
    dmgDice.forEach((dice) => {
        if (numberMap.has(dice.face)) {
            numberMap.set(dice.face, numberMap.get(dice.face) + 1);
        } else {
            numberMap.set(dice.face, 1);
        }
        if (dice.effect != null) {
            switch (dice.effect.id) {
                case 1: //posion
                    posion += dice.face;
                    break;
                case 3: //burn
                    burn += dice.face;
                    break;
                case 4: //bleed
                    bleed += dice.face;
                    break;
                default:
                    console.error("Effect not found");
            }
        }
    });

    for (const [num, count] of numberMap.entries()) {
        if (count > 1) {
            dmg.total += num * count * count;
        } else {
            dmg.total += num;
        }
    }

    if (playerItems != null) {
        playerItems.forEach((effect) => {
            switch (effect.id) {
                case 2:  //posion dagger
                    posion += dmg.total;
                    break;
                case 3:  //claymore
                    dmg.effects.push({ id: 6, value: dmg.total / 2 });
                    break;
                default:
                    console.error("item not found");
            }
        });
    }
    if (posion > 0) {
        dmg.effects.push({ id: 1, value: posion });
    }
    if (burn > 0) {
        dmg.effects.push({ id: 3, value: burn });
    }
    if (bleed > 0) {
        dmg.effects.push({ id: 4, value: bleed });
    }
    return dmg;
}

export function playerAttack(dice, effects) {
    let playerDmg = calculateDmg(dice, effects);
    let enemy = enemies[targetEnemy];
    if (enemy == null) {
        console.error("No target enemy");
        return;
    }
    enemy.hp -= playerDmg.total;
    enemy.statusEffects = playerDmg.effects || [];
    if (playerDmg.effects.find(id => id.id == 6)) {
        while (enemy == enemies[targetEnemy]) {
            enemy = enemies[Math.floor(Math.random() * enemies.length)];
        }
        enemy.hp -= playerDmg.total / 2;
    }
}

function ticDmgEnemy(enemy) {
    let enemyHp = enemy.hp;
    enemy.statusEffects.forEach((effect) => {
        switch (effect.id) {
            case 1: // poison
                enemyHp -= effect.value;
                break;
            case 3: // burn
                enemyHp -= effect.value;
                effect.value -= 1;
                if (effect.value <= 0) {
                    enemy.statusEffects.splice(enemy.statusEffects.indexOf(effect), 1);
                }
                break;
            case 4: // bleed
                enemyHp -= effect.value;
                break;
            default:
                console.error("Effect not found");
        }
    });
    enemy.hp = enemyHp;
}