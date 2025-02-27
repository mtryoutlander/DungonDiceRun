const { getEffect, setEnemies, getEnemies, setTargetEnemy, roll, calculateDmg, playerAttack } = require('../scripts/combat.js');
const fs = require('fs');
const path = require('path');

jest.mock('fs');

describe('Combat Module', () => {
    const mockEffects = [
        { id: 1, name: 'Poison', description: 'Their real sick', combatDescription: 'They take 1 damage every roll', sprite: '../assets/poison.png' },
        { id: 3, name: 'Burn', description: 'They are on fire', combatDescription: 'They take 1 damage every roll', sprite: '../assets/burn.png' },
        { id: 4, name: 'Bleed', description: 'They are bleeding', combatDescription: 'They take 1 damage every turn', sprite: '../assets/bleed.png' }
    ];

    beforeAll(() => {
        fs.readFileSync.mockReturnValue(JSON.stringify(mockEffects));
    });

    describe('getEffect', () => {
        it('should return the correct effect by id', () => {

            const effect = getEffect(1);
            expect(effect).toEqual({ id: 1, name: 'Poison', description: 'Their real sick', combatDescription: 'They take 1 damage every roll', sprite: '../assets/poison.png' });
        });

        it('should return null and log error if effect not found', () => {
            console.error = jest.fn();
            const effect = getEffect(999);
            expect(effect).toBeNull();
            expect(console.error).toHaveBeenCalledWith('Effect not found');
        });
    });

    describe('setEnemies and getEnemies', () => {
        it('should set and get enemies correctly', () => {
            const enemyList = [{ id: 1, name: 'Goblin' }, { id: 2, name: 'Orc' }];
            setEnemies(enemyList);
            const enemies = getEnemies();
            expect(enemies).toEqual(enemyList);
        });
    });

    describe('setTargetEnemy', () => {
        it('should set the target enemy correctly', () => {
            const enemyList = [{ id: 1, name: 'Goblin' }, { id: 2, name: 'Orc' }];
            setEnemies(enemyList);
            let targetEnemy = setTargetEnemy(enemyList[1]);
            expect(targetEnemy).toBe(1);
        });

        it('should set targetEnemy to null if enemy not found', () => {
            const enemyList = [{ id: 1, name: 'Goblin' }];
            setEnemies(enemyList);
            let targetEnemy = setTargetEnemy({ id: 2, name: 'Orc' });
            expect(targetEnemy).toBeNull();
        });
    });

    describe('roll', () => {
        it('should roll the correct number of dice and apply effects', () => {
            const dice = [
                { sides: [1, 2, 3, 4, 5, 6], face: 1 },
                { sides: [1, 2, 3, 4, 5, 6], face: 2 },
                { sides: [1, 2, 3, 4, 5, 6], face: 3 }
            ];
            const [rolledDice, remainingDice] = roll(dice, 2);
            expect(rolledDice.length).toBe(2);
            expect(remainingDice.length).toBe(1);
        });
    });

    describe('calculateDmg', () => {
        it('should calculate damage correctly for unique dice faces', () => {
            const dice = [
                { sides: 6, face: 1 },
                { sides: 6, face: 2 },
                { sides: 6, face: 3 }
            ];
            const playerItems = [{ id: 2 }];
            const dmg = calculateDmg(dice, playerItems);
            expect(dmg.total).toBe(6);
            expect(dmg.effects.length).toBeGreaterThan(0);
        });
    });

    describe('playerAttack', () => {
        it('should apply damage to the target enemy', () => {
            const enemyList = [{ id: 1, name: 'Goblin', hp: 10, statusEffects: [] }];
            setEnemies(enemyList);
            setTargetEnemy(enemyList[0]);
            const dice = [{ face: 2, effect: { id: 1 } }];
            const effects = [{ id: 2 }];
            playerAttack(dice, effects);
            expect(enemyList[0].hp).toBeLessThan(10);
        });
    });
});