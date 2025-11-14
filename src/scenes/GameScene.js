class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }
    
    preload() {
        const basePath = 'assets';
        
        this.load.spritesheet('pawn-blue', `${basePath}/Factions/Knights/Troops/Pawn/Blue/Pawn_Blue.png`, 
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior-blue', `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('warrior-purple', `${basePath}/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('goblin', `${basePath}/Factions/Goblins/Troops/Torch/Red/Torch_Red.png`,
            { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('explosion', `${basePath}/Effects/Explosion/Explosions.png`,
            { frameWidth: 32, frameHeight: 32 });
        this.load.image('ground', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('tree', `${basePath}/Resources/Trees/Tree.png`);
    }
    
    create() {
        console.log('🎮 Game Scene Started (AGAR.IO STYLE - Client Authoritative)');
        
        this.WORLD_WIDTH = GameConfig.WORLD_WIDTH;
        this.WORLD_HEIGHT = GameConfig.WORLD_HEIGHT;
        
        this.physics.world.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, this.WORLD_HEIGHT);
        this.cameras.main.setZoom(0.8);
        
        this.add.rectangle(this.WORLD_WIDTH / 2, this.WORLD_HEIGHT / 2, 
            this.WORLD_WIDTH, this.WORLD_HEIGHT, 0x5a7c3e);
        
        this.createAnimations();
        
        this.playerSprites = new Map();
        this.npcSprites = new Map();
        this.nameTexts = new Map();
        this.healthBars = new Map();
        this.shadows = new Map();
        
        // Local player state (CLIENT CONTROLS THIS)
        this.myPosition = { x: 0, y: 0, vx: 0, vy: 0, angle: 0 };
        this.localPlayer = null;
        this.localPlayerSprite = null;
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
        
        this.connectToServer();
        
        // Send position to server (20 times/sec is enough)
        this.time.addEvent({
            delay: 50,
            callback: () => this.sendPosition(),
            loop: true
        });
        
        this.time.addEvent({
            delay: 1000,
            callback: () => this.updateLeaderboard(),
            loop: true
        });
    }
    
    async connectToServer() {
        console.log('🔌 Connecting to server...');
        
        const SERVER_URL = window.location.hostname === 'localhost' 
            ? 'ws://localhost:2567'
            : 'wss://euneus-production.up.railway.app';
        
        try {
            this.client = new Colyseus.Client(SERVER_URL);
            this.room = await this.client.joinOrCreate("ffa", { username: username });
            
            this.mySessionId = this.room.sessionId;
            console.log('✅ Connected! Session:', this.mySessionId);
            
            this.room.onMessage("init", (message) => {
                console.log('📨 Init message received');
            });
            
            this.room.onStateChange.once((state) => {
                console.log('📊 Initial state received');
                
                state.players.forEach((player, sessionId) => {
                    this.addPlayer(sessionId, player);
                });
                
                state.npcs.forEach((npc, npcId) => {
                    this.addNPC(npcId, npc);
                });
                
                console.log('✅ CLIENT-AUTHORITATIVE MODE ACTIVE');
            });
            
            this.room.state.players.onAdd = (player, sessionId) => {
                if (this.playerSprites.has(sessionId)) return;
                this.addPlayer(sessionId, player);
            };
            
            this.room.state.players.onRemove = (player, sessionId) => {
                this.removePlayer(sessionId);
            };
            
            this.room.state.npcs.onAdd = (npc, npcId) => {
                if (this.npcSprites.has(npcId)) return;
                this.addNPC(npcId, npc);
            };
            
            this.room.state.npcs.onRemove = (npc, npcId) => {
                this.removeNPC(npcId);
            };
            
            // Combat events
            this.room.onMessage("player_hit", (data) => {
                this.showHitEffect(data.target, data.damage, data.isBackstab);
            });
            
            this.room.onMessage("npc_hit", (data) => {
                const sprite = this.npcSprites.get(data.npcId);
                if (sprite) this.flashSprite(sprite);
            });
            
            this.room.onMessage("player_killed", (data) => {
                if (data.victim === this.mySessionId) {
                    this.showDeathScreen(data);
                }
                this.playDeathEffect(data.victim);
            });
            
            this.room.onMessage("npc_killed", (data) => {
                this.playDeathEffect(data.npcId, true);
            });
            
            this.room.onMessage("midair_collision", (data) => {
                this.showCollisionEffect(data.p1, data.p2);
            });
            
        } catch (e) {
            console.error('❌ Connection failed:', e);
            alert('Failed to connect to server!');
        }
    }
    
    createAnimations() {
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
        
        if (!this.anims.exists('goblin-idle')) {
            this.anims.create({
                key: 'goblin-idle',
                frames: this.anims.generateFrameNumbers('goblin', { start: 0, end: 5 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        if (!this.anims.exists('explode')) {
            this.anims.create({
                key: 'explode',
                frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
                frameRate: 16,
                repeat: 0
            });
        }
    }
    
    addPlayer(sessionId, player) {
        const isLocal = sessionId === this.mySessionId;
        
        const shadow = this.add.ellipse(player.x, player.y, 40, 20, 0x000000, 0.3);
        shadow.setDepth(-1);
        this.shadows.set(sessionId, shadow);
        
        const spriteKey = this.getSpriteKey(player.level);
        const sprite = this.add.sprite(player.x, player.y, spriteKey);
        sprite.setScale(0.6);
        sprite.play(this.getAnimKey(player.level, 'idle'));
        
        this.playerSprites.set(sessionId, sprite);
        
        const nameText = this.add.text(player.x, player.y - 50, player.username, {
            fontSize: '16px',
            color: isLocal ? '#00ff00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        this.nameTexts.set(sessionId, nameText);
        
        const healthBar = this.add.graphics();
        this.healthBars.set(sessionId, healthBar);
        
        if (isLocal) {
            console.log('👤 This is MY player! I control movement!');
            this.localPlayer = player;
            this.localPlayerSprite = sprite;
            
            // Initialize my position
            this.myPosition.x = player.x;
            this.myPosition.y = player.y;
            
            this.cameras.main.startFollow(sprite, true, 0.1, 0.1);
            this.updateHUD();
            
            // For local player, only listen to server for validation/corrections
            player.listen("x", (serverX) => {
                const error = Math.abs(this.myPosition.x - serverX);
                // Only correct if error is large (>150px = likely cheating or bad lag)
                if (error > 150) {
                    console.warn(`⚠️ Server corrected X by ${error.toFixed(0)}px`);
                    this.myPosition.x = serverX;
                }
            });
            player.listen("y", (serverY) => {
                const error = Math.abs(this.myPosition.y - serverY);
                // Only correct if error is large (>150px = likely cheating or bad lag)
                if (error > 150) {
                    console.warn(`⚠️ Server corrected Y by ${error.toFixed(0)}px`);
                    this.myPosition.y = serverY;
                }
            });
            
            player.listen("hp", () => this.updateHUD());
            player.listen("level", () => this.updateHUD());
            player.listen("xp", () => this.updateHUD());
            player.listen("kills", () => this.updateHUD());
            
        } else {
            // Other players use server position
            player.listen("x", () => this.updatePlayerSprite(sessionId, player));
            player.listen("y", () => this.updatePlayerSprite(sessionId, player));
        }
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
        
        this.npcSprites.set(npcId, sprite);
        
        npc.listen("x", (value) => { sprite.x = value; });
        npc.listen("y", (value) => { sprite.y = value; });
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
        
        sprite.x = Phaser.Math.Linear(sprite.x, player.x, 0.3);
        sprite.y = Phaser.Math.Linear(sprite.y, player.y - player.z, 0.3);
        
        const stage = GameConfig.EVOLUTION_STAGES[Math.min(player.level - 1, GameConfig.EVOLUTION_STAGES.length - 1)];
        sprite.setScale(stage.scale * 0.6);
        
        const newSpriteKey = this.getSpriteKey(player.level);
        if (sprite.texture.key !== newSpriteKey) {
            sprite.setTexture(newSpriteKey);
            sprite.play(this.getAnimKey(player.level, 'idle'));
        }
        
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
        
        sprite.rotation = player.angle + Math.PI / 2;
        
        if (nameText) {
            nameText.x = sprite.x;
            nameText.y = sprite.y - 50 - (stage.scale * 20);
        }
        
        if (healthBar && player.hp < player.maxHp) {
            healthBar.clear();
            const barWidth = 40;
            const barHeight = 5;
            const x = sprite.x - barWidth / 2;
            const y = sprite.y - 40 - (stage.scale * 20);
            
            healthBar.fillStyle(0x000000, 0.5);
            healthBar.fillRect(x, y, barWidth, barHeight);
            
            const hpPercent = player.hp / player.maxHp;
            healthBar.fillStyle(0x00ff00);
            healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
        } else if (healthBar) {
            healthBar.clear();
        }
        
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
    
    sendPosition() {
        if (!this.room || !this.localPlayer) return;
        
        // Send my current position to server
        this.room.send("position", {
            x: this.myPosition.x,
            y: this.myPosition.y,
            vx: this.myPosition.vx,
            vy: this.myPosition.vy,
            angle: this.myPosition.angle
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
        
        this.flashSprite(sprite);
        
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
    
    update(time, delta) {
        if (!this.localPlayer || !this.localPlayerSprite) return;
        
        // delta is in milliseconds, convert to seconds
        const dt = delta / 1000;
        
        // Read input
        const moveX = (this.cursors.right.isDown || this.wasd.d.isDown ? 1 : 0) - 
                      (this.cursors.left.isDown || this.wasd.a.isDown ? 1 : 0);
        const moveY = (this.cursors.down.isDown || this.wasd.s.isDown ? 1 : 0) - 
                      (this.cursors.up.isDown || this.wasd.w.isDown ? 1 : 0);
        
        // CLIENT CONTROLS MOVEMENT COMPLETELY
        const stage = GameConfig.EVOLUTION_STAGES[Math.min(this.localPlayer.level - 1, GameConfig.EVOLUTION_STAGES.length - 1)];
        let speed = stage.speed;
        
        // Apply class modifiers
        if (this.localPlayer.class === "berserker") speed *= GameConfig.CLASSES.berserker.speedBonus;
        else if (this.localPlayer.class === "paladin") speed *= GameConfig.CLASSES.paladin.speedPenalty;
        else if (this.localPlayer.class === "assassin") speed *= GameConfig.CLASSES.assassin.speedBonus;
        
        // Calculate velocity
        const inputMag = Math.sqrt(moveX ** 2 + moveY ** 2);
        if (inputMag > 0) {
            this.myPosition.vx = (moveX / inputMag) * speed;
            this.myPosition.vy = (moveY / inputMag) * speed;
        } else {
            this.myPosition.vx *= GameConfig.FRICTION;
            this.myPosition.vy *= GameConfig.FRICTION;
        }
        
        // Update position INSTANTLY
        this.myPosition.x += this.myPosition.vx * dt;
        this.myPosition.y += this.myPosition.vy * dt;
        
        // Clamp to world bounds
        this.myPosition.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, this.myPosition.x));
        this.myPosition.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, this.myPosition.y));
        
        // Update sprite position IMMEDIATELY
        this.localPlayerSprite.x = this.myPosition.x;
        this.localPlayerSprite.y = this.myPosition.y - (this.localPlayer.z || 0);
        
        // Update facing angle
        const mouseWorldX = this.input.activePointer.worldX;
        const mouseWorldY = this.input.activePointer.worldY;
        this.myPosition.angle = Math.atan2(
            mouseWorldY - this.myPosition.y,
            mouseWorldX - this.myPosition.x
        );
        this.localPlayerSprite.rotation = this.myPosition.angle + Math.PI / 2;
        
        // Update animation
        const isMoving = Math.abs(this.myPosition.vx) > 10 || Math.abs(this.myPosition.vy) > 10;
        if (this.localPlayer.isAttacking) {
            if (this.anims.exists(this.getAnimKey(this.localPlayer.level, 'attack'))) {
                this.localPlayerSprite.play(this.getAnimKey(this.localPlayer.level, 'attack'), true);
            }
        } else if (isMoving) {
            this.localPlayerSprite.play(this.getAnimKey(this.localPlayer.level, 'walk'), true);
        } else {
            this.localPlayerSprite.play(this.getAnimKey(this.localPlayer.level, 'idle'), true);
        }
        
        // Update UI elements
        const nameText = this.nameTexts.get(this.mySessionId);
        const shadow = this.shadows.get(this.mySessionId);
        const healthBar = this.healthBars.get(this.mySessionId);
        
        if (nameText) {
            nameText.x = this.localPlayerSprite.x;
            nameText.y = this.localPlayerSprite.y - 50 - (stage.scale * 20);
        }
        
        if (shadow) {
            shadow.x = this.myPosition.x;
            shadow.y = this.myPosition.y;
        }
        
        if (healthBar && this.localPlayer.hp < this.localPlayer.maxHp) {
            healthBar.clear();
            const barWidth = 40;
            const barHeight = 5;
            const x = this.localPlayerSprite.x - barWidth / 2;
            const y = this.localPlayerSprite.y - 40 - (stage.scale * 20);
            
            healthBar.fillStyle(0x000000, 0.5);
            healthBar.fillRect(x, y, barWidth, barHeight);
            
            const hpPercent = this.localPlayer.hp / this.localPlayer.maxHp;
            healthBar.fillStyle(0x00ff00);
            healthBar.fillRect(x, y, barWidth * hpPercent, barHeight);
        } else if (healthBar) {
            healthBar.clear();
        }
        
        // Handle attacks
        if (this.input.activePointer.isDown && this.localPlayer.attackCooldown <= 0) {
            this.room.send("attack", { angle: this.myPosition.angle });
        }
        
        // Handle jump
        if (this.spaceKey.isDown && !this.spaceWasDown) {
            this.room.send("jump");
        }
        this.spaceWasDown = this.spaceKey.isDown;
        
        // Smooth camera zoom
        const targetZoom = Math.max(0.5, 0.8 - (this.localPlayer.level * 0.02));
        this.cameras.main.setZoom(Phaser.Math.Linear(this.cameras.main.zoom, targetZoom, 0.02));
    }
}