const fs = require('fs');
const path = require('path');
const PIXI = require('pixi.js');
const {
    pause,
    unpause,
    mainMenue,
    removeSelectedFromCurrent,
    combatLoadEnemies,
    startCombat,
    eraseDice,
    storeDice,
    scaleTextToFitSprite,
    drawDice,
    drawHelp,
    createButton,
    createContainer,
    createSprite,
    updateHealthBar,
    loadEnemy,
    player,
    app,
    isPaused,
    texturesPromise
} = require('../scripts/main.js');

jest.mock('fs');
jest.mock('path');

describe('Main Functions', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset player object
        player.name = '';
        player.hp = 0;
        player.dice = [];
        player.rollSize = 0;
        // Reset PIXI application
        app.stage.removeChildren();
        isPaused = false;
    });

    describe('pause', () => {
        it('should add the options container to the stage and set isPaused to true', () => {
            pause();
            expect(app.stage.children).toContainEqual(expect.objectContaining({ label: 'optionMenue' }));
            expect(isPaused).toBe(true);
        });
    });

    describe('unpause', () => {
        it('should remove the options container from the stage and set isPaused to false', () => {
            pause();
            unpause();
            expect(app.stage.children).not.toContainEqual(expect.objectContaining({ label: 'optionMenue' }));
            expect(isPaused).toBe(false);
        });
    });

    describe('mainMenue', () => {
        it('should add the startMenu container to the stage', () => {
            mainMenue();
            expect(app.stage.children).toContainEqual(expect.objectContaining({ label: 'startMenue' }));
        });
    });

    describe('removeSelectedFromCurrent', () => {
        it('should remove selected items from the total array', () => {
            const total = [{ id: 1 }, { id: 2 }, { id: 3 }];
            const selected = [{ id: 2 }];
            const result = removeSelectedFromCurrent(total, selected);
            expect(result).toEqual([{ id: 1 }, { id: 3 }]);
        });
    });

    describe('combatLoadEnemies', () => {
        it('should load enemies from a JSON file and set them using setEnemies', () => {
            const mockEnemies = [{ id: 1, name: 'Goblin' }];
            fs.readFileSync.mockReturnValue(JSON.stringify(mockEnemies));
            path.resolve.mockReturnValue('/mock/path/to/goblins.json');

            combatLoadEnemies('goblins.json');

            expect(getEnemies()).toEqual(mockEnemies);
        });

        it('should handle errors when reading the JSON file', () => {
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });
            path.resolve.mockReturnValue('/mock/path/to/goblins.json');

            console.error = jest.fn();

            combatLoadEnemies('goblins.json');

            expect(console.error).toHaveBeenCalledWith("Error reading or parsing goblins.json", expect.any(Error));
        });
    });

    describe('startCombat', () => {
        it('should remove all children from the stage, load enemies, and add the enemyContainer and hub to the stage', () => {
            startCombat();
            expect(app.stage.children).toContainEqual(expect.objectContaining({ label: 'enemyContainer' }));
            expect(app.stage.children).toContainEqual(expect.objectContaining({ label: 'hub' }));
        });
    });

    describe('eraseDice', () => {
        it('should remove dice from the current roll background', () => {
            const dice = { label: 'dice' };
            currentRollBackground.addChild(dice);
            eraseDice('current');
            expect(currentRollBackground.children).not.toContain(dice);
        });

        it('should remove dice from the bank', () => {
            const dice = { label: 'dice' };
            bank.addChild(dice);
            eraseDice('all');
            expect(bank.children).not.toContain(dice);
        });
    });

    describe('storeDice', () => {
        it('should add dice to selectedDice if not already present', () => {
            const dice = { id: 1 };
            storeDice(dice);
            expect(selectedDice).toContain(dice);
        });

        it('should remove dice from selectedDice if already present', () => {
            const dice = { id: 1 };
            selectedDice.push(dice);
            storeDice(dice);
            expect(selectedDice).not.toContain(dice);
        });
    });

    describe('scaleTextToFitSprite', () => {
        it('should scale text to fit within the sprite', () => {
            const sprite = { width: 100, height: 50 };
            const text = { style: { fontSize: 100 }, width: 200, height: 100 };
            scaleTextToFitSprite(sprite, text, 10);
            expect(text.style.fontSize).toBeLessThan(100);
        });
    });

    describe('drawDice', () => {
        it('should draw dice and update the damage total', async () => {
            const dice = [{ name: 'd6', image: 'd6.png', face: 6 }];
            await texturesPromise;
            drawDice(dice, 'current');
            expect(diceUiContainer.children).toContainEqual(expect.objectContaining({ label: 'dmgText' }));
        });
    });

    describe('drawHelp', () => {
        it('should draw a sprite and add it to the correct position', () => {
            const sprite = { label: 'dice', width: 50, height: 50, scale: 1, x: 0, y: 0, addChild: jest.fn() };
            const die = { face: 6 };
            drawHelp(sprite, 0, die, 'current');
            expect(currentRollBackground.children).toContain(sprite);
        });
    });

    describe('createButton', () => {
        it('should create a button with the correct properties', () => {
            const button = createButton('Test', 100, 100, jest.fn());
            expect(button.text).toBe('Test');
            expect(button.position.x).toBe(100);
            expect(button.position.y).toBe(100);
        });
    });

    describe('createContainer', () => {
        it('should create a container with the correct properties', () => {
            const container = createContainer('testContainer', 100, 100, 0, 0);
            expect(container.label).toBe('testContainer');
            expect(container.width).toBe(100);
            expect(container.height).toBe(100);
        });
    });

    describe('createSprite', () => {
        it('should create a sprite with the correct properties', () => {
            const texture = PIXI.Texture.WHITE;
            const sprite = createSprite('testSprite', texture, 0, 0, jest.fn());
            expect(sprite.label).toBe('testSprite');
            expect(sprite.texture).toBe(texture);
        });
    });

    describe('updateHealthBar', () => {
        it('should update the health bar and text', () => {
            updateHealthBar(5, 10);
            expect(healthBar.width).toBe(100); // 50% of 200
            expect(healthText.text).toBe('HP: 5 / 10');
        });
    });

    describe('loadEnemy', () => {
        it('should load enemy textures and add them to the enemyContainer', async () => {
            const mockEnemies = [{ id: 1, name: 'Goblin', sprite: 'goblin.png', hp: 10 }];
            setEnemies(mockEnemies);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockEnemies));
            path.resolve.mockReturnValue('/mock/path/to/goblin.png');

            await loadEnemy();

            expect(enemyContainer.children).toHaveLength(mockEnemies.length);
        });

        it('should handle errors when loading enemy textures', async () => {
            const mockEnemies = [{ id: 1, name: 'Goblin', sprite: 'goblin.png', hp: 10 }];
            setEnemies(mockEnemies);
            fs.readFileSync.mockReturnValue(JSON.stringify(mockEnemies));
            path.resolve.mockReturnValue('/mock/path/to/goblin.png');

            PIXI.Assets.load = jest.fn().mockRejectedValue(new Error('Texture load error'));

            console.error = jest.fn();

            await loadEnemy();

            expect(console.error).toHaveBeenCalledWith('Failed to load texture:', expect.any(Error));
        });
    });
});

