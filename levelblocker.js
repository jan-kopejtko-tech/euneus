// LevelBlocker - Shows registration screen when trying to access locked levels
class LevelBlocker {
    constructor(scene) {
        this.scene = scene;
    }
    
    // Check if level should be blocked and show blocker if needed
    checkAndBlock(levelNumber) {
        // Don't block if user is authenticated
        if (authSystem.isAuthenticated()) {
            return false; // Level is accessible
        }
        
        // Check if level is blocked
        if (authSystem.shouldShowTrialBlock(levelNumber)) {
            this.showLevelBlocker(levelNumber);
            return true; // Level is blocked
        }
        
        return false; // Level is accessible
    }
    
    showLevelBlocker(levelNumber) {
        console.log(`🔒 Blocking level ${levelNumber} - Registration required`);
        
        const { width, height } = this.scene.cameras.main;
        
        // Full screen overlay
        const overlay = this.scene.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.9)
            .setScrollFactor(0).setDepth(10000).setInteractive();
        
        // Panel
        const panel = this.scene.add.rectangle(width / 2, height / 2, 700, 600, 0x2a2010, 0.98)
            .setScrollFactor(0).setDepth(10001)
            .setStrokeStyle(4, 0xffd700);
        
        // Lock icon
        const lockIcon = this.scene.add.text(width / 2, height / 2 - 220, '🔒', {
            fontSize: '72px'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10002);
        
        // Title
        const title = this.scene.add.text(width / 2, height / 2 - 130, `LEVEL ${levelNumber} LOCKED`, {
            fontSize: '42px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10002);
        
        // Message
        const message = this.scene.add.text(width / 2, height / 2 - 50, 'Great job completing Level 1!\n\nRegister FREE to unlock all 10 levels\nand save your progress forever.', {
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 15
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10002);
        
        // FREE Registration benefits
        const benefits = [
            '✓ Unlock all 10 levels',
            '✓ Save your progress',
            '✓ Compete on leaderboards',
            '✓ 100% Free - No payment required!'
        ];
        
        let benefitY = height / 2 + 60;
        benefits.forEach(benefit => {
            const benefitText = this.scene.add.text(width / 2, benefitY, benefit, {
                fontSize: '16px',
                color: '#00ff00',
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(10002);
            benefitY += 25;
        });
        
        // Register button (FREE)
        const registerBtn = this.scene.add.rectangle(width / 2, height / 2 + 200, 400, 70, 0x00aa00)
            .setScrollFactor(0).setDepth(10002).setInteractive({ useHandCursor: true });
        
        const registerText = this.scene.add.text(width / 2, height / 2 + 200, '📝 REGISTER FREE', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10003);
        
        // Already have account button
        const loginBtn = this.scene.add.rectangle(width / 2 - 120, height / 2 + 260, 200, 40, 0x666666)
            .setScrollFactor(0).setDepth(10002).setInteractive({ useHandCursor: true });
        
        const loginText = this.scene.add.text(width / 2 - 120, height / 2 + 260, '🔐 Already registered?', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10003);
        
        // Back to Level 1 button
        const backBtn = this.scene.add.rectangle(width / 2 + 120, height / 2 + 260, 200, 40, 0x666666)
            .setScrollFactor(0).setDepth(10002).setInteractive({ useHandCursor: true });
        
        const backText = this.scene.add.text(width / 2 + 120, height / 2 + 260, '← Back to Level 1', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10003);
        
        // Store all UI elements for cleanup
        const uiElements = [
            overlay, panel, lockIcon, title, message,
            registerBtn, registerText, loginBtn, loginText, backBtn, backText
        ];
        
        // Button interactions
        registerBtn.on('pointerover', () => {
            registerBtn.setFillStyle(0x00cc00);
            registerText.setScale(1.05);
        });
        registerBtn.on('pointerout', () => {
            registerBtn.setFillStyle(0x00aa00);
            registerText.setScale(1);
        });
        registerBtn.on('pointerdown', () => {
            // Save game progress first
            if (typeof gameData !== 'undefined') {
                gameData.saveGame();
            }
            // Go to login scene (register mode)
            this.scene.scene.start('LoginScene');
        });
        
        loginBtn.on('pointerover', () => {
            loginBtn.setFillStyle(0x888888);
            loginText.setScale(1.05);
        });
        loginBtn.on('pointerout', () => {
            loginBtn.setFillStyle(0x666666);
            loginText.setScale(1);
        });
        loginBtn.on('pointerdown', () => {
            // Save game progress first
            if (typeof gameData !== 'undefined') {
                gameData.saveGame();
            }
            // Go to login scene
            this.scene.scene.start('LoginScene');
        });
        
        backBtn.on('pointerover', () => {
            backBtn.setFillStyle(0x888888);
            backText.setScale(1.05);
        });
        backBtn.on('pointerout', () => {
            backBtn.setFillStyle(0x666666);
            backText.setScale(1);
        });
        backBtn.on('pointerdown', () => {
            // Go back to castle (level 1)
            uiElements.forEach(el => el.destroy());
            
            // Reset to level 1
            if (typeof gameData !== 'undefined') {
                gameData.data.currentLevel = 1;
                gameData.saveGame();
            }
        });
    }
    
    // Show trial banner in menu to remind users they're in trial
    showTrialBanner() {
        if (authSystem.isAuthenticated()) {
            return; // Don't show for registered users
        }
        
        const { width } = this.scene.cameras.main;
        
        const trialInfo = authSystem.getTrialInfo();
        
        if (trialInfo.active) {
            const banner = this.scene.add.rectangle(width / 2, 30, width - 40, 50, 0xff9900, 0.9)
                .setScrollFactor(0).setDepth(5000)
                .setStrokeStyle(2, 0xff6600);
            
            const bannerText = this.scene.add.text(width / 2, 30, `⚠️ ${trialInfo.message} | Register to unlock all levels`, {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);
            
            return { banner, bannerText };
        }
        
        return null;
    }
}
