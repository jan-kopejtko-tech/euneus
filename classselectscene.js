// ClassSelectScene - Choose your hero class with Tiny Swords assets!
class ClassSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ClassSelectScene' });
    }
    
    preload() {
        const basePath = 'assets';
        
        // UI Elements
        this.load.image('btn-blue', `${basePath}/UI/Buttons/Button_Blue.png`);
        this.load.image('btn-blue-hover', `${basePath}/UI/Buttons/Button_Hover.png`);
        this.load.image('btn-blue-pressed', `${basePath}/UI/Buttons/Button_Blue_Pressed.png`);
        this.load.image('panel-carved', `${basePath}/UI/Banners/Carved_9Slides.png`);
        this.load.image('banner-h', `${basePath}/UI/Banners/Banner_Horizontal.png`);
        this.load.image('ribbon-blue', `${basePath}/UI/Ribbons/Ribbon_Blue_3Slides.png`);
        this.load.image('ribbon-yellow', `${basePath}/UI/Ribbons/Ribbon_Yellow_3Slides.png`);
        this.load.image('ribbon-red', `${basePath}/UI/Ribbons/Ribbon_Red_3Slides.png`);
        
        // Ground and terrain
        this.load.image('ground-select', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('tree-select', `${basePath}/Resources/Trees/Tree.png`);
        
        // Class sprites (animated)
        this.load.spritesheet('warrior-blue', `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('pawn-red', `${basePath}/Factions/Knights/Troops/Pawn/Red/Pawn_Red.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior-purple', `${basePath}/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png`,
            { frameWidth: 192, frameHeight: 192 });
        
        // Decorations
        for (let i = 1; i <= 8; i++) {
            const num = i.toString().padStart(2, '0');
            this.load.image(`select-deco${i}`, `${basePath}/Deco/${num}.png`);
        }
        
        // Castle for background
        this.load.image('castle-select', `${basePath}/Factions/Knights/Buildings/Castle/Castle_Blue.png`);
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Create animations first
        this.createAnimations();
        
        // Beautiful background
        this.createBackground(width, height);
        
        // Title banner
        this.createTitleBanner(width);
        
        // Create class cards with actual sprites
        const classes = ['tank', 'assassin', 'mage'];
        const cardWidth = 280;
        const cardSpacing = 50;
        const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (width - totalWidth) / 2;
        
        classes.forEach((className, index) => {
            const x = startX + (cardWidth / 2) + (index * (cardWidth + cardSpacing));
            this.createClassCard(x, height / 2 + 20, className);
        });
        
        // Decorative elements
        this.createDecorations(width, height);
        
        // Back button with sprite
        this.createBackButton();
        
        console.log('🎨 ClassSelectScene loaded with Tiny Swords assets!');
    }
    
    createAnimations() {
        // Tank (Warrior Blue)
        if (!this.anims.exists('tank-idle')) {
            this.anims.create({
                key: 'tank-idle',
                frames: this.anims.generateFrameNumbers('warrior-blue', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Assassin (Pawn Red)
        if (!this.anims.exists('assassin-idle')) {
            this.anims.create({
                key: 'assassin-idle',
                frames: this.anims.generateFrameNumbers('pawn-red', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Mage (Warrior Purple)
        if (!this.anims.exists('mage-idle')) {
            this.anims.create({
                key: 'mage-idle',
                frames: this.anims.generateFrameNumbers('warrior-purple', { start: 0, end: 5 }),
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
        
        // Ground
        if (this.textures.exists('ground-select')) {
            const ground = this.add.tileSprite(0, height - 200, width * 2, 200, 'ground-select');
            ground.setOrigin(0, 0);
            ground.setDepth(-50);
            ground.setTileScale(0.5, 0.5); // Scale down the tiles for better look
        } else {
            const ground = this.add.rectangle(width / 2, height - 100, width, 200, 0x5a7c3e);
            ground.setDepth(-50);
        }
        
        // Background castle (faded)
        if (this.textures.exists('castle-select')) {
            const castle = this.add.image(width / 2, height / 2 + 50, 'castle-select');
            castle.setScale(3.5);
            castle.setAlpha(0.15);
            castle.setDepth(-40);
        }
        
        // Background trees
        for (let i = 0; i < 10; i++) {
            const x = (width / 10) * i + (width / 20);
            const y = height - 140 + Phaser.Math.Between(-20, 20);
            
            if (this.textures.exists('tree-select')) {
                const tree = this.add.image(x, y, 'tree-select');
                tree.setScale(Phaser.Math.FloatBetween(1.2, 2.0));
                tree.setDepth(-30);
                tree.setAlpha(0.5);
            }
        }
    }
    
    createTitleBanner(width) {
        // Banner background for title
        if (this.textures.exists('ribbon-yellow')) {
            const banner = this.add.image(width / 2, 80, 'ribbon-yellow');
            banner.setScale(4, 2.5);
            banner.setAlpha(0.9);
        }
        
        // Title text
        this.add.text(width / 2, 80, GameConfig.text.chooseHero, {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, 125, 'Select your champion for battle!', {
            fontSize: '20px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }
    
    createClassCard(x, y, className) {
        const classConfig = GameConfig.classes[className];
        
        // Determine sprite and ribbon color
        let spriteKey, ribbonKey, idleAnim;
        if (className === 'tank') {
            spriteKey = 'warrior-blue';
            ribbonKey = 'ribbon-blue';
            idleAnim = 'tank-idle';
        } else if (className === 'assassin') {
            spriteKey = 'pawn-red';
            ribbonKey = 'ribbon-red';
            idleAnim = 'assassin-idle';
        } else {
            spriteKey = 'warrior-purple';
            ribbonKey = 'ribbon-blue';
            idleAnim = 'mage-idle';
        }
        
        // Card panel background
        let cardBg;
        if (this.textures.exists('panel-carved')) {
            cardBg = this.add.image(x, y, 'panel-carved');
            cardBg.setScale(2.8, 3.5);
            cardBg.setAlpha(0.95);
        } else {
            // Fallback
            cardBg = this.add.rectangle(x, y, 260, 420, 0x2a2a2a);
            cardBg.setStrokeStyle(3, 0x555555);
        }
        cardBg.setInteractive({ useHandCursor: true });
        
        // Animated sprite preview
        let heroSprite;
        if (this.textures.exists(spriteKey)) {
            heroSprite = this.add.sprite(x, y - 120, spriteKey);
            heroSprite.setScale(1.2);
            heroSprite.play(idleAnim);
            
            // Glow effect behind sprite
            const glow = this.add.circle(x, y - 120, 60, classConfig.color, 0.3);
            glow.setDepth(-1);
        } else {
            // Fallback to emoji
            heroSprite = this.add.text(x, y - 120, classConfig.icon, {
                fontSize: '80px'
            }).setOrigin(0.5);
        }
        
        // Name ribbon
        if (this.textures.exists(ribbonKey)) {
            const nameRibbon = this.add.image(x, y - 30, ribbonKey);
            nameRibbon.setScale(2.5, 1.5);
        }
        
        // Name
        const name = this.add.text(x, y - 30, classConfig.name, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Stats panel
        const statsY = y + 30;
        const statsText = [
            `❤️  HP: ${classConfig.maxHp}`,
            `⚔️  Damage: ${classConfig.damage}`,
            `💨 Speed: ${Math.round(classConfig.speed / 220 * 100)}%`,
            `🎯 Range: ${classConfig.range}`
        ].join('\n');
        
        const stats = this.add.text(x, statsY, statsText, {
            fontSize: '16px',
            color: '#ffffff',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 3,
            lineSpacing: 5
        }).setOrigin(0.5);
        
        // Description
        const desc = this.add.text(x, y + 145, classConfig.description, {
            fontSize: '14px',
            color: '#ffd700',
            align: 'center',
            wordWrap: { width: 240 },
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Hover effects
        cardBg.on('pointerover', () => {
            if (cardBg.setStrokeStyle) {
                cardBg.setStrokeStyle(4, 0xffd700);
            }
            this.tweens.add({
                targets: [cardBg, heroSprite, name, stats, desc],
                scale: '*=1.05',
                duration: 150,
                ease: 'Power2'
            });
            
            // Pulse glow
            const glow = this.add.circle(x, y, 150, 0xffd700, 0.2);
            glow.setDepth(-2);
            this.tweens.add({
                targets: glow,
                alpha: 0,
                scale: 1.5,
                duration: 400,
                onComplete: () => glow.destroy()
            });
        });
        
        cardBg.on('pointerout', () => {
            if (cardBg.setStrokeStyle) {
                cardBg.setStrokeStyle(3, 0x555555);
            }
            this.tweens.add({
                targets: [cardBg, heroSprite, name, stats, desc],
                scale: '/=1.05',
                duration: 150,
                ease: 'Power2'
            });
        });
        
        cardBg.on('pointerdown', () => {
            // Flash effect
            this.cameras.main.flash(300, 255, 215, 0, false, (camera, progress) => {
                if (progress === 1) {
                    this.selectClass(className);
                }
            });
            
            // Scale down effect
            this.tweens.add({
                targets: [cardBg, heroSprite, name, stats, desc],
                scale: '*=0.95',
                duration: 100,
                yoyo: true
            });
        });
        
        // Floating animation for sprite
        this.tweens.add({
            targets: heroSprite,
            y: heroSprite.y - 10,
            duration: 1500 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    createDecorations(width, height) {
        // Bottom decorations
        const decorations = [
            { x: 120, y: height - 90, deco: 1, scale: 2.5 },
            { x: width - 120, y: height - 90, deco: 2, scale: 2.5 },
            { x: 250, y: height - 70, deco: 3, scale: 2.0 },
            { x: width - 250, y: height - 70, deco: 4, scale: 2.0 },
            { x: width / 2 - 100, y: height - 60, deco: 5, scale: 1.8 },
            { x: width / 2 + 100, y: height - 60, deco: 6, scale: 1.8 },
        ];
        
        decorations.forEach(dec => {
            if (this.textures.exists(`select-deco${dec.deco}`)) {
                const deco = this.add.image(dec.x, dec.y, `select-deco${dec.deco}`);
                deco.setScale(dec.scale);
                deco.setDepth(-5);
                
                // Subtle floating animation
                this.tweens.add({
                    targets: deco,
                    y: dec.y - 8,
                    duration: 2000 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }
    
    createBackButton() {
        const { width, height } = this.cameras.main;
        
        // Button with sprite
        let backBtn;
        if (this.textures.exists('btn-blue')) {
            backBtn = this.add.image(90, height - 50, 'btn-blue');
            backBtn.setScale(1.2, 1.0);
        } else {
            backBtn = this.add.rectangle(90, height - 50, 140, 45, 0x444444);
        }
        backBtn.setInteractive({ useHandCursor: true });
        
        const backText = this.add.text(90, height - 50, '← Back', {
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        backBtn.on('pointerover', () => {
            if (this.textures.exists('btn-blue-hover')) {
                backBtn.setTexture('btn-blue-hover');
            } else if (backBtn.setFillStyle) {
                backBtn.setFillStyle(0x666666);
            }
            backText.setScale(1.1);
        });
        
        backBtn.on('pointerout', () => {
            if (this.textures.exists('btn-blue')) {
                backBtn.setTexture('btn-blue');
            } else if (backBtn.setFillStyle) {
                backBtn.setFillStyle(0x444444);
            }
            backText.setScale(1);
        });
        
        backBtn.on('pointerdown', () => {
            if (this.textures.exists('btn-blue-pressed')) {
                backBtn.setTexture('btn-blue-pressed');
            }
            this.tweens.add({
                targets: [backBtn, backText],
                scale: '*=0.95',
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    this.cameras.main.fade(300, 0, 0, 0);
                    this.time.delayedCall(300, () => {
                        this.scene.start('MenuScene');
                    });
                }
            });
        });
    }
    
    selectClass(className) {
        console.log(`✨ Selected class: ${className}`);
        
        // Set hero class in game data
        gameData.setHeroClass(className);
        
        // Save the game
        gameData.saveGame();
        
        // Epic visual feedback
        const { width, height } = this.cameras.main;
        
        // Success text
        const successText = this.add.text(width / 2, height / 2 - 100, '⚔️ HERO SELECTED! ⚔️', {
            fontSize: '48px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);
        
        this.tweens.add({
            targets: successText,
            alpha: 1,
            scale: 1.2,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Transition after delay
        this.time.delayedCall(1000, () => {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('CastleScene');
            });
        });
    }
}