// CastleScene - Castle building and management with Tiny Swords assets!
class CastleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CastleScene' });
        this.passiveGoldTimer = 0;
    }
    
    preload() {
        const basePath = 'assets';
        
        // UI Elements
        this.load.image('btn-blue', `${basePath}/UI/Buttons/Button_Blue.png`);
        this.load.image('btn-blue-hover', `${basePath}/UI/Buttons/Button_Hover.png`);
        this.load.image('btn-blue-pressed', `${basePath}/UI/Buttons/Button_Blue_Pressed.png`);
        this.load.image('btn-red', `${basePath}/UI/Buttons/Button_Red.png`);
        this.load.image('panel-carved', `${basePath}/UI/Banners/Carved_9Slides.png`);
        this.load.image('banner-h', `${basePath}/UI/Banners/Banner_Horizontal.png`);
        this.load.image('ribbon-blue', `${basePath}/UI/Ribbons/Ribbon_Blue_3Slides.png`);
        
        // Buildings
        this.load.image('castle-main', `${basePath}/Factions/Knights/Buildings/Castle/Castle_Blue.png`);
        this.load.image('tower-blue', `${basePath}/Factions/Knights/Buildings/Tower/Tower_Blue.png`);
        this.load.image('house-blue', `${basePath}/Factions/Knights/Buildings/House/House_Blue.png`);
        
        // Ground and terrain
        this.load.image('ground-castle', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('tree-castle', `${basePath}/Resources/Trees/Tree.png`);
        
        // Resources
        this.load.image('gold-pile', `${basePath}/Resources/Resources/G_Idle.png`);
        this.load.spritesheet('sheep-castle', `${basePath}/Resources/Sheep/HappySheep_All.png`,
            { frameWidth: 44, frameHeight: 44 });
        
        // Hero sprite (based on class)
        const heroClass = gameData.data.hero.class || 'tank';
        const classSprites = {
            'tank': `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            'assassin': `${basePath}/Factions/Knights/Troops/Pawn/Red/Pawn_Red.png`,
            'mage': `${basePath}/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png`
        };
        this.load.spritesheet('hero-castle', classSprites[heroClass],
            { frameWidth: 192, frameHeight: 192 });
        
        // Units
        this.load.spritesheet('knight-castle', `${basePath}/Factions/Knights/Troops/Warrior/Red/Warrior_Red.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('archer-castle', `${basePath}/Factions/Knights/Troops/Archer/Red/Archer_Red.png`,
            { frameWidth: 192, frameHeight: 192 });
        
        // Decorations
        for (let i = 1; i <= 10; i++) {
            const num = i.toString().padStart(2, '0');
            this.load.image(`castle-deco${i}`, `${basePath}/Deco/${num}.png`);
        }
        
        // UI Icons for buildings
        this.load.image('icon-wall', `${basePath}/UI/Icons/Regular_01.png`);
        this.load.image('icon-tower', `${basePath}/UI/Icons/Regular_02.png`);
        this.load.image('icon-peasant', `${basePath}/UI/Icons/Regular_03.png`);
        this.load.image('icon-barracks', `${basePath}/UI/Icons/Regular_04.png`);
        this.load.image('icon-gate', `${basePath}/UI/Icons/Regular_05.png`);
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Create animations
        this.createAnimations();
        
        // Background
        this.createBackground(width, height);
        
        // Castle in center
        this.createCastle();
        
        // Display units/army around castle
        this.displayArmy();
        
        // UI Panel at bottom
        this.createUI();
        
        // Buildings menu on right
        this.createBuildingsMenu();
        
        // Decorations
        this.createDecorations(width, height);
        
        // Start passive gold generation
        this.passiveGoldTimer = 0;
        
        console.log('🏰 CastleScene loaded with Tiny Swords assets!');
    }
    
    createAnimations() {
        // Sheep animation
        if (!this.anims.exists('sheep-idle-castle')) {
            this.anims.create({
                key: 'sheep-idle-castle',
                frames: this.anims.generateFrameNumbers('sheep-castle', { start: 0, end: 3 }),
                frameRate: 6,
                repeat: -1
            });
        }
        
        // Hero animation
        if (!this.anims.exists('hero-idle-castle')) {
            this.anims.create({
                key: 'hero-idle-castle',
                frames: this.anims.generateFrameNumbers('hero-castle', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Knight animation
        if (!this.anims.exists('knight-idle-castle')) {
            this.anims.create({
                key: 'knight-idle-castle',
                frames: this.anims.generateFrameNumbers('knight-castle', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Archer animation
        if (!this.anims.exists('archer-idle-castle')) {
            this.anims.create({
                key: 'archer-idle-castle',
                frames: this.anims.generateFrameNumbers('archer-castle', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }
    
    createBackground(width, height) {
        // Sky gradient
        const skyTop = this.add.rectangle(width / 2, 0, width, height / 2, 0x87ceeb);
        skyTop.setOrigin(0.5, 0);
        skyTop.setDepth(-100);
        
        const skyBottom = this.add.rectangle(width / 2, height / 2, width, height / 2, 0x5a9bd5);
        skyBottom.setOrigin(0.5, 0);
        skyBottom.setDepth(-100);
        
        // Ground with tiled texture
        if (this.textures.exists('ground-castle')) {
            const ground = this.add.tileSprite(0, height - 300, width * 2, 300, 'ground-castle');
            ground.setOrigin(0, 0);
            ground.setDepth(-50);
            ground.setTileScale(0.5, 0.5);
        } else {
            const ground = this.add.rectangle(width / 2, height - 150, width, 300, 0x5a7c3e);
            ground.setDepth(-50);
        }
        
        // Background trees
        for (let i = 0; i < 8; i++) {
            const x = (width / 8) * i + (width / 16);
            const y = height - 200 + Phaser.Math.Between(-20, 20);
            
            if (this.textures.exists('tree-castle')) {
                const tree = this.add.image(x, y, 'tree-castle');
                tree.setScale(Phaser.Math.FloatBetween(1.5, 2.5));
                tree.setDepth(-30);
                tree.setAlpha(0.6);
            }
        }
        
        // Ambient sheep
        for (let i = 0; i < 3; i++) {
            const x = 100 + (i * 150);
            const y = height - 120;
            
            if (this.textures.exists('sheep-castle')) {
                const sheep = this.add.sprite(x, y, 'sheep-castle');
                sheep.setScale(1.5);
                sheep.play('sheep-idle-castle');
                sheep.setDepth(-20);
                
                // Wander animation
                this.tweens.add({
                    targets: sheep,
                    x: x + Phaser.Math.Between(-40, 40),
                    duration: 3000 + Math.random() * 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }
    
    createCastle() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 - 50;
        
        // Main castle sprite
        if (this.textures.exists('castle-main')) {
            const castle = this.add.image(centerX, centerY, 'castle-main');
            castle.setScale(2.5);
            castle.setDepth(0);
            
            // Glow effect
            const glow = this.add.circle(centerX, centerY, 150, 0xffd700, 0.1);
            glow.setDepth(-1);
        } else {
            // Fallback
            this.add.text(centerX, centerY, GameConfig.emojis.castle, {
                fontSize: '120px'
            }).setOrigin(0.5);
        }
        
        // Castle name banner
        if (this.textures.exists('ribbon-blue')) {
            const banner = this.add.image(centerX, centerY - 150, 'ribbon-blue');
            banner.setScale(3, 1.5);
            banner.setDepth(1);
        }
        
        // Castle name
        this.add.text(centerX, centerY - 150, 'Castle Euneus', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2);
        
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
            { x: -180, y: -80 },
            { x: 180, y: -80 },
            { x: -180, y: 80 },
            { x: 180, y: 80 }
        ];
        
        walls.forEach((wall, index) => {
            if (index < wallPositions.length) {
                const pos = wallPositions[index];
                
                // Use icon or fallback
                if (this.textures.exists('icon-wall')) {
                    const wallIcon = this.add.image(centerX + pos.x, centerY + pos.y, 'icon-wall');
                    wallIcon.setScale(2);
                    wallIcon.setDepth(0);
                } else {
                    this.add.text(centerX + pos.x, centerY + pos.y, GameConfig.emojis.wall, {
                        fontSize: '48px'
                    }).setOrigin(0.5);
                }
            }
        });
    }
    
    displayTowers(centerX, centerY) {
        const towers = gameData.data.castle.towers;
        const towerPositions = [
            { x: -250, y: -120 },
            { x: 250, y: -120 },
            { x: -250, y: 120 },
            { x: 250, y: 120 }
        ];
        
        towers.forEach((tower, index) => {
            if (index < towerPositions.length) {
                const pos = towerPositions[index];
                
                if (this.textures.exists('tower-blue')) {
                    const towerSprite = this.add.image(centerX + pos.x, centerY + pos.y, 'tower-blue');
                    towerSprite.setScale(1.5);
                    towerSprite.setDepth(0);
                } else {
                    this.add.text(centerX + pos.x, centerY + pos.y, GameConfig.emojis.tower, {
                        fontSize: '48px'
                    }).setOrigin(0.5);
                }
            }
        });
    }
    
    displayPeasants(centerX, centerY) {
        const peasantCount = gameData.data.castle.peasants;
        if (peasantCount > 0) {
            // Show houses for peasants
            const housesX = centerX - 100;
            const housesY = centerY + 150;
            
            if (this.textures.exists('house-blue')) {
                const house = this.add.image(housesX, housesY, 'house-blue');
                house.setScale(1.2);
                house.setDepth(-5);
            }
            
            // Peasant count text
            this.add.text(housesX, housesY + 50, `${GameConfig.emojis.peasant} x${peasantCount}`, {
                fontSize: '20px',
                color: '#ffd700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
        }
    }
    
    displayArmy() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2 - 50;
        
        // Display hero
        if (this.textures.exists('hero-castle')) {
            const hero = this.add.sprite(centerX - 80, centerY + 100, 'hero-castle');
            hero.setScale(0.8);
            hero.play('hero-idle-castle');
            hero.setDepth(5);
            
            // Hero label
            const heroClass = gameData.data.hero.class;
            const classConfig = GameConfig.classes[heroClass];
            this.add.text(centerX - 80, centerY + 140, classConfig.name, {
                fontSize: '14px',
                color: classConfig.color,
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(6);
        }
        
        // Display knights
        const knights = gameData.data.army.knights || 0;
        if (knights > 0 && this.textures.exists('knight-castle')) {
            const knightX = centerX + 20;
            const knightY = centerY + 100;
            
            const knight = this.add.sprite(knightX, knightY, 'knight-castle');
            knight.setScale(0.7);
            knight.play('knight-idle-castle');
            knight.setDepth(5);
            
            this.add.text(knightX, knightY + 40, `⚔️ x${knights}`, {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(6);
        }
        
        // Display archers
        const archers = gameData.data.army.archers || 0;
        if (archers > 0 && this.textures.exists('archer-castle')) {
            const archerX = centerX + 100;
            const archerY = centerY + 100;
            
            const archer = this.add.sprite(archerX, archerY, 'archer-castle');
            archer.setScale(0.7);
            archer.play('archer-idle-castle');
            archer.setDepth(5);
            
            this.add.text(archerX, archerY + 40, `🏹 x${archers}`, {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(6);
        }
    }
    
    createUI() {
        const { width, height } = this.cameras.main;
        
        // Bottom panel with sprite
        if (this.textures.exists('banner-h')) {
            const panel = this.add.image(width / 2, height - 50, 'banner-h');
            panel.setScale(width / 100, 1.5);
            panel.setAlpha(0.9);
            panel.setDepth(100);
        } else {
            this.add.rectangle(width / 2, height - 50, width, 100, 0x000000, 0.7).setDepth(100);
        }
        
        // Gold display with icon
        if (this.textures.exists('gold-pile')) {
            const goldIcon = this.add.image(30, height - 75, 'gold-pile');
            goldIcon.setScale(0.8);
            goldIcon.setDepth(101);
        }
        
        this.goldText = this.add.text(60, height - 75, '', {
            fontSize: '28px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0).setDepth(101);
        this.updateGoldDisplay();
        
        // Level display
        this.add.text(20, height - 40, `${GameConfig.text.level}: ${gameData.data.currentLevel}`, {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0).setDepth(101);
        
        // Hero info
        const heroClass = gameData.data.hero.class;
        const classConfig = GameConfig.classes[heroClass];
        
        this.add.text(300, height - 75, `${classConfig.icon} ${classConfig.name}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0).setDepth(101);
        
        this.add.text(300, height - 45, `Lv.${gameData.data.hero.level} | HP:${gameData.data.hero.maxHp} | DMG:${gameData.data.hero.damage}`, {
            fontSize: '18px',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0).setDepth(101);
        
        // Start Level button (BIG and prominent)
        let startBtn;
        if (this.textures.exists('btn-red')) {
            startBtn = this.add.image(width / 2, height - 120, 'btn-red');
            startBtn.setScale(3, 1.8);
        } else {
            startBtn = this.add.rectangle(width / 2, height - 120, 300, 80, 0x00aa00);
        }
        startBtn.setInteractive({ useHandCursor: true }).setDepth(102);
        
        const startText = this.add.text(width / 2, height - 120, '▶️ ' + GameConfig.text.startLevel, {
            fontSize: '36px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(103);
        
        startBtn.on('pointerover', () => {
            if (this.textures.exists('btn-blue-hover')) {
                startBtn.setTexture('btn-blue-hover');
            }
            startText.setScale(1.05);
        });
        
        startBtn.on('pointerout', () => {
            if (this.textures.exists('btn-red')) {
                startBtn.setTexture('btn-red');
            }
            startText.setScale(1);
        });
        
        startBtn.on('pointerdown', () => {
            this.startLevel();
        });
        
        // Back to menu button
        let menuBtn;
        if (this.textures.exists('btn-blue')) {
            menuBtn = this.add.image(90, 40, 'btn-blue');
            menuBtn.setScale(1.2, 1.0);
        } else {
            menuBtn = this.add.rectangle(90, 40, 140, 45, 0x444444);
        }
        menuBtn.setInteractive({ useHandCursor: true }).setDepth(102);
        
        const menuText = this.add.text(90, 40, '← Menu', {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(103);
        
        menuBtn.on('pointerover', () => {
            if (this.textures.exists('btn-blue-hover')) {
                menuBtn.setTexture('btn-blue-hover');
            }
            menuText.setScale(1.1);
        });
        
        menuBtn.on('pointerout', () => {
            if (this.textures.exists('btn-blue')) {
                menuBtn.setTexture('btn-blue');
            }
            menuText.setScale(1);
        });
        
        menuBtn.on('pointerdown', () => {
            gameData.saveGame();
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.start('MenuScene');
            });
        });
    }
    
    createBuildingsMenu() {
        const { width, height } = this.cameras.main;
        const menuX = width - 180;
        const startY = 120;
        
        // Menu background panel
        if (this.textures.exists('panel-carved')) {
            const panel = this.add.image(menuX, 340, 'panel-carved');
            panel.setScale(2, 4.5);
            panel.setAlpha(0.95);
            panel.setDepth(100);
        } else {
            this.add.rectangle(menuX, 340, 200, 520, 0x000000, 0.8).setDepth(100);
        }
        
        // Title
        this.add.text(menuX, startY, GameConfig.text.buildings, {
            fontSize: '26px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(101);
        
        // Building buttons
        const buildings = ['wall', 'tower', 'gate', 'peasant', 'barracks'];
        
        buildings.forEach((buildingType, index) => {
            this.createBuildingButton(menuX, startY + 70 + (index * 80), buildingType);
        });
    }
    
    createBuildingButton(x, y, buildingType) {
        const building = GameConfig.buildings[buildingType];
        
        // Button background
        let btn;
        if (this.textures.exists('btn-blue')) {
            btn = this.add.image(x, y, 'btn-blue');
            btn.setScale(1.8, 1.2);
        } else {
            btn = this.add.rectangle(x, y, 180, 65, 0x2a2a2a);
            btn.setStrokeStyle(2, 0x555555);
        }
        btn.setInteractive({ useHandCursor: true }).setDepth(102);
        
        // Icon image or emoji
        const iconKey = `icon-${buildingType}`;
        if (this.textures.exists(iconKey)) {
            const icon = this.add.image(x - 65, y, iconKey);
            icon.setScale(1.5);
            icon.setDepth(103);
        } else {
            const icon = this.add.text(x - 65, y, building.icon, {
                fontSize: '28px'
            }).setOrigin(0.5).setDepth(103);
        }
        
        // Name
        const name = this.add.text(x - 20, y - 12, building.name, {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setDepth(103);
        
        // Cost
        const cost = this.add.text(x - 20, y + 10, `💰 ${building.cost}`, {
            fontSize: '14px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 0.5).setDepth(103);
        
        btn.on('pointerover', () => {
            if (this.textures.exists('btn-blue-hover')) {
                btn.setTexture('btn-blue-hover');
            } else if (btn.setStrokeStyle) {
                btn.setStrokeStyle(3, 0xffd700);
            }
            name.setScale(1.05);
            cost.setScale(1.05);
        });
        
        btn.on('pointerout', () => {
            if (this.textures.exists('btn-blue')) {
                btn.setTexture('btn-blue');
            } else if (btn.setStrokeStyle) {
                btn.setStrokeStyle(2, 0x555555);
            }
            name.setScale(1);
            cost.setScale(1);
        });
        
        btn.on('pointerdown', () => {
            if (this.textures.exists('btn-blue-pressed')) {
                btn.setTexture('btn-blue-pressed');
            }
            this.buyBuilding(buildingType);
        });
    }
    
    createDecorations(width, height) {
        // Decorative elements around the scene
        const decorations = [
            { x: 80, y: 200, deco: 1, scale: 2 },
            { x: width - 80, y: 200, deco: 2, scale: 2 },
            { x: 150, y: height - 150, deco: 3, scale: 1.8 },
            { x: width - 150, y: height - 150, deco: 4, scale: 1.8 },
        ];
        
        decorations.forEach(dec => {
            if (this.textures.exists(`castle-deco${dec.deco}`)) {
                const deco = this.add.image(dec.x, dec.y, `castle-deco${dec.deco}`);
                deco.setScale(dec.scale);
                deco.setDepth(-10);
                
                // Subtle float animation
                this.tweens.add({
                    targets: deco,
                    y: dec.y - 8,
                    duration: 2500 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
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
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => {
                this.scene.restart();
            });
        }
    }
    
    updateGoldDisplay() {
        const passiveRate = gameData.getPassiveGoldRate();
        let text = `${gameData.data.totalGold}`;
        if (passiveRate > 0) {
            text += ` (+${passiveRate}/s)`;
        }
        this.goldText.setText(text);
    }
    
    showMessage(text, color) {
        const { width, height } = this.cameras.main;
        
        const msg = this.add.text(width / 2, height / 2 - 200, text, {
            fontSize: '36px',
            color: '#' + color.toString(16).padStart(6, '0'),
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);
        
        this.tweens.add({
            targets: msg,
            y: msg.y - 60,
            alpha: 0,
            scale: 1.3,
            duration: 2000,
            ease: 'Cubic.easeOut',
            onComplete: () => msg.destroy()
        });
    }
    
    startLevel() {
        const levelConfig = gameData.getCurrentLevelConfig();
        
        if (!levelConfig) {
            this.showMessage('You have completed all levels!', 0xffd700);
            return;
        }
        
        // Save before starting level
        gameData.saveGame();
        
        // Epic transition to battle scene
        this.cameras.main.flash(200, 255, 255, 255);
        this.cameras.main.fade(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('BattleScene');
        });
    }
}