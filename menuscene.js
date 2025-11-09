// MenuScene - Main menu of the game
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        
        // Title
        this.add.text(width / 2, 150, GameConfig.text.gameTitle, {
            fontSize: '64px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // King emoji
        this.add.text(width / 2, 250, '🤴', {
            fontSize: '120px'
        }).setOrigin(0.5);
        
        // Check if save exists
        const hasSave = saveSystem.hasSaveData();
        
        // New Game button
        const newGameBtn = this.createButton(
            width / 2, 
            400, 
            GameConfig.text.newGame,
            () => this.startNewGame()
        );
        
        // Load Game button (only if save exists)
        if (hasSave) {
            const loadGameBtn = this.createButton(
                width / 2, 
                480, 
                GameConfig.text.loadGame,
                () => this.loadGame()
            );
        }
        
        // Settings button
        const settingsBtn = this.createButton(
            width / 2, 
            hasSave ? 560 : 480, 
            GameConfig.text.settings,
            () => this.openSettings()
        );
        
        // Version text
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(1, 1);
        
        // Copyright
        this.add.text(10, height - 10, '© 2025 Kingdom of Euneus', {
            fontSize: '14px',
            color: '#666666'
        }).setOrigin(0, 1);
    }
    
    createButton(x, y, text, callback) {
        const bg = this.add.rectangle(x, y, 300, 60, 0x2d4a3e)
            .setInteractive({ useHandCursor: true });
        
        const txt = this.add.text(x, y, text, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Hover effects
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
        
        return { bg, txt };
    }
    
    startNewGame() {
        // Confirm if save exists
        if (saveSystem.hasSaveData()) {
            const confirm = window.confirm('Starting a new game will overwrite your existing save. Continue?');
            if (!confirm) return;
        }
        
        // Create new game data
        gameData.newGame();
        
        // Go to class selection
        this.scene.start('ClassSelectScene');
    }
    
    loadGame() {
        const loaded = gameData.loadGame();
        
        if (!loaded) {
            alert('Failed to load game data!');
            return;
        }
        
        // Go directly to castle scene
        this.scene.start('CastleScene');
    }
    
    openSettings() {
        // TODO: Implement settings scene
        console.log('Settings not yet implemented');
        
        // For now, show a simple alert
        alert('Settings:\n\nMusic Volume: ' + (gameData.data?.settings.musicVolume * 100 || 70) + '%\nSFX Volume: ' + (gameData.data?.settings.sfxVolume * 100 || 80) + '%');
    }
}