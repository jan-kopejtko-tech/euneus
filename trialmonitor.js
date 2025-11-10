// TrialMonitor - Show trial status during gameplay (simplified for level-based trial)
class TrialMonitor {
    constructor(scene) {
        this.scene = scene;
        this.statusText = null;
    }
    
    start() {
        // Only show status if user is in trial mode (not authenticated)
        if (authSystem.isAuthenticated()) {
            return; // No need to show anything for registered users
        }
        
        const trialInfo = authSystem.getTrialInfo();
        
        if (trialInfo.active) {
            console.log('⏱️ Showing trial status');
            this.createStatusDisplay(trialInfo);
        }
    }
    
    createStatusDisplay(trialInfo) {
        const { width } = this.scene.cameras.main;
        
        // Status banner in top right
        this.statusText = this.scene.add.text(width - 20, 20, `📋 ${trialInfo.message}`, {
            fontSize: '16px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 10, y: 5 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(5000);
        
        // Optionally show a "Register" reminder button
        const registerHint = this.scene.add.text(width - 20, 55, '📝 Register to unlock all levels', {
            fontSize: '14px',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            backgroundColor: 'rgba(0, 100, 0, 0.5)',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(5000);
        
        // Make it clickable
        registerHint.setInteractive({ useHandCursor: true });
        registerHint.on('pointerover', () => {
            registerHint.setScale(1.05);
            registerHint.setColor('#ffff00');
        });
        registerHint.on('pointerout', () => {
            registerHint.setScale(1);
            registerHint.setColor('#00ff00');
        });
        registerHint.on('pointerdown', () => {
            // Save game and go to registration
            if (typeof gameData !== 'undefined') {
                gameData.saveGame();
            }
            this.scene.scene.start('LoginScene');
        });
        
        this.registerHint = registerHint;
    }
    
    stop() {
        if (this.statusText) {
            this.statusText.destroy();
            this.statusText = null;
        }
        
        if (this.registerHint) {
            this.registerHint.destroy();
            this.registerHint = null;
        }
    }
}
