function eraseDice(place) {
    let diceToRemove = []
    switch (place) {
        case 'current':
            //finds and removes all the dice
            if (currentRollBackground.children != null)
                currentRollBackground.children.forEach(element => {
                    if (element.label == "dice") {
                        diceToRemove.push(element);
                    }
                });
            break;
        case 'all':
            //finds and removes all the dice
            if (currentRollBackground.children != null)
                currentRollBackground.children.forEach(element => {
                    if (element.label == "dice") {
                        diceToRemove.push(element);
                    }
                });
            if (bank.children != null)
                bank.children.forEach(element => {
                    if (element.label == "dice") {
                        diceToRemove.push(element);
                    }
                });
            break;

    }
    console.log(diceToRemove);
    if (currentRollBackground.children != null)
        diceToRemove.forEach(element => {
            currentRollBackground.removeChild(element);
        });
    if (bank.children != null)
        diceToRemove.forEach(element => {
            bank.removeChild(element);
        })
}
function storeDice(diceToStore) {
    console.log(diceToStore);
    // Check if diceToStore is already in selectedDice
    const index = selectedDice.findIndex(dice => dice === diceToStore);

    if (index !== -1) {
        // If diceToStore is found, remove it from the array
        selectedDice.splice(index, 1);
    } else {
        // If diceToStore is not found, add it to the array
        selectedDice.push(diceToStore);
    }

}
function scaleTextToFitSprite(sprite, text, padding) {
    const maxWidth = sprite.width - padding * 2; // Max width for the text
    const maxHeight = sprite.height - padding * 2; // Max height for the text
    console.log('before: ' + text.style.fontSize);
    // Start with a large font size and reduce it until the text fits
    let fontSize = 100; // Start with a large font size
    text.style.fontSize = fontSize;

    // Reduce font size until the text fits within the sprite's width
    while (text.width > maxWidth || text.height > maxHeight) {
        fontSize--;
        text.style.fontSize = fontSize;
    }

    // Center the text within the sprite
    text.x = (sprite.width);
    text.y = (sprite.height);
    console.log('after: ' + text.style.fontSize);
}
function drawDice(dice, place) {

    texturesPromise.then((textures) => {
        dice.forEach((dice, i) => {
            switch (dice.sides) {
                case 4:
                    drawHelp(new PIXI.Sprite(textures.d4), i, dice, place);
                    break;
                case 6:
                    drawHelp(new PIXI.Sprite(textures.d6), i, dice, place);
                    break;
                case 8:
                    drawHelp(new PIXI.Sprite(textures.d8), i, dice, place);
                    break;
                case 10:
                    drawHelp(new PIXI.Sprite(textures.d10), i, dice, place);
                    break;

            }
            i++;
        });
    });
    dmgTotal = calculateDmg(currentlyRolled.concat(storedDice));
    diceUiContainer.removeChild(diceUiContainer.children.find((element) => element.label == 'dmgText'));
    const dmgText = new PIXI.Text({ text: "Dmg Total: " + dmgTotal, style: textStyle });
    dmgText.label = 'dmgText';
    dmgText.position.set(diceUiContainer.width / 3 * scale, diceUiContainer.height * scale);
    diceUiContainer.addChild(dmgText);
}
function drawHelp(sprite, i, die, place) {
    let position;
    switch (place) {
        case 'current':
            position = currentRollBackground;
            break;
        case 'bank':
            position = bank;
            break;

    }
    sprite.label = 'dice'
    sprite.scale = scale / 2;
    sprite.anchor = (0, 0);
    sprite.x = i * scale * sprite.width;
    sprite.y = Math.floor(i / 3);
    // Enable interactivity
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.on('pointerdown', () => {
        let tempDice = die;
        storeDice(tempDice);
    });

    sprite.on('pointerover', () => (sprite.tint = 0xaaaaaa));
    sprite.on('pointerout', () => (sprite.tint = 0xffffff));
    let face = new PIXI.Text({
        text: die.face, style: {
            fontFamily: 'Arial',
            fontSize: scale,
            fill: 0x000000, // black color
            align: 'center',
            stroke: 0x000000, // Black stroke
        }
    });
    if (place == 'bank') {
        sprite.interactive = false;
    }
    scaleTextToFitSprite(sprite, face, -25);
    position.addChild(sprite);
    sprite.addChild(face);
}
// Function to create a button
function createButton(text, xPostion, yPosition, onClick) {
    const button = new PIXI.Text({
        text: text, style: {
            fontFamily: 'Arial',
            fontSize: Math.min(36 * scale * 10, 64),
            fill: 0xffffff,
            align: 'center',
        }
    });
    button.interactive = true;
    button.buttonMode = true;
    button.anchor.set(0.5);
    button.position.set(xPostion, yPosition);

    // Add event listeners
    button.on('pointerdown', onClick);
    button.on('pointerover', () => (button.tint = 0xaaaaaa));
    button.on('pointerout', () => (button.tint = 0xffffff));

    return button;
}
// Function to update the health bar and text
function updateHealthBar(currentHealth, maxHealth) {
    const healthPercentage = currentHealth / maxHealth;
    healthBar.width = 200 * healthPercentage; // Scale the health bar width

    // Update the health text
    healthText.text = `HP: ${currentHealth} / ${maxHealth}`;
}