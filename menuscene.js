// MenuScene - Main menu of the game with Tiny Swords graphics!
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        const basePath = 'assets';
        
        // UI Elements for menu
        this.load.image('btn-blue', `${basePath}/UI/Buttons/Button_Blue.png`);
        this.load.image('btn-blue-hover', `${basePath}/UI/Buttons/Button_Hover.png`);
        this.load.image('btn-blue-pressed', `${basePath}/UI/Buttons/Button_Blue_Pressed.png`);
        this.load.image('banner-carved', `${basePath}/UI/Banners/Carved_Regular.png`);
        this.load.image('ribbon-blue', `${basePath}/UI/Ribbons/Ribbon_Blue_3Slides.png`);
        
        // Castle for background
        this.load.image('castle-menu', `${basePath}/Factions/Knights/Buildings/Castle/Castle_Blue.png`);
        
        // Ground tiles
        this.load.image('ground-menu', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        
        // Trees and decorations
        this.load.image('tree-menu', `${basePath}/Resources/Trees/Tree.png`);
        
        // Decorations
        for (let i = 1; i <= 6; i++) {
            const num = i.toString().padStart(2, '0');
            this.load.image(`menu-deco${i}`, `${basePath}/Deco/${num}.png`);
        }
        
        // Knight sprite for hero display
        this.load.spritesheet('knight-menu', `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            { frameWidth: 192, frameHeight: 192 });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Create background
        this.createBackground(width, height);
        
        // Create title banner
        this.createTitleBanner(width);
        
        // Create castle centerpiece
        this.createCastleCenterpiece(width, height);
        
        // Check if save exists
        const hasSave = saveSystem.hasSaveData();
        
        // Create buttons with actual sprites
        this.createMenuButtons(width, height, hasSave);
        
        // Create decorative elements
        this.createDecorations(width, height);
        
        // Version text
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontSize: '16px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 1);
        
        // Copyright
        this.add.text(10, height - 10, '© 2025 Kingdom of Euneus', {
            fontSize: '14px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 1);
        
        // Animate knight
        if (!this.anims.exists('knight-idle')) {
            this.anims.create({
                key: 'knight-idle',
                frames: this.anims.generateFrameNumbers('knight-menu', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }
    
    createBackground(width, height) {
        // Sky gradient effect with rectangles
        const skyTop = this.add.rectangle(width / 2, 0, width, height / 2, 0x87ceeb);
        skyTop.setOrigin(0.5, 0);
        skyTop.setDepth(-100);
        
        const skyBottom = this.add.rectangle(width / 2, height / 2, width, height / 2, 0x5a9bd5);
        skyBottom.setOrigin(0.5, 0);
        skyBottom.setDepth(-100);
        
        // Ground using tilesprite
        if (this.textures.exists('ground-menu')) {
            const ground = this.add.tileSprite(0, height - 200, width * 2, 200, 'ground-menu');
            ground.setOrigin(0, 0);
            ground.setDepth(-50);
        } else {
            const ground = this.add.rectangle(width / 2, height - 100, width, 200, 0x5a7c3e);
            ground.setDepth(-50);
        }
        
        // Background trees
        for (let i = 0; i < 8; i++) {
            const x = (width / 8) * i + (width / 16);
            const y = height - 150 + Phaser.Math.Between(-20, 20);
            
            if (this.textures.exists('tree-menu')) {
                const tree = this.add.image(x, y, 'tree-menu');
                tree.setScale(Phaser.Math.FloatBetween(1.5, 2.5));
                tree.setDepth(-40);
                tree.setAlpha(0.6);
            }
        }
    }
    
    createTitleBanner(width) {
        // Banner background for title
        if (this.textures.exists('ribbon-blue')) {
            const banner = this.add.image(width / 2, 80, 'ribbon-blue');
            banner.setScale(4, 2);
            banner.setAlpha(0.9);
        }
        
        // Title text
        this.add.text(width / 2, 80, GameConfig.text.gameTitle, {
            fontSize: '56px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
    }
    
    createCastleCenterpiece(width, height) {
        // Large castle in background
        if (this.textures.exists('castle-menu')) {
            const castle = this.add.image(width / 2, height / 2 - 50, 'castle-menu');
            castle.setScale(4);
            castle.setAlpha(0.3);
            castle.setDepth(-30);
        }
        
        // Knight hero sprite
        if (this.textures.exists('knight-menu')) {
            const knight = this.add.sprite(width / 2, 220, 'knight-menu');
            knight.setScale(1.5);
            knight.play('knight-idle');
            
            // Add glow effect
            const glow = this.add.circle(width / 2, 220, 80, 0xffd700, 0.2);
            glow.setDepth(-1);
        }
    }
    
    createMenuButtons(width, height, hasSave) {
        const buttonY = 380;
        const buttonSpacing = 80;
        
        // New Game button
        this.createSpriteButton(
            width / 2,
            buttonY,
            'New Game',
            'btn-blue',
            () => this.startNewGame()
        );
        
        // Load Game button (only if save exists)
        if (hasSave) {
            this.createSpriteButton(
                width / 2,
                buttonY + buttonSpacing,
                'Load Game',
                'btn-blue',
                () => this.loadGame()
            );
        }
        
        // Settings button
        this.createSpriteButton(
            width / 2,
            hasSave ? buttonY + buttonSpacing * 2 : buttonY + buttonSpacing,
            'Settings',
            'btn-blue',
            () => this.openSettings()
        );
    }
    
    createSpriteButton(x, y, text, spriteKey, callback) {
        // Button background sprite
        if (this.textures.exists(spriteKey)) {
            const btn = this.add.image(x, y, spriteKey);
            btn.setScale(3, 1.5);
            btn.setInteractive({ useHandCursor: true });
            
            const txt = this.add.text(x, y, text, {
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            
            // Hover effects
            btn.on('pointerover', () => {
                if (this.textures.exists('btn-blue-hover')) {
                    btn.setTexture('btn-blue-hover');
                }
                txt.setScale(1.1);
                this.tweens.add({
                    targets: btn,
                    y: y - 5,
                    duration: 100,
                    ease: 'Power2'
                });
            });
            
            btn.on('pointerout', () => {
                btn.setTexture(spriteKey);
                txt.setScale(1);
                this.tweens.add({
                    targets: btn,
                    y: y,
                    duration: 100,
                    ease: 'Power2'
                });
            });
            
            btn.on('pointerdown', () => {
                if (this.textures.exists('btn-blue-pressed')) {
                    btn.setTexture('btn-blue-pressed');
                }
                this.tweens.add({
                    targets: [btn, txt],
                    scale: btn.scaleX * 0.95,
                    duration: 50
                });
            });
            
            btn.on('pointerup', () => {
                btn.setTexture(spriteKey);
                this.tweens.add({
                    targets: btn,
                    scale: 3,
                    duration: 50
                });
                this.tweens.add({
                    targets: txt,
                    scale: 1,
                    duration: 50,
                    onComplete: () => callback()
                });
            });
            
        } else {
            // Fallback to rectangle button
            const bg = this.add.rectangle(x, y, 300, 60, 0x2d4a3e)
                .setInteractive({ useHandCursor: true });
            
            const txt = this.add.text(x, y, text, {
                fontSize: '28px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            bg.on('pointerover', () => {
                bg.setFillStyle(0x3d5a4e);
                txt.setScale(1.05);
            });
            
            bg.on('pointerout', () => {
                bg.setFillStyle(0x2d4a3e);
                txt.setScale(1);
            });
            
            bg.on('pointerdown', () => {
                bg.setFillStyle(0x1d3a2e);
            });
            
            bg.on('pointerup', () => {
                bg.setFillStyle(0x3d5a4e);
                callback();
            });
        }
    }
    
    createDecorations(width, height) {
        // Bottom decorations
        const decorations = [
            { x: 100, y: height - 80, deco: 1 },
            { x: width - 100, y: height - 80, deco: 2 },
            { x: 200, y: height - 60, deco: 3 },
            { x: width - 200, y: height - 60, deco: 4 },
        ];
        
        decorations.forEach(dec => {
            if (this.textures.exists(`menu-deco${dec.deco}`)) {
                const deco = this.add.image(dec.x, dec.y, `menu-deco${dec.deco}`);
                deco.setScale(2);
                
                // Subtle floating animation
                this.tweens.add({
                    targets: deco,
                    y: dec.y - 10,
                    duration: 2000 + Math.random() * 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }
    
    startNewGame() {
        if (saveSystem.hasSaveData()) {
            const confirm = window.confirm('Starting a new game will overwrite your existing save. Continue?');
            if (!confirm) return;
        }
        
        gameData.newGame();
        
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('ClassSelectScene');
        });
    }
    
    loadGame() {
        const loaded = gameData.loadGame();
        
        if (!loaded) {
            alert('Failed to load game data!');
            return;
        }
        
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(500, () => {
            this.scene.start('CastleScene');
        });
    }
    
    openSettings() {
        console.log('Settings not yet implemented');
        alert('Settings:\n\nMusic Volume: ' + (gameData.data?.settings.musicVolume * 100 || 70) + '%\nSFX Volume: ' + (gameData.data?.settings.sfxVolume * 100 || 80) + '%');
    }
}