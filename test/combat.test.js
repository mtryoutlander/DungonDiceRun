const { calculateDmg, roll } = require('../scripts/combat.js');

describe('calculateDmg', () => {
    test('should calculate damage correctly for unique dice faces', () => {
        const dice = [
            { sides: 6, face: 1 },
            { sides: 6, face: 2 },
            { sides: 6, face: 3 }
        ];
        const result = calculateDmg(dice);
        expect(result).toBe(6); // 1 + 2 + 3
    });

    test('should calculate damage correctly for duplicate dice faces', () => {
        const dice = [
            { sides: 6, face: 2 },
            { sides: 6, face: 2 },
            { sides: 6, face: 3 }
        ];
        const result = calculateDmg(dice);
        expect(result).toBe(11); // (2 * 2 * 2) + 3
    });

    test('should return 0 for empty dice array', () => {
        const dice = [];
        const result = calculateDmg(dice);
        expect(result).toBe(0);
    });
});

describe('roll', () => {
    test('should roll the correct number of dice', () => {
        const player = {
            dice: [
                { sides: 6, face: 0 },
                { sides: 6, face: 0 },
                { sides: 6, face: 0 }
            ],
            rollSize: 2
        };
        localStorage.setItem('player', JSON.stringify(player));
        const result = roll(player.rollSize);
        expect(result.length).toBe(2);
    });

    test('should not roll more dice than available', () => {
        const player = {
            dice: [
                { sides: 6, face: 0 }
            ],
            rollSize: 2
        };
        localStorage.setItem('player', JSON.stringify(player));
        const result = roll(player.rollSize);
        expect(result.length).toBe(1);
    });
});
describe('playerAttack', () => {
    test('should reduce enemy HP correctly', () => {
        // Setup your test environment and call attack()
        // Verify that the enemy HP is reduced correctly
    });
});

