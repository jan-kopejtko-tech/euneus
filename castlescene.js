// CastleScene - Castle building and management
class CastleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleScene' });
        this.passiveGoldTimer = 0;
        this.levelBlocker = null;
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        
        // Initialize level blocker
        this.levelBlocker = new LevelBlocker(this);
        
        // Show trial banner if in trial mode
        this.trialBannerElements = this.levelBlocker.showTrialBanner();
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x2d5016);
        
        // Castle in center
        this.createCastle();
        
        // UI Panel at bottom
        this.createUI();
        
        // Buildings menu on right
        this.createBuildingsMenu();
        
        // Start passive gold generation
        this.passiveGoldTimer = 0;
    }
    
    update(time, delta) {
        // Passive gold generation
        this.passiveGoldTimer += delta;
        if (this.passiveGoldTimer >= 1000) {
            this.passiveGoldTimer -= 1000;
            const goldRate = gameData.getPassiveGoldRate();
            if (goldRate > 0) {
                gameData.addGold(goldRate);
                this.updateGoldDisplay();
            }
        }
    }
    
    createCastle() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 - 50;
        
        // Main castle
        this.add.text(centerX, centerY, GameConfig.emojis.castle, {
            fontSize: '120px'
        }).setOrigin(0.5);
        
        // Castle name
        this.add.text(centerX, centerY - 100, 'Castle Euneus', {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Display walls
        this.displayWalls(centerX, centerY);
        
        // Display towers
        this.displayTowers(centerX, centerY);
        
        // Display peasants
        this.displayPeasants(centerX, centerY);
    }
    
    displayWalls(centerX, centerY) {
        const walls = gameData.data.castle.walls;
        const wallPositions = [
            { x: -150, y: -50 },
            { x: 150, y: -50 },
            { x: -150, y: 50 },
            { x: 150, y: 50 }
        ];
        
        walls.forEach((wall, index) => {
            if (index < wallPositions.length) {
                const pos = wallPositions[index];
                this.add.text(centerX + pos.x, centerY + pos.y, GameConfig.emojis.wall, {
                    fontSize: '48px'
                }).setOrigin(0.5);
            }
        });
    }
    
    displayTowers(centerX, centerY) {
        const towers = gameData.data.castle.towers;
        const towerPositions = [
            { x: -200, y: -100 },
            { x: 200, y: -100 },
            { x: -200, y: 100 },
            { x: 200, y: 100 }
        ];
        
        towers.forEach((tower, index) => {
            if (index < towerPositions.length) {
                const pos = towerPositions[index];
                this.add.text(centerX + pos.x, centerY + pos.y, GameConfig.emojis.tower, {
                    fontSize: '48px'
                }).setOrigin(0.5);
            }
        });
    }
    
    displayPeasants(centerX, centerY) {
        const peasantCount = gameData.data.castle.peasants;
        if (peasantCount > 0) {
            this.add.text(centerX, centerY + 120, GameConfig.emojis.peasant.repeat(Math.min(peasantCount, 5)), {
                fontSize: '32px'
            }).setOrigin(0.5);
            
            if (peasantCount > 5) {
                this.add.text(centerX, centerY + 160, `+${peasantCount - 5} more`, {
                    fontSize: '16px',
                    color: '#ffd700'
                }).setOrigin(0.5);
            }
        }
    }
    
    createUI() {
        const { width, height } = this.cameras.main;
        
        // Bottom panel
        this.add.rectangle(width / 2, height - 50, width, 100, 0x000000, 0.7);
        
        // Gold display
        this.goldText = this.add.text(20, height - 75, '', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0);
        this.updateGoldDisplay();
        
        // Level display
        this.add.text(20, height - 40, `${GameConfig.text.level}: ${gameData.data.currentLevel}`, {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0);
        
        // Hero info
        const heroClass = gameData.data.hero.class;
        const classConfig = GameConfig.classes[heroClass];
        
        this.add.text(300, height - 75, `${classConfig.icon} ${classConfig.name}`, {
            fontSize: '24px',
            color: classConfig.color,
            fontStyle: 'bold'
        }).setOrigin(0);
        
        this.add.text(300, height - 45, `Lv.${gameData.data.hero.level} | HP:${gameData.data.hero.maxHp} | DMG:${gameData.data.hero.damage}`, {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0);
        
        // TEMPORARY DEBUG BUTTON - Very obvious at top of screen
        const debugStartBtn = this.add.rectangle(width / 2, 100, 400, 100, 0xff0000)
            .setInteractive({ useHandCursor: true })
            .setDepth(9999);
        
        const debugStartText = this.add.text(width / 2, 100, 'ðŸŽ® CLICK HERE TO START BATTLE', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#000000',
            padding: { x: 10, y: 10 }
        }).setOrigin(0.5).setDepth(10000);
        
        debugStartBtn.on('pointerover', () => {
            debugStartBtn.setFillStyle(0xff6666);
        });
        
        debugStartBtn.on('pointerout', () => {
            debugStartBtn.setFillStyle(0xff0000);
        });
        
        debugStartBtn.on('pointerdown', () => {
            console.log('DEBUG: Start button clicked!');
            this.startLevel();
        });
        
        // Start Level button (BIG and prominent) - moved up to be more visible
        const startBtn = this.add.rectangle(width / 2, height - 120, 300, 80, 0x00aa00)
            .setInteractive({ useHandCursor: true });
        
        const startText = this.add.text(width / 2, height - 120, 'â–¶ï¸ ' + GameConfig.text.startLevel, {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        startBtn.on('pointerover', () => {
            startBtn.setFillStyle(0x00cc00);
            startText.setScale(1.05);
        });
        
        startBtn.on('pointerout', () => {
            startBtn.setFillStyle(0x00aa00);
            startText.setScale(1);
        });
        
        startBtn.on('pointerdown', () => {
            this.startLevel();
        });
        
        // Back to menu button
        const menuBtn = this.add.rectangle(80, 40, 120, 40, 0x444444)
            .setInteractive({ useHandCursor: true });
        
        const menuText = this.add.text(80, 40, 'â† Menu', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        menuBtn.on('pointerover', () => menuBtn.setFillStyle(0x666666));
        menuBtn.on('pointerout', () => menuBtn.setFillStyle(0x444444));
        menuBtn.on('pointerdown', () => {
            gameData.saveGame();
            this.scene.start('MenuScene');
        });
    }
    
    createBuildingsMenu() {
        const { width, height } = this.cameras.main;
        const menuX = width - 220;
        const startY = 120;
        
        // Menu background
        this.add.rectangle(menuX, 300, 200, 500, 0x000000, 0.7);
        
        // Title
        this.add.text(menuX, startY, GameConfig.text.buildings, {
            fontSize: '24px',
            color: '#ffd700',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Building buttons
        const buildings = ['wall', 'tower', 'gate', 'peasant', 'barracks'];
        
        buildings.forEach((buildingType, index) => {
            this.createBuildingButton(menuX, startY + 60 + (index * 70), buildingType);
        });
    }
    
    createBuildingButton(x, y, buildingType) {
        const building = GameConfig.buildings[buildingType];
        
        const btn = this.add.rectangle(x, y, 180, 60, 0x2a2a2a)
            .setStrokeStyle(2, 0x555555)
            .setInteractive({ useHandCursor: true });
        
        const icon = this.add.text(x - 70, y, building.icon, {
            fontSize: '32px'
        }).setOrigin(0.5);
        
        const name = this.add.text(x - 30, y - 10, building.name, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);
        
        const cost = this.add.text(x - 30, y + 10, `${GameConfig.emojis.gold} ${building.cost}`, {
            fontSize: '14px',
            color: '#ffd700'
        }).setOrigin(0, 0.5);
        
        btn.on('pointerover', () => {
            btn.setStrokeStyle(2, 0xffd700);
        });
        
        btn.on('pointerout', () => {
            btn.setStrokeStyle(2, 0x555555);
        });
        
        btn.on('pointerdown', () => {
            this.buyBuilding(buildingType);
        });
    }
    
    buyBuilding(buildingType) {
        const building = GameConfig.buildings[buildingType];
        
        if (gameData.data.totalGold < building.cost) {
            this.showMessage('Not enough gold!', 0xff0000);
            return;
        }
        
        const success = gameData.buildBuilding(buildingType);
        
        if (success) {
            this.showMessage(`${building.name} built!`, 0x00ff00);
            this.updateGoldDisplay();
            gameData.saveGame();
            
            // Refresh castle display
            this.scene.restart();
        }
    }
    
    updateGoldDisplay() {
        const passiveRate = gameData.getPassiveGoldRate();
        let text = `${GameConfig.emojis.gold} ${gameData.data.totalGold}`;
        if (passiveRate > 0) {
            text += ` (+${passiveRate}/s)`;
        }
        this.goldText.setText(text);
    }
    
    showMessage(text, color) {
        const { width, height } = this.cameras.main;
        
        const msg = this.add.text(width / 2, height / 2 - 200, text, {
            fontSize: '32px',
            color: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            y: msg.y - 50,
            alpha: 0,
            duration: 2000,
            onComplete: () => msg.destroy()
        });
    }
    
    startLevel() {
        const levelConfig = gameData.getCurrentLevelConfig();
        
        if (!levelConfig) {
            alert('You have completed all levels!');
            return;
        }
        
        
        // Check if level is accessible (blocks Level 2+ in trial mode)
        const currentLevel = gameData.data.currentLevel;
        if (this.levelBlocker && this.levelBlocker.checkAndBlock(currentLevel)) {
            console.log(`🔒 Level ${currentLevel} blocked - showing registration screen`);
            return; // Don't start level, blocker is shown
        }
        // Save before starting level
        gameData.saveGame();
        
        // Transition to battle scene
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('BattleScene');
        });
    }
}