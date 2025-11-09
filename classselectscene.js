// ClassSelectScene - Choose your hero class
class ClassSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClassSelectScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        this.add.text(width / 2, 80, GameConfig.text.chooseHero, {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Create class cards
        const classes = ['tank', 'assassin', 'mage'];
        const cardWidth = 280;
        const cardSpacing = 50;
        const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (width - totalWidth) / 2;
        
        classes.forEach((className, index) => {
            const x = startX + (cardWidth / 2) + (index * (cardWidth + cardSpacing));
            this.createClassCard(x, height / 2, className);
        });
        
        // Back button
        this.createBackButton();
    }
    
    createClassCard(x, y, className) {
        const classConfig = GameConfig.classes[className];
        
        // Card background
        const card = this.add.rectangle(x, y, 260, 400, 0x2a2a2a)
            .setStrokeStyle(3, 0x555555)
            .setInteractive({ useHandCursor: true });
        
        // Icon
        const icon = this.add.text(x, y - 130, classConfig.icon, {
            fontSize: '80px'
        }).setOrigin(0.5);
        
        // Name
        const name = this.add.text(x, y - 50, classConfig.name, {
            fontSize: '32px',
            color: classConfig.color,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Stats
        const statsY = y + 10;
        const statsText = [
            `HP: ${classConfig.maxHp}`,
            `Damage: ${classConfig.damage}`,
            `Speed: ${Math.round(classConfig.speed / 220 * 100)}%`,
            `Range: ${classConfig.range}`
        ].join('\n');
        
        const stats = this.add.text(x, statsY, statsText, {
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Description
        const desc = this.add.text(x, y + 140, classConfig.description, {
            fontSize: '14px',
            color: '#ffd700',
            align: 'center',
            wordWrap: { width: 240 }
        }).setOrigin(0.5);
        
        // Hover effects
        card.on('pointerover', () => {
            card.setStrokeStyle(3, 0xffd700);
            card.setScale(1.05);
            icon.setScale(1.05);
            name.setScale(1.05);
            stats.setScale(1.05);
            desc.setScale(1.05);
        });
        
        card.on('pointerout', () => {
            card.setStrokeStyle(3, 0x555555);
            card.setScale(1);
            icon.setScale(1);
            name.setScale(1);
            stats.setScale(1);
            desc.setScale(1);
        });
        
        card.on('pointerdown', () => {
            this.selectClass(className);
        });
    }
    
    selectClass(className) {
        console.log(`Selected class: ${className}`);
        
        // Set hero class in game data
        gameData.setHeroClass(className);
        
        // Save the game
        gameData.saveGame();
        
        // Visual feedback
        this.cameras.main.flash(500, 255, 215, 0);
        
        // Wait a bit then transition
        this.time.delayedCall(500, () => {
            this.scene.start('CastleScene');
        });
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        const backBtn = this.add.rectangle(80, height - 40, 120, 40, 0x444444)
            .setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(80, height - 40, '← Back', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x666666);
        });
        
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x444444);
        });
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}