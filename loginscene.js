// LoginScene - Handle authentication and trial mode
class LoginScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoginScene' });
    }
    
    preload() {
        const basePath = 'assets';
        
        // UI Elements
        this.load.image('btn-blue', `${basePath}/UI/Buttons/Button_Blue.png`);
        this.load.image('btn-blue-hover', `${basePath}/UI/Buttons/Button_Hover.png`);
        this.load.image('btn-red', `${basePath}/UI/Buttons/Button_Red.png`);
        this.load.image('panel-carved', `${basePath}/UI/Banners/Carved_9Slides.png`);
        this.load.image('ribbon-blue', `${basePath}/UI/Ribbons/Ribbon_Blue_3Slides.png`);
        
        // Background
        this.load.image('ground-login', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('castle-login', `${basePath}/Factions/Knights/Buildings/Castle/Castle_Blue.png`);
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Initialize auth system
        const authStatus = authSystem.init();
        
        if (authStatus.authenticated) {
            // User is logged in - go to menu
            this.scene.start('MenuScene');
            return;
        }
        
        // Create background
        this.createBackground(width, height);
        
        // Show login/register screen (trial is always available)
        this.showAuthScreen();
    }
    
    createBackground(width, height) {
        // Sky
        const sky = this.add.rectangle(width / 2, height / 2, width, height, 0x87ceeb);
        sky.setDepth(-100);
        
        // Ground
        if (this.textures.exists('ground-login')) {
            const ground = this.add.tileSprite(0, height - 200, width * 2, 200, 'ground-login');
            ground.setOrigin(0, 0);
            ground.setDepth(-50);
        }
        
        // Castle background
        if (this.textures.exists('castle-login')) {
            const castle = this.add.image(width / 2, height / 2 - 50, 'castle-login');
            castle.setScale(3);
            castle.setAlpha(0.2);
            castle.setDepth(-30);
        }
    }
    
    showAuthScreen() {
        const { width, height } = this.cameras.main;
        
        // Panel background
        const panel = this.add.rectangle(width / 2, height / 2, 500, 600, 0x2a2010, 0.95);
        panel.setStrokeStyle(4, 0x8B4513);
        
        // Title
        this.add.text(width / 2, height / 2 - 250, '⚔️ KINGDOM OF EUNEUS ⚔️', {
            fontSize: '32px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Mode selection buttons
        this.createButton(width / 2 - 110, height / 2 - 150, 'LOGIN', 180, () => {
            this.showLoginForm();
        });
        
        this.createButton(width / 2 + 110, height / 2 - 150, 'REGISTER', 180, () => {
            this.showRegisterForm();
        });
        
        // Trial mode option - PLAY LEVEL 1 FREE
        const trialBtn = this.createButton(width / 2, height / 2 - 50, '🎮 PLAY LEVEL 1 FREE', 400, () => {
            this.startTrialMode();
        });
        
        this.add.text(width / 2, height / 2 + 20, 'Try the first level without registration\nRegister to unlock all 10 levels', {
            fontSize: '16px',
            color: '#aaaaaa',
            align: 'center',
            lineSpacing: 5
        }).setOrigin(0.5);
        
        // Benefits of registration
        const benefits = [
            '✓ Save your progress',
            '✓ Play all 10 levels',
            '✓ Compete on leaderboards',
            '✓ Cloud sync across devices'
        ];
        
        let y = height / 2 + 100;
        benefits.forEach(benefit => {
            this.add.text(width / 2, y, benefit, {
                fontSize: '14px',
                color: '#ffd700',
                align: 'center'
            }).setOrigin(0.5);
            y += 25;
        });
    }
    
    showLoginForm() {
        this.clearScreen();
        
        const { width, height } = this.cameras.main;
        
        // Panel
        const panel = this.add.rectangle(width / 2, height / 2, 500, 600, 0x2a2010, 0.95);
        panel.setStrokeStyle(4, 0x8B4513);
        
        // Title
        this.add.text(width / 2, height / 2 - 220, '🔐 LOGIN', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Create HTML form overlay
        this.createHTMLForm('login');
        
        // Back button
        this.createButton(width / 2, height / 2 + 220, '← BACK', 150, () => {
            this.removeHTMLForm();
            this.scene.restart();
        });
    }
    
    showRegisterForm() {
        this.clearScreen();
        
        const { width, height } = this.cameras.main;
        
        // Panel
        const panel = this.add.rectangle(width / 2, height / 2, 500, 650, 0x2a2010, 0.95);
        panel.setStrokeStyle(4, 0x8B4513);
        
        // Title
        this.add.text(width / 2, height / 2 - 270, '📝 REGISTER', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Create HTML form overlay
        this.createHTMLForm('register');
        
        // Back button
        this.createButton(width / 2, height / 2 + 270, '← BACK', 150, () => {
            this.removeHTMLForm();
            this.scene.restart();
        });
    }
    
    createHTMLForm(type) {
        const form = document.createElement('div');
        form.id = 'auth-form';
        form.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            width: 400px;
            pointer-events: all;
        `;
        
        if (type === 'login') {
            form.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Email:</label>
                    <input type="email" id="auth-email" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Password:</label>
                    <input type="password" id="auth-password" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <button id="auth-submit" style="width: 100%; padding: 15px; font-size: 18px; font-weight: bold; background: #00aa00; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    LOGIN
                </button>
                <div id="auth-error" style="color: #ff6666; margin-top: 10px; text-align: center; display: none;"></div>
            `;
        } else {
            form.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Username:</label>
                    <input type="text" id="auth-username" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Email:</label>
                    <input type="email" id="auth-email" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Password:</label>
                    <input type="password" id="auth-password" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="color: #ffd700; font-size: 16px; display: block; margin-bottom: 5px;">Confirm Password:</label>
                    <input type="password" id="auth-confirm" style="width: 100%; padding: 10px; font-size: 16px; border: 2px solid #8B4513; border-radius: 5px; background: #1a1a1a; color: white;">
                </div>
                <button id="auth-submit" style="width: 100%; padding: 15px; font-size: 18px; font-weight: bold; background: #00aa00; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    REGISTER
                </button>
                <div id="auth-error" style="color: #ff6666; margin-top: 10px; text-align: center; display: none;"></div>
            `;
        }
        
        document.body.appendChild(form);
        
        // Add event listeners
        const submitBtn = document.getElementById('auth-submit');
        submitBtn.addEventListener('click', () => {
            if (type === 'login') {
                this.handleLogin();
            } else {
                this.handleRegister();
            }
        });
        
        // Enter key submit
        form.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
    
    removeHTMLForm() {
        const form = document.getElementById('auth-form');
        if (form) {
            form.remove();
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const errorDiv = document.getElementById('auth-error');
        
        const result = await authSystem.login(email, password);
        
        if (result.success) {
            this.removeHTMLForm();
            this.scene.start('MenuScene');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('auth-username').value;
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const confirm = document.getElementById('auth-confirm').value;
        const errorDiv = document.getElementById('auth-error');
        
        if (password !== confirm) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }
        
        const result = await authSystem.register(username, email, password);
        
        if (result.success) {
            this.removeHTMLForm();
            this.scene.start('MenuScene');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.style.display = 'block';
        }
    }
    
    startTrialMode() {
        authSystem.startTrial();
        this.scene.start('MenuScene');
    }
    
    showTrialExpiredScreen() {
        const { width, height } = this.cameras.main;
        
        this.createBackground(width, height);
        
        // Panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 500, 0x2a2010, 0.95);
        panel.setStrokeStyle(4, 0xff0000);
        
        // Title
        this.add.text(width / 2, height / 2 - 180, '⏰ TRIAL EXPIRED', {
            fontSize: '42px',
            color: '#ff6666',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        this.add.text(width / 2, height / 2 - 100, 'Your 10-minute trial has ended.\n\nTo continue playing:', {
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);
        
        // Purchase button
        this.createButton(width / 2, height / 2, '💎 PURCHASE FULL GAME - $9.99', 400, () => {
            this.showPurchaseScreen();
        });
        
        // Register button
        this.createButton(width / 2, height / 2 + 80, '📝 REGISTER ACCOUNT', 400, () => {
            this.showRegisterForm();
        });
        
        // Already have account
        this.createButton(width / 2, height / 2 + 160, '🔐 LOGIN', 250, () => {
            this.showLoginForm();
        });
    }
    
    showPurchaseScreen() {
        this.clearScreen();
        
        const { width, height } = this.cameras.main;
        
        this.createBackground(width, height);
        
        // Panel
        const panel = this.add.rectangle(width / 2, height / 2, 600, 550, 0x2a2010, 0.95);
        panel.setStrokeStyle(4, 0xffd700);
        
        // Title
        this.add.text(width / 2, height / 2 - 220, '💎 UPGRADE TO PREMIUM', {
            fontSize: '36px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Price
        this.add.text(width / 2, height / 2 - 140, '$9.99', {
            fontSize: '48px',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Features
        const features = [
            '✓ Unlimited playtime',
            '✓ Save your progress forever',
            '✓ All 10 levels unlocked',
            '✓ Cloud sync',
            '✓ Future updates free',
            '✓ No ads ever'
        ];
        
        let y = height / 2 - 60;
        features.forEach(feature => {
            this.add.text(width / 2, y, feature, {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            y += 30;
        });
        
        // Purchase button (simulated)
        this.createButton(width / 2, height / 2 + 170, '🛒 PURCHASE NOW', 300, () => {
            // Simulate successful purchase
            authSystem.upgradeToPremium();
            this.showPurchaseSuccess();
        });
        
        // Back button
        this.createButton(width / 2, height / 2 + 230, '← BACK', 150, () => {
            this.scene.restart();
        });
    }
    
    showPurchaseSuccess() {
        this.clearScreen();
        
        const { width, height } = this.cameras.main;
        
        this.createBackground(width, height);
        
        // Success message
        const success = this.add.text(width / 2, height / 2 - 50, '✅ PURCHASE SUCCESSFUL!\n\nThank you for supporting the game!', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            lineSpacing: 20
        }).setOrigin(0.5);
        
        this.createButton(width / 2, height / 2 + 100, 'CONTINUE TO GAME ➡️', 300, () => {
            this.scene.start('MenuScene');
        });
    }
    
    createButton(x, y, text, width, callback) {
        const btn = this.add.rectangle(x, y, width, 50, 0x00aa00);
        btn.setInteractive({ useHandCursor: true });
        
        const txt = this.add.text(x, y, text, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        btn.on('pointerover', () => {
            btn.setFillStyle(0x00cc00);
            txt.setScale(1.05);
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(0x00aa00);
            txt.setScale(1);
        });
        
        btn.on('pointerdown', callback);
        
        return btn;
    }
    
    clearScreen() {
        this.children.removeAll();
    }
}
