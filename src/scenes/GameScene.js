class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        console.log('📦 PRELOAD START');
        
        // Load Tiny Swords assets - paths relative to root
        const basePath = 'assets';
        
        // Player sprites
        this.load.spritesheet('pawn-blue', `${basePath}/Factions/Knights/Troops/Pawn/Blue/Pawn_Blue.png`, 
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior-blue', `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior-purple', `${basePath}/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png`,
            { frameWidth: 192, frameHeight: 192 });
        
        // NPCs - goblins
        this.load.spritesheet('goblin', `${basePath}/Factions/Goblins/Troops/Torch/Red/Torch_Red.png`,
            { frameWidth: 192, frameHeight: 192 });
        
        // Effects
        this.load.spritesheet('explosion', `${basePath}/Effects/Explosion/Explosions.png`,
            { frameWidth: 32, frameHeight: 32 });
        
        // Terrain
        this.load.image('ground', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('tree', `${basePath}/Resources/Trees/Tree.png`);
        
        console.log('📦 PRELOAD COMPLETE');
    }
    
    create() {
        console.log('🎮 ============ CREATE START ============');
        
        // World setup
        this.WORLD_WIDTH = GameConfig.WORLD_WIDTH;
        this.WORLD_HEIGHT = GameConfig.WORLD_HEIGHT;
        
        console.log('🌍 World size:', this.WORLD_WIDTH, 'x', this.WORLD_HEIGHT);
        
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);
        
        console.log('📷 Camera initial position:', this.cameras.main.scrollX, this.cameras.main.scrollY);
        console.log('📷 Camera zoom:', this.cameras.main.zoom);
        
        // Background
        const bg = this.add.rectangle(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, 
            this.WORLD_WIDTH, this.WORLD_HEIGHT, 0x5a7c3e);
        console.log('🎨 Background created at:', bg.x, bg.y);
        
        // DEBUG: Add visible grid
        console.log('🔲 Creating debug grid...');
        this.debugGraphics = this.add.graphics();
        this.debugGraphics.lineStyle(2, 0xff0000, 0.5);
        
        // Vertical lines every 500px
        for (let x = 0; x < this.WORLD_WIDTH; x += 500) {
            this.debugGraphics.lineBetween(x, 0, x, this.WORLD_HEIGHT);
        }
        
        // Horizontal lines every 500px
        for (let y = 0; y < this.WORLD_HEIGHT; y += 500) {
            this.debugGraphics.lineBetween(0, y, this.WORLD_WIDTH, y);
        }
        
        // DEBUG: Add corner markers
        this.add.circle(0, 0, 30, 0xff0000).setDepth(1000);
        this.add.text(50, 50, 'TOP-LEFT (0,0)', {
            fontSize: '24px',
            color: '#ff0000',
            backgroundColor: '#000000'
        }).setDepth(1000);
        
        this.add.circle(this.WORLD_WIDTH, 0, 30, 0x00ff00).setDepth(1000);
        this.add.text(this.WORLD_WIDTH - 200, 50, 'TOP-RIGHT', {
            fontSize: '24px',
            color: '#00ff00',
            backgroundColor: '#000000'
        }).setDepth(1000);
        
        this.add.circle(0, this.WORLD_HEIGHT, 30, 0x0000ff).setDepth(1000);
        this.add.text(50, this.WORLD_HEIGHT - 50, 'BOTTOM-LEFT', {
            fontSize: '24px',
            color: '#0000ff',
            backgroundColor: '#000000'
        }).setDepth(1000);
        
        this.add.circle(this.WORLD_WIDTH, this.WORLD_HEIGHT, 30, 0xffff00).setDepth(1000);
        this.add.text(this.WORLD_WIDTH - 200, this.WORLD_HEIGHT - 50, 'BOTTOM-RIGHT', {
            fontSize: '24px',
            color: '#ffff00',
            backgroundColor: '#000000'
        }).setDepth(1000);
        
        // DEBUG: Add center marker
        this.add.circle(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, 100, 0xff00ff).setDepth(1000);
        this.add.text(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, 'WORLD CENTER\n' + this.WORLD_WIDTH/2 + ',' + this.WORLD_HEIGHT/2, {
            fontSize: '32px',
            color: '#ffffff',
            backgroundColor: '#000000',
            align: 'center'
        }).setOrigin(0.5).setDepth(1000);
        
        console.log('✅ Debug markers created');
        
        // Create animations
        this.createAnimations();
        
        // Sprite maps
        this.playerSprites = new Map();
        this.npcSprites = new Map();
        this.nameTexts = new Map();
        this.healthBars = new Map();
        this.shadows = new Map();
        
        console.log('📋 Sprite maps initialized');
        
        // Local player reference
        this.localPlayer = null;
        this.mySessionId = null;
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = {
            w: this.input.keyboard.addKey('W'),
            a: this.input.keyboard.addKey('A'),
            s: this.input.keyboard.addKey('S'),
            d: this.input.keyboard.addKey('D')
        };
        this.spaceKey = this.input.keyboard.addKey('SPACE');
        
        console.log('⌨️ Input initialized');
        
        // DEBUG: Log input events
        this.input.keyboard.on('keydown', (event) => {
            console.log('⌨️ Key pressed:', event.key);
        });
        
        this.input.on('pointerdown', (pointer) => {
            console.log('🖱️ Mouse clicked at world:', pointer.worldX, pointer.worldY);
        });
        
        // Connect to server
        this.connectToServer();
        
        // Send input updates
        this.time.addEvent({
            delay: 16, // ~60 FPS
            callback: () => this.sendInput(),
            loop: true
        });
        
        // Update leaderboard
        this.time.addEvent({
            delay: 1000,
            callback: () => this.updateLeaderboard(),
            loop: true
        });
        
        // DEBUG: Log every second
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                console.log('📊 DEBUG STATUS:');
                console.log('  - Players:', this.playerSprites.size);
                console.log('  - NPCs:', this.npcSprites.size);
                console.log('  - Camera pos:', Math.round(this.cameras.main.scrollX), Math.round(this.cameras.main.scrollY));
                if (this.localPlayer) {
                    console.log('  - Local player pos:', Math.round(this.localPlayer.x), Math.round(this.localPlayer.y));
                    console.log('  - Local player HP:', this.localPlayer.hp, '/', this.localPlayer.maxHp);
                    console.log('  - Local player Level:', this.localPlayer.level);
                } else {
                    console.log('  - ⚠️ NO LOCAL PLAYER!');
                }
            },
            loop: true
        });
        
        console.log('🎮 ============ CREATE COMPLETE ============');
    }
    
    async connectToServer() {
        console.log('🔌 ============ CONNECTING TO SERVER ============');
        
        const SERVER_URL = window.location.hostname === 'localhost' 
            ? 'ws://localhost:2567'
            : 'wss://euneus-production.up.railway.app';
        
        console.log('🌐 Server URL:', SERVER_URL);
        
        try {
            this.client = new Colyseus.Client(SERVER_URL);
            console.log('📡 Client created');
            
            this.room = await this.client.joinOrCreate("ffa", { username: username });
            console.log('✅ Connected to room');
            
            // Handle initial connection
            this.room.onMessage("init", (message) => {
                this.mySessionId = message.sessionId;
                console.log('🎮 My session ID:', this.mySessionId);
            });
            
            // Listen for state changes
            this.room.state.players.onAdd = (player, sessionId) => {
                console.log('➕ Player added:', sessionId, 'at position', player.x, player.y);
                this.addPlayer(sessionId, player);
            };
            
            this.room.state.players.onRemove = (player, sessionId) => {
                console.log('➖ Player removed:', sessionId);
                this.removePlayer(sessionId);
            };
            
            this.room.state.npcs.onAdd = (npc, npcId) => {
                console.log('➕ NPC added:', npcId, 'at position', npc.x, npc.y);
                this.addNPC(npcId, npc);
            };
            
            this.room.state.npcs.onRemove = (npc, npcId) => {
                console.log('➖ NPC removed:', npcId);
                this.removeNPC(npcId);
            };
            
            // Combat events
            this.room.onMessage("player_hit", (data) => {
                console.log('💥 Player hit:', data);
                this.showHitEffect(data.target, data.damage, data.isBackstab);
            });
            
            this.room.onMessage("npc_hit", (data) => {
                console.log('💥 NPC hit:', data);
                const sprite = this.npcSprites.get(data.npcId);
                if (sprite) this.flashSprite(sprite);
            });
            
            this.room.onMessage("player_killed", (data) => {
                console.log('💀 Player killed:', data);
                if (data.victim === this.mySessionId) {
                    this.showDeathScreen(data);
                }
                this.playDeathEffect(data.victim);
            });
            
            this.room.onMessage("npc_killed", (data) => {
                console.log('💀 NPC killed:', data);
                this.playDeathEffect(data.npcId, true);
            });
            
            this.room.onMessage("player_levelup", (data) => {
                console.log('⬆️ Player level up:', data);
            });
            
            this.room.onMessage("midair_collision", (data) => {
                console.log('💥 Midair collision:', data);
                this.showCollisionEffect(data.p1, data.p2);
            });
            
            console.log('🔌 ============ SERVER CONNECTED ============');
            
        } catch (e) {
            console.error('❌ ============ CONNECTION FAILED ============');
            console.error('❌ Error:', e);
            alert('Failed to connect to server! Make sure server is running.\n\nError: ' + e.message);
        }
    }
    
    createAnimations() {
        console.log('🎬 Creating animations...');
        
        // Pawn animations (peasant)
        if (!this.anims.exists('pawn-idle')) {
            this.anims.create({
                key: 'pawn-idle',
                frames: this.anims.generateFrameNumbers('pawn-blue', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'pawn-walk',
                frames: this.anims.generateFrameNumbers('pawn-blue', { start: 6, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        // Warrior animations (higher levels)
        if (!this.anims.exists('warrior-idle')) {
            this.anims.create({
                key: 'warrior-idle',
                frames: this.anims.generateFrameNumbers('warrior-blue', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'warrior-walk',
                frames: this.anims.generateFrameNumbers('warrior-blue', { start: 6, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
            this.anims.create({
                key: 'warrior-attack',
                frames: this.anims.generateFrameNumbers('warrior-blue', { start: 12, end: 17 }),
                frameRate: 15,
                repeat: 0
            });
        }
        
        // Legend animations (purple warrior)
        if (!this.anims.exists('legend-idle')) {
            this.anims.create({
                key: 'legend-idle',
                frames: this.anims.generateFrameNumbers('warrior-purple', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
            this.anims.create({
                key: 'legend-walk',
                frames: this.anims.generateFrameNumbers('warrior-purple', { start: 6, end: 11 }),
                frameRate: 12,
                repeat: -1
            });
        }
        
        // Goblin (NPC)
        if (!this.anims.exists('goblin-idle')) {
            this.anims.create({
                key: 'goblin-idle',
                frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Explosion
        if (!this.anims.exists('explode')) {
            this.anims.create({
                key: 'explode',
                frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
                frameRate: 16,
                repeat: 0
            });
        }
        
        console.log('✅ Animations created');
    }
    
    addPlayer(sessionId, player) {
        console.log('👤 ============ ADDING PLAYER ============');
        console.log('  Session ID:', sessionId);
        console.log('  Position:', player.x, player.y);
        console.log('  Username:', player.username);
        console.log('  Level:', player.level);
        console.log('  HP:', player.hp, '/', player.maxHp);
        
        const isLocal = sessionId === this.mySessionId;
        console.log('  Is local player?', isLocal);
        
        // Shadow
        const shadow = this.add.ellipse(player.x, player.y, 40, 20, 0x000000, 0.3);
        shadow.setDepth(-1);
        this.shadows.set(sessionId, shadow);
        console.log('  ✅ Shadow created at', player.x, player.y);
        
        // Sprite
        const spriteKey = this.getSpriteKey(player.level);
        console.log('  Sprite key:', spriteKey);
        
        const sprite = this.add.sprite(player.x, player.y, spriteKey);
        sprite.setScale(0.6);
        sprite.play(this.getAnimKey(player.level, 'idle'));
        sprite.setDepth(100);
        
        console.log('  ✅ Sprite created:', sprite.x, sprite.y, 'scale:', sprite.scale);
        
        this.playerSprites.set(sessionId, sprite);
        
        // DEBUG: Add bounding box
        const bounds = sprite.getBounds();
        const bbox = this.add.rectangle(bounds.centerX, bounds.centerY, bounds.width, bounds.height);
        bbox.setStrokeStyle(3, isLocal ? 0x00ff00 : 0xffff00);
        bbox.setDepth(99);
        
        // Name tag
        const nameText = this.add.text(player.x, player.y - 50, player.username, {
            fontSize: '16px',
            color: isLocal ? '#00ff00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(200);
        this.nameTexts.set(sessionId, nameText);
        console.log('  ✅ Name tag created:', player.username);
        
        // Health bar
        const healthBar = this.add.graphics();
        healthBar.setDepth(200);
        this.healthBars.set(sessionId, healthBar);
        
        if (isLocal) {
            console.log('  🎮 THIS IS THE LOCAL PLAYER!');
            this.localPlayer = player;
            this.cameras.main.startFollow(sprite, true, 0.1, 0.1);
            console.log('  📷 Camera now following player');
            console.log('  📷 Camera target:', this.cameras.main.getFollowTarget());
            
            // Update HUD
            this.updateHUD();
            
            // DEBUG: Add a big indicator above local player
            this.add.text(player.x, player.y - 150, '⬇️ YOU ARE HERE ⬇️', {
                fontSize: '32px',
                color: '#00ff00',
                backgroundColor: '#000000',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(1000);
        }
        
        // Listen for changes
        player.onChange = () => {
            this.updatePlayerSprite(sessionId, player);
            if (isLocal) {
                this.updateHUD();
            }
        };
        
        console.log('👤 ============ PLAYER ADDED COMPLETE ============');
    }
    
    removePlayer(sessionId) {
        const sprite = this.playerSprites.get(sessionId);
        const nameText = this.nameTexts.get(sessionId);
        const healthBar = this.healthBars.get(sessionId);
        const shadow = this.shadows.get(sessionId);
        
        if (sprite) sprite.destroy();
        if (nameText) nameText.destroy();
        if (healthBar) healthBar.destroy();
        if (shadow) shadow.destroy();
        
        this.playerSprites.delete(sessionId);
        this.nameTexts.delete(sessionId);
        this.healthBars.delete(sessionId);
        this.shadows.delete(sessionId);
    }
    
    addNPC(npcId, npc) {
        const sprite = this.add.sprite(npc.x, npc.y, 'goblin');
        sprite.setScale(0.5);
        sprite.play('goblin-idle');
        sprite.setTint(0xff6666);
        sprite.setDepth(50);
        
        this.npcSprites.set(npcId, sprite);
        
        npc.onChange = () => {
            sprite.x = npc.x;
            sprite.y = npc.y;
        };
    }
    
    removeNPC(npcId) {
        const sprite = this.npcSprites.get(npcId);
        if (sprite) sprite.destroy();
        this.npcSprites.delete(npcId);
    }
    
    updatePlayerSprite(sessionId, player) {
        const sprite = this.playerSprites.get(sessionId);
        const nameText = this.nameTexts.get(sessionId);
        const healthBar = this.healthBars.get(sessionId);
        const shadow = this.shadows.get(sessionId);
        
        if (!sprite) return;
        
        // Update position with interpolation
        sprite.x = Phaser.Math.Linear(sprite.x, player.x, 0.3);
        sprite.y = Phaser.Math.Linear(sprite.y, player.y - player.z, 0.3);
        
        // Update scale based on level
        const stage = GameConfig.EVOLUTION_STAGES[Math.min(player.level - 1, GameConfig.EVOLUTION_STAGES.length - 1)];
        sprite.setScale(stage.scale * 0.6);
        
        // Update sprite texture if evolved
        const newSpriteKey = this.getSpriteKey(player.level);
        if (sprite.texture.key !== newSpriteKey) {
            sprite.setTexture(newSpriteKey);
            sprite.play(this.getAnimKey(player.level, 'idle'));
        }
        
        // Update animation
        const isMoving = Math.abs(player.vx) > 10 || Math.abs(player.vy) > 10;
        if (player.isAttacking) {
            if (this.anims.exists(this.getAnimKey(player.level, 'attack'))) {
                sprite.play(this.getAnimKey(player.level, 'attack'), true);
            }
        } else if (isMoving) {
            sprite.play(this.getAnimKey(player.level, 'walk'), true);
        } else {
            sprite.play(this.getAnimKey(player.level, 'idle'), true);
        }
        
        // Rotation
        sprite.rotation = player.angle + Math.PI / 2;
        
        // Name tag
        if (nameText) {
            nameText.x = sprite.x;
            nameText.y = sprite.y - 50 - (stage.scale * 20);
        }
        
        // Health bar
        if (healthBar && player.hp < player.maxHp) {
            healthBar.clear();
            const barWidth = 40;
            const barHeight = 5;
            const x = sprite.x - barWidth / 2;
            const y = sprite.y - 40 - (stage.scale * 20);
            
            healthBar.fillStyle(0x000000, 0.5);
            healthBar.fillRect(x, y, barWidth, barHeight);
            
            healthBar.fillStyle(0xff0000);
            healthBar.fillRect(x, y, barWidth, barHeight);
            
            const hpPercent = player.hp / player.maxHp;
            healthBar.fillStyle(0x00ff00);
            healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
        } else if (healthBar) {
            healthBar.clear();
        }
        
        // Shadow
        if (shadow) {
            shadow.x = player.x;
            shadow.y = player.y;
            const shadowScale = 1 - (player.z / 100) * 0.5;
            shadow.setScale(shadowScale * stage.scale);
            shadow.setAlpha(0.3 * shadowScale);
        }
    }
    
    getSpriteKey(level) {
        if (level <= 2) return 'pawn-blue';
        if (level <= 8) return 'warrior-blue';
        return 'warrior-purple';
    }
    
    getAnimKey(level, action) {
        if (level <= 2) return `pawn-${action}`;
        if (level <= 8) return `warrior-${action}`;
        return `legend-${action}`;
    }
    
    sendInput() {
        if (!this.room || !this.localPlayer) return;
        
        const moveX = (this.cursors.right.isDown || this.wasd.d.isDown ? 1 : 0) - 
                      (this.cursors.left.isDown || this.wasd.a.isDown ? 1 : 0);
        const moveY = (this.cursors.down.isDown || this.wasd.s.isDown ? 1 : 0) - 
                      (this.cursors.up.isDown || this.wasd.w.isDown ? 1 : 0);
        
        const jump = this.spaceKey.isDown;
        const attack = this.input.activePointer.isDown;
        
        const mouseWorldX = this.input.activePointer.worldX;
        const mouseWorldY = this.input.activePointer.worldY;
        
        this.room.send("input", {
            moveX,
            moveY,
            jump,
            attack,
            mouseX: mouseWorldX,
            mouseY: mouseWorldY,
            attackAngle: Phaser.Math.Angle.Between(
                this.localPlayer.x, this.localPlayer.y,
                mouseWorldX, mouseWorldY
            )
        });
    }
    
    updateHUD() {
        if (!this.localPlayer) return;
        
        document.getElementById('player-level').textContent = this.localPlayer.level;
        document.getElementById('player-hp').textContent = `${Math.round(this.localPlayer.hp)}/${this.localPlayer.maxHp}`;
        document.getElementById('player-xp').textContent = `${this.localPlayer.xp}/${this.localPlayer.xpToNext}`;
        document.getElementById('player-kills').textContent = this.localPlayer.kills;
        
        const hpPercent = (this.localPlayer.hp / this.localPlayer.maxHp) * 100;
        document.getElementById('hp-bar').style.width = `${hpPercent}%`;
        
        const xpPercent = (this.localPlayer.xp / this.localPlayer.xpToNext) * 100;
        document.getElementById('xp-bar').style.width = `${xpPercent}%`;
    }
    
    updateLeaderboard() {
        if (!this.room) return;
        
        const players = Array.from(this.room.state.players.entries())
            .map(([id, player]) => ({ id, ...player }))
            .sort((a, b) => b.level - a.level || b.kills - a.kills)
            .slice(0, 10);
        
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = players.map((p, i) => {
            const isYou = p.id === this.mySessionId;
            return `<div class="leaderboard-entry ${isYou ? 'you' : ''}">
                <span>${i + 1}. ${p.username}</span>
                <span>Lv.${p.level} (${p.kills})</span>
            </div>`;
        }).join('');
    }
    
    showDeathScreen(data) {
        document.getElementById('final-level').textContent = this.localPlayer?.level || 1;
        document.getElementById('final-kills').textContent = this.localPlayer?.kills || 0;
        document.getElementById('death-screen').classList.add('active');
    }
    
    respawn() {
        document.getElementById('death-screen').classList.remove('active');
        this.room.send("respawn");
    }
    
    showHitEffect(targetId, damage, isBackstab) {
        const sprite = this.playerSprites.get(targetId);
        if (!sprite) return;
        
        // Flash red
        this.flashSprite(sprite);
        
        // Damage text
        const damageText = this.add.text(sprite.x, sprite.y - 60, Math.round(damage), {
            fontSize: isBackstab ? '32px' : '24px',
            color: isBackstab ? '#ff0000' : '#ffaa00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    }
    
    flashSprite(sprite) {
        sprite.setTint(0xff0000);
        this.time.delayedCall(80, () => {
            if (sprite && sprite.active) sprite.clearTint();
        });
    }
    
    playDeathEffect(entityId, isNPC = false) {
        const sprite = isNPC ? this.npcSprites.get(entityId) : this.playerSprites.get(entityId);
        if (!sprite) return;
        
        const explosion = this.add.sprite(sprite.x, sprite.y, 'explosion');
        explosion.setScale(2);
        explosion.play('explode');
        explosion.once('animationcomplete', () => explosion.destroy());
        
        this.cameras.main.shake(100, 0.003);
    }
    
    showCollisionEffect(p1Id, p2Id) {
        const s1 = this.playerSprites.get(p1Id);
        const s2 = this.playerSprites.get(p2Id);
        
        if (s1 && s2) {
            const midX = (s1.x + s2.x) / 2;
            const midY = (s1.y + s2.y) / 2;
            
            const flash = this.add.circle(midX, midY, 60, 0xffffff, 0.8);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 2,
                duration: 300,
                onComplete: () => flash.destroy()
            });
            
            this.cameras.main.shake(150, 0.005);
        }
    }
    
    update() {
        // Smooth camera zoom based on player level
        if (this.localPlayer) {
            const targetZoom = Math.max(0.5, 0.8 - (this.localPlayer.level * 0.02));
            const currentZoom = this.cameras.main.zoom;
            this.cameras.main.setZoom(Phaser.Math.Linear(currentZoom, targetZoom, 0.02));
        }
    }
}