describe('Player Functions', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Reset player object
        player.name = '';
        player.hp = 0;
        player.dice = [];
        player.rollSize = 0;
    });

    describe('loadPlayer', () => {
        it('should load player data from localStorage', () => {
            const mockPlayerData = {
                name: 'Test Player',
                hp: 100,
                dice: [{ sides: 6, face: 1 }],
                rollSize: 2
            };
            localStorage.setItem('player', JSON.stringify(mockPlayerData));

            loadPlayer();

            expect(player.name).toBe(mockPlayerData.name);
            expect(player.hp).toBe(mockPlayerData.hp);
            expect(player.dice).toEqual(mockPlayerData.dice);
            expect(player.rollSize).toBe(mockPlayerData.rollSize);
        });

        it('should handle errors when parsing player data from localStorage', () => {
            localStorage.setItem('player', '{invalid json}');

            console.error = jest.fn();

            loadPlayer();

            expect(console.error).toHaveBeenCalledWith("Error parsing player data from localStorage", expect.any(SyntaxError));
            expect(player.name).toBe('');
            expect(player.hp).toBe(0);
            expect(player.dice).toEqual([]);
            expect(player.rollSize).toBe(0);
        });

        it('should do nothing if no player data is found in localStorage', () => {
            loadPlayer();

            expect(player.name).toBe('');
            expect(player.hp).toBe(0);
            expect(player.dice).toEqual([]);
            expect(player.rollSize).toBe(0);
        });
    });

    describe('createPlayer', () => {
        it('should load player data from player.json and save it to localStorage', () => {
            const mockPlayerData = [
                {
                    name: 'Test Player',
                    hp: 100,
                    dice: [{ sides: 6, face: 1 }],
                    rollSize: 2
                }
            ];
            fs.readFileSync.mockReturnValue(JSON.stringify(mockPlayerData));
            path.resolve.mockReturnValue('/mock/path/to/player.json');

            createPlayer(1);

            expect(player.name).toBe(mockPlayerData[0].name);
            expect(player.hp).toBe(mockPlayerData[0].hp);
            expect(player.dice).toEqual(mockPlayerData[0].dice);
            expect(player.rollSize).toBe(mockPlayerData[0].rollSize);
            expect(localStorage.getItem('player')).toBe(JSON.stringify(mockPlayerData[0]));
        });

        it('should handle errors when reading player.json', () => {
            fs.readFileSync.mockImplementation(() => {
                throw new Error('File read error');
            });
            path.resolve.mockReturnValue('/mock/path/to/player.json');

            console.error = jest.fn();

            createPlayer(1);

            expect(console.error).toHaveBeenCalledWith("Error reading or parsing player.json:", expect.any(Error));
            expect(player.name).toBe('');
            expect(player.hp).toBe(0);
            expect(player.dice).toEqual([]);
            expect(player.rollSize).toBe(0);
            expect(localStorage.getItem('player')).toBeNull();
        });
    });
});

describe('eraseDice', () => {
    test('should erase current dice', () => {
        // Setup your test environment and call eraseDice('current')
        // Verify that the current dice are erased
    });

    test('should erase all dice', () => {
        // Setup your test environment and call eraseDice('all')
        // Verify that all dice are erased
    });
});
