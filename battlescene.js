// BattleScene - Full original game adapted for castle defense
class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }
    
    create() {
        console.log('🎮 Battle Scene Started');
        
        // Initialize game state
        this.levelConfig = gameData.getCurrentLevelConfig();
        this.currentWave = 0;
        this.enemiesAlive = 0;
        this.totalKills = 0;
        this.goldEarned = 0;
        this.timeRemaining = GameConfig.game.levelDuration;
        this.isLevelComplete = false;
        
        // World setup
        const WORLD_WIDTH = GameConfig.world.width;
        const WORLD_HEIGHT = GameConfig.world.height;
        
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.7);
        
        // Background
        this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x2d5016);
        
        // Create textures
        this.createAllTextures();
        
        // Create castle
        this.createCastle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        
        // Create player
        this.createPlayer(WORLD_WIDTH / 2 - 100, WORLD_HEIGHT / 2);
        
        // Create groups
        this.allies = this.physics.add.group();
        this.mobs = this.physics.add.group(); // enemies
        this.powerups = this.physics.add.group();
        this.bosses = this.physics.add.group();
        
        // Spawn initial army
        this.spawnInitialArmy();
        
        // UI
        this.createUI();
        
        // Input
        this.pointer = this.input.activePointer;
        this.setupAbilities();
        
        // Start waves
        this.time.delayedCall(3000, () => this.spawnWave());
        
        // Spawn powerups periodically
        this.time.addEvent({
            delay: 15000,
            callback: () => this.spawnPowerup(),
            loop: true
        });
    }
    
    createAllTextures() {
        const heroClass = gameData.data.hero.class;
        const classConfig = GameConfig.classes[heroClass];
        
        this.createEmojiTexture('player', classConfig.icon, 64);
        this.createEmojiTexture('knight', GameConfig.units.knight.icon, 56);
        this.createEmojiTexture('archer', GameConfig.units.archer.icon, 52);
        this.createEmojiTexture('mob', GameConfig.enemies.goblin.icon, 48);
        this.createEmojiTexture('goblin', GameConfig.enemies.goblin.icon, 48);
        this.createEmojiTexture('orc', GameConfig.enemies.orc.icon, 52);
        this.createEmojiTexture('troll', GameConfig.enemies.troll.icon, 60);
        this.createEmojiTexture('dragon', GameConfig.enemies.dragon.icon, 80);
        this.createEmojiTexture('powerup-speed', GameConfig.emojis.gold, 40);
        this.createEmojiTexture('powerup-damage', GameConfig.emojis.gold, 40);
        this.createEmojiTexture('powerup-heal', GameConfig.emojis.gold, 40);
        
        // Attack graphics
        const swordGfx = this.add.graphics();
        swordGfx.fillStyle(0xffff00, 1);
        swordGfx.fillRect(0, 0, 4, 12);
        swordGfx.fillStyle(0xffaa00, 1);
        swordGfx.fillTriangle(2, 0, 0, 3, 4, 3);
        swordGfx.generateTexture('sword', 4, 12);
        swordGfx.destroy();
        
        const arrowGfx = this.add.graphics();
        arrowGfx.fillStyle(0x885533, 1);
        arrowGfx.fillRect(0, 0, 2, 10);
        arrowGfx.fillStyle(0xcccccc, 1);
        arrowGfx.fillTriangle(1, 0, 0, 3, 2, 3);
        arrowGfx.generateTexture('arrow', 2, 10);
        arrowGfx.destroy();
        
        const bloodGfx = this.add.graphics();
        bloodGfx.fillStyle(0xff0000, 1);
        bloodGfx.fillCircle(3, 3, 3);
        bloodGfx.generateTexture('blood', 6, 6);
        bloodGfx.destroy();
    }
    
    createCastle(x, y) {
        // Visual castle
        this.add.text(x, y, GameConfig.emojis.castle, {
            fontSize: '100px'
        }).setOrigin(0.5);
        
        // Castle data holder (invisible)
        this.castle = { 
            x: x, 
            y: y,
            hp: 1000, 
            maxHp: 1000 
        };
        
        // Defense radius indicator
        this.add.circle(x, y, 250, 0xffd700, 0.05)
            .setStrokeStyle(2, 0xffd700, 0.2);
    }
    
    createPlayer(x, y) {
        this.player = this.physics.add.sprite(x, y, 'player');
        this.player.setData('hp', gameData.data.hero.maxHp);
        this.player.setData('maxHp', gameData.data.hero.maxHp);
        this.player.setData('damage', gameData.data.hero.damage);
        this.player.setData('attackRange', gameData.data.hero.range);
        this.player.setData('attackSpeed', 500);
        this.player.setData('lastAttack', 0);
        this.player.setData('team', 'blue');
        this.player.setData('isPlayer', true);
        
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
    
    spawnInitialArmy() {
        const knights = gameData.data.army.knights || 0;
        const archers = gameData.data.army.archers || 0;
        
        // Spawn knights
        for (let i = 0; i < knights; i++) {
            const angle = (Math.PI * 2 * i) / Math.max(1, knights);
            const dist = 80 + Math.random() * 30;
            this.spawnAlly('knight', this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist);
        }
        
        // Spawn archers  
        for (let i = 0; i < archers; i++) {
            const angle = (Math.PI * 2 * i) / Math.max(1, archers);
            const dist = 120 + Math.random() * 30;
            this.spawnAlly('archer', this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist);
        }
    }
    
    spawnAlly(type, x, y) {
        const config = GameConfig.units[type];
        const ally = this.allies.create(x, y, type);
        
        ally.setData('team', 'blue');
        ally.setData('isArcher', type === 'archer');
        ally.setData('hp', config.hp);
        ally.setData('maxHp', config.hp);
        ally.setData('damage', config.damage);
        ally.setData('attackRange', config.range);
        ally.setData('attackSpeed', config.attackSpeed);
        ally.setData('lastAttack', 0);
    }
    
    spawnWave() {
        if (this.isLevelComplete) return;
        
        this.currentWave++;
        
        if (this.currentWave > this.levelConfig.waves) return;
        
        console.log(`🌊 Wave ${this.currentWave}/${this.levelConfig.waves}`);
        this.waveText.setText(`${GameConfig.text.wave}: ${this.currentWave}/${this.levelConfig.waves}`);
        
        const enemyTypes = this.levelConfig.enemyTypes;
        const count = this.levelConfig.enemiesPerWave;
        
        // Spawn enemies
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 300, () => {
                const type = Phaser.Utils.Array.GetRandom(enemyTypes);
                this.spawnMob(type);
            });
        }
        
        // Boss wave
        if (this.levelConfig.bossWave && this.currentWave === this.levelConfig.waves) {
            const bossCount = this.levelConfig.bossCount || 1;
            for (let i = 0; i < bossCount; i++) {
                this.time.delayedCall(4000 + (i * 2000), () => {
                    this.spawnBoss();
                });
            }
        }
        
        // Next wave
        if (this.currentWave < this.levelConfig.waves) {
            this.time.delayedCall(GameConfig.game.waveInterval, () => this.spawnWave());
        }
    }
    
    spawnMob(type) {
        const config = GameConfig.enemies[type];
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        
        // Random edge
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = Math.random() * WORLD_WIDTH; y = 50; break;
            case 1: x = WORLD_WIDTH - 50; y = Math.random() * WORLD_HEIGHT; break;
            case 2: x = Math.random() * WORLD_WIDTH; y = WORLD_HEIGHT - 50; break;
            case 3: x = 50; y = Math.random() * WORLD_HEIGHT; break;
        }
        
        const mob = this.mobs.create(x, y, type);
        mob.setData('type', type);
        mob.setData('team', 'mob');
        mob.setData('hp', config.hp);
        mob.setData('maxHp', config.hp);
        mob.setData('damage', config.damage);
        mob.setData('speed', config.speed);
        mob.setData('attackRange', config.range);
        mob.setData('attackSpeed', config.attackSpeed);
        mob.setData('lastAttack', 0);
        mob.setData('goldReward', config.goldReward);
        mob.setData('isMob', true);
        
        this.enemiesAlive++;
    }
    
    spawnBoss() {
        const config = GameConfig.enemies.dragon;
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        
        // Random edge
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = Math.random() * WORLD_WIDTH; y = 50; break;
            case 1: x = WORLD_WIDTH - 50; y = Math.random() * WORLD_HEIGHT; break;
            case 2: x = Math.random() * WORLD_WIDTH; y = WORLD_HEIGHT - 50; break;
            case 3: x = 50; y = Math.random() * WORLD_HEIGHT; break;
        }
        
        const boss = this.bosses.create(x, y, 'dragon');
        boss.setData('hp', config.hp);
        boss.setData('maxHp', config.hp);
        boss.setData('damage', config.damage);
        boss.setData('speed', config.speed);
        boss.setData('attackRange', config.range);
        boss.setData('attackSpeed', config.attackSpeed);
        boss.setData('lastAttack', 0);
        boss.setData('goldReward', config.goldReward);
        boss.setData('team', 'boss');
        boss.setData('isBoss', true);
        
        this.enemiesAlive++;
    }
    
    spawnPowerup() {
        const types = ['speed', 'damage', 'heal'];
        const type = types[Math.floor(Math.random() * types.length)];
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        
        const powerup = this.powerups.create(
            Math.random() * WORLD_WIDTH,
            Math.random() * WORLD_HEIGHT,
            `powerup-${type}`
        );
        
        powerup.setData('type', type);
        
        this.tweens.add({
            targets: powerup,
            y: powerup.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    createUI() {
        const { width } = this.cameras.main;
        
        this.waveText = this.add.text(20, 20, `${GameConfig.text.wave}: 0/0`, {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(2000);
        
        this.timeText = this.add.text(20, 55, '', {
            fontSize: '24px',
            color: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(2000);
        
        this.killsText = this.add.text(20, 85, `${GameConfig.text.kills}: 0`, {
            fontSize: '24px',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(2000);
        
        this.goldText = this.add.text(20, 115, `${GameConfig.emojis.gold} +0`, {
            fontSize: '22px',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setScrollFactor(0).setDepth(2000);
        
        this.castleHPText = this.add.text(width - 20, 20, 'Castle: 1000/1000', {
            fontSize: '24px',
            color: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);
        
        this.armyText = this.add.text(width - 20, 50, `Army: ${this.allies.children.entries.length}`, {
            fontSize: '20px',
            color: '#ffaa00',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);
    }
    
    setupAbilities() {
        this.input.keyboard.on('keydown-Q', () => this.useDash());
        this.input.keyboard.on('keydown-E', () => this.useAOE());
        
        this.abilities = {
            dash: { lastUsed: 0 },
            aoe: { lastUsed: 0 }
        };
    }
    
    useDash() {
        if (!this.player || !this.player.active) return;
        
        const now = Date.now();
        if (now - this.abilities.dash.lastUsed < GameConfig.abilities.dash.cooldown) return;
        
        this.abilities.dash.lastUsed = now;
        
        const angle = this.player.getData('facingAngle') || 0;
        const distance = GameConfig.abilities.dash.distance;
        
        this.tweens.add({
            targets: this.player,
            x: this.player.x + Math.cos(angle) * distance,
            y: this.player.y + Math.sin(angle) * distance,
            duration: 150,
            ease: 'Power2'
        });
        
        const trail = this.add.circle(this.player.x, this.player.y, 40, 0xffd700, 0.5);
        this.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => trail.destroy()
        });
    }
    
    useAOE() {
        if (!this.player || !this.player.active) return;
        
        const now = Date.now();
        if (now - this.abilities.aoe.lastUsed < GameConfig.abilities.aoe.cooldown) return;
        
        this.abilities.aoe.lastUsed = now;
        
        const range = GameConfig.abilities.aoe.range;
        const damage = gameData.data.hero.damage * 2;
        
        const aoeCircle = this.add.circle(this.player.x, this.player.y, range, 0xff0000, 0.3);
        this.tweens.add({
            targets: aoeCircle,
            alpha: 0,
            scale: 1.3,
            duration: 500,
            onComplete: () => aoeCircle.destroy()
        });
        
        // Damage all enemies in range
        this.mobs.children.entries.forEach(mob => {
            if (!mob.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, mob.x, mob.y);
            if (dist <= range) this.damageMob(mob, damage);
        });
        
        this.bosses.children.entries.forEach(boss => {
            if (!boss.active) return;
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, boss.x, boss.y);
            if (dist <= range) this.damageBoss(boss, damage);
        });
    }
    
    update(time, delta) {
        if (this.isLevelComplete) return;
        
        // Update timer
        this.timeRemaining -= delta;
        const seconds = Math.max(0, Math.floor(this.timeRemaining / 1000));
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.timeText.setText(`Time: ${minutes}:${secs.toString().padStart(2, '0')}`);
        
        // Check victory
        if (this.timeRemaining <= 0 || (this.currentWave >= this.levelConfig.waves && this.enemiesAlive === 0)) {
            this.levelComplete(true);
            return;
        }
        
        // Check defeat
        if (this.castle.hp <= 0) {
            this.levelComplete(false);
            return;
        }
        
        // Player movement
        if (this.player && this.player.active) {
            this.updatePlayerMovement();
        }
        
        // Allies formation
        this.updateAlliesFormation();
        
        // Enemy AI
        this.updateEnemiesAI();
        
        // Boss AI
        this.updateBossesAI();
        
        // Combat
        this.updateCombat(time);
        
        // Powerups
        this.updatePowerups();
        
        // Health bars
        this.renderHealthBars();
        
        // Camera zoom
        this.updateCameraZoom();
        
        // Update castle HP display
        this.castleHPText.setText(`Castle: ${Math.round(this.castle.hp)}/${this.castle.maxHp}`);
        this.armyText.setText(`Army: ${this.allies.children.entries.length + 1}`);
    }
    
    updatePlayerMovement() {
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.pointer.worldX, this.pointer.worldY
        );
        
        const speed = gameData.data.hero.speed;
        
        if (distance > 20) {
            const angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                this.pointer.worldX, this.pointer.worldY
            );
            
            this.player.rotation = angle + Math.PI / 2;
            this.player.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            this.player.setData('facingAngle', angle);
        } else {
            this.player.setVelocity(0, 0);
        }
        
        // Bounds
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        this.player.x = Phaser.Math.Clamp(this.player.x, 30, WORLD_WIDTH - 30);
        this.player.y = Phaser.Math.Clamp(this.player.y, 30, WORLD_HEIGHT - 30);
    }
    
    updateAlliesFormation() {
        const playerAngle = this.player.getData('facingAngle') || 0;
        
        const knights = [];
        const archers = [];
        
        this.allies.children.entries.forEach(ally => {
            if (!ally || !ally.active) return;
            if (ally.getData('isArcher')) {
                archers.push(ally);
            } else {
                knights.push(ally);
            }
        });
        
        // Knights - front formation
        knights.forEach((knight, index) => {
            const row = Math.floor(index / 10);
            const col = (index % 10) - 4.5;
            
            const spacing = 45;
            const forwardOffset = 50;
            
            const targetX = this.player.x + Math.cos(playerAngle) * (forwardOffset + row * spacing) - Math.sin(playerAngle) * col * spacing;
            const targetY = this.player.y + Math.sin(playerAngle) * (forwardOffset + row * spacing) + Math.cos(playerAngle) * col * spacing;
            
            const dist = Phaser.Math.Distance.Between(knight.x, knight.y, targetX, targetY);
            
            if (dist > 15) {
                const angle = Phaser.Math.Angle.Between(knight.x, knight.y, targetX, targetY);
                knight.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
                knight.rotation = playerAngle + Math.PI / 2;
            } else {
                knight.setVelocity(knight.body.velocity.x * 0.88, knight.body.velocity.y * 0.88);
            }
        });
        
        // Archers - back formation
        archers.forEach((archer, index) => {
            const row = Math.floor(index / 10);
            const col = (index % 10) - 4.5;
            
            const spacing = 45;
            const backwardOffset = -50;
            
            const targetX = this.player.x + Math.cos(playerAngle) * (backwardOffset - row * spacing) - Math.sin(playerAngle) * col * spacing;
            const targetY = this.player.y + Math.sin(playerAngle) * (backwardOffset - row * spacing) + Math.cos(playerAngle) * col * spacing;
            
            const dist = Phaser.Math.Distance.Between(archer.x, archer.y, targetX, targetY);
            
            if (dist > 15) {
                const angle = Phaser.Math.Angle.Between(archer.x, archer.y, targetX, targetY);
                archer.setVelocity(Math.cos(angle) * 210, Math.sin(angle) * 210);
                archer.rotation = playerAngle + Math.PI / 2;
            } else {
                archer.setVelocity(archer.body.velocity.x * 0.88, archer.body.velocity.y * 0.88);
            }
        });
    }
    
    updateEnemiesAI() {
        this.mobs.children.entries.forEach(mob => {
            if (!mob || !mob.active) return;
            
            // Move towards castle
            const angle = Phaser.Math.Angle.Between(mob.x, mob.y, this.castle.x, this.castle.y);
            const speed = mob.getData('speed');
            mob.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        });
    }
    
    updateBossesAI() {
        this.bosses.children.entries.forEach(boss => {
            if (!boss || !boss.active) return;
            
            // Move towards player or castle (whichever is closer)
            const distToPlayer = Phaser.Math.Distance.Between(boss.x, boss.y, this.player.x, this.player.y);
            const distToCastle = Phaser.Math.Distance.Between(boss.x, boss.y, this.castle.x, this.castle.y);
            
            const targetX = distToPlayer < distToCastle ? this.player.x : this.castle.x;
            const targetY = distToPlayer < distToCastle ? this.player.y : this.castle.y;
            
            const angle = Phaser.Math.Angle.Between(boss.x, boss.y, targetX, targetY);
            const speed = boss.getData('speed');
            boss.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        });
    }
    
    updateCombat(time) {
        // Player attacks
        this.autoAttack(this.player, time);
        
        // Allies attack
        this.allies.children.entries.forEach(ally => {
            if (ally.active) this.autoAttack(ally, time);
        });
        
        // Enemies attack
        this.mobs.children.entries.forEach(mob => {
            if (mob.active) this.enemyAutoAttack(mob, time);
        });
        
        this.bosses.children.entries.forEach(boss => {
            if (boss.active) this.enemyAutoAttack(boss, time);
        });
    }
    
    autoAttack(attacker, time) {
        const lastAttack = attacker.getData('lastAttack') || 0;
        const attackSpeed = attacker.getData('attackSpeed') || 500;
        
        if (time - lastAttack < attackSpeed) return;
        
        const attackRange = attacker.getData('attackRange') || 80;
        const isArcher = attacker.getData('isArcher') || false;
        
        let nearest = null;
        let minDist = attackRange;
        
        // Find nearest enemy
        this.mobs.children.entries.forEach(mob => {
            if (!mob.active) return;
            const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, mob.x, mob.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = mob;
            }
        });
        
        this.bosses.children.entries.forEach(boss => {
            if (!boss.active) return;
            const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, boss.x, boss.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = boss;
            }
        });
        
        if (nearest) {
            attacker.setData('lastAttack', time);
            const damage = attacker.getData('damage');
            
            if (isArcher) {
                // Arrow projectile
                const arrow = this.add.sprite(attacker.x, attacker.y, 'arrow');
                const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, nearest.x, nearest.y);
                arrow.setRotation(angle);
                arrow.setScale(2);
                
                this.tweens.add({
                    targets: arrow,
                    x: nearest.x,
                    y: nearest.y,
                    duration: 120,
                    onComplete: () => {
                        arrow.destroy();
                        if (nearest && nearest.active) {
                            if (nearest.getData('isBoss')) {
                                this.damageBoss(nearest, damage);
                            } else {
                                this.damageMob(nearest, damage);
                            }
                        }
                    }
                });
            } else {
                // Melee slash
                const slash = this.add.sprite(attacker.x, attacker.y, 'sword');
                slash.setAlpha(0.9);
                slash.setScale(2);
                const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, nearest.x, nearest.y);
                slash.setRotation(angle);
                
                this.tweens.add({
                    targets: slash,
                    x: nearest.x,
                    y: nearest.y,
                    alpha: 0,
                    rotation: angle + Math.PI * 0.5,
                    duration: 120,
                    onComplete: () => slash.destroy()
                });
                
                if (nearest.getData('isBoss')) {
                    this.damageBoss(nearest, damage);
                } else {
                    this.damageMob(nearest, damage);
                }
            }
        }
    }
    
    enemyAutoAttack(enemy, time) {
        const lastAttack = enemy.getData('lastAttack') || 0;
        const attackSpeed = enemy.getData('attackSpeed') || 800;
        
        if (time - lastAttack < attackSpeed) return;
        
        const range = enemy.getData('attackRange');
        const damage = enemy.getData('damage');
        
        // Priority: Castle > Player > Allies
        const distToCastle = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.castle.x, this.castle.y);
        if (distToCastle < range) {
            enemy.setData('lastAttack', time);
            this.castle.hp = Math.max(0, this.castle.hp - damage);
            return;
        }
        
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < range) {
            enemy.setData('lastAttack', time);
            const hp = this.player.getData('hp') - damage;
            this.player.setData('hp', Math.max(0, hp));
            return;
        }
        
        // Check allies
        this.allies.children.entries.forEach(ally => {
            if (!ally.active) return;
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y);
            if (dist < range) {
                enemy.setData('lastAttack', time);
                const hp = ally.getData('hp') - damage;
                ally.setData('hp', Math.max(0, hp));
                if (hp <= 0) {
                    // Death particles
                    for (let i = 0; i < 5; i++) {
                        const particle = this.add.circle(ally.x, ally.y, 2, 0xff4444);
                        const angle = (Math.PI * 2 * i) / 5;
                        this.tweens.add({
                            targets: particle,
                            x: ally.x + Math.cos(angle) * 30,
                            y: ally.y + Math.sin(angle) * 30,
                            alpha: 0,
                            duration: 300,
                            onComplete: () => particle.destroy()
                        });
                    }
                    ally.destroy();
                }
            }
        });
    }
    
    damageMob(mob, damage) {
        const hp = mob.getData('hp') - damage;
        mob.setData('hp', hp);
        
        mob.setTint(0xffffff);
        this.time.delayedCall(80, () => {
            if (mob && mob.active) mob.clearTint();
        });
        
        // Blood particles
        for (let i = 0; i < 3; i++) {
            const blood = this.add.sprite(mob.x, mob.y, 'blood');
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 15 + 10;
            
            this.tweens.add({
                targets: blood,
                x: mob.x + Math.cos(angle) * dist,
                y: mob.y + Math.sin(angle) * dist,
                alpha: 0,
                scale: { from: 1, to: 0.3 },
                duration: 350,
                onComplete: () => blood.destroy()
            });
        }
        
        if (hp <= 0) {
            this.killMob(mob);
        }
    }
    
    damageBoss(boss, damage) {
        const hp = boss.getData('hp') - damage;
        boss.setData('hp', hp);
        
        boss.setTint(0xffffff);
        this.time.delayedCall(80, () => {
            if (boss && boss.active) boss.clearTint();
        });
        
        if (hp <= 0) {
            this.killBoss(boss);
        }
    }
    
    killMob(mob) {
        const gold = mob.getData('goldReward');
        this.goldEarned += gold;
        this.totalKills++;
        this.enemiesAlive--;
        
        this.goldText.setText(`${GameConfig.emojis.gold} +${this.goldEarned}`);
        this.killsText.setText(`${GameConfig.text.kills}: ${this.totalKills}`);
        
        // Death particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(mob.x, mob.y, 3 + Math.random() * 3, 0xff4444);
            const angle = (Math.PI * 2 * i) / 8;
            this.tweens.add({
                targets: particle,
                x: mob.x + Math.cos(angle) * 40,
                y: mob.y + Math.sin(angle) * 40,
                alpha: 0,
                duration: 400,
                onComplete: () => particle.destroy()
            });
        }
        
        mob.destroy();
    }
    
    killBoss(boss) {
        const gold = boss.getData('goldReward');
        this.goldEarned += gold;
        this.totalKills += 5;
        this.enemiesAlive--;
        
        this.goldText.setText(`${GameConfig.emojis.gold} +${this.goldEarned}`);
        this.killsText.setText(`${GameConfig.text.kills}: ${this.totalKills}`);
        
        // Massive death particles
        for (let i = 0; i < 16; i++) {
            const particle = this.add.circle(boss.x, boss.y, 5, 0xff0000);
            const angle = (Math.PI * 2 * i) / 16;
            this.tweens.add({
                targets: particle,
                x: boss.x + Math.cos(angle) * 80,
                y: boss.y + Math.sin(angle) * 80,
                alpha: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
        
        boss.destroy();
    }
    
    updatePowerups() {
        this.powerups.children.entries.forEach(powerup => {
            if (!powerup.active || !this.player.active) return;
            
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, powerup.x, powerup.y);
            if (dist < 40) {
                this.collectPowerup(powerup);
            }
        });
    }
    
    collectPowerup(powerup) {
        const type = powerup.getData('type');
        
        if (type === 'heal') {
            const heroData = gameData.data.hero;
            heroData.hp = heroData.maxHp;
            this.player.setData('hp', heroData.maxHp);
        }
        
        powerup.destroy();
    }
    
    renderHealthBars() {
        if (this.healthBarGraphics) {
            this.healthBarGraphics.clear();
        } else {
            this.healthBarGraphics = this.add.graphics();
            this.healthBarGraphics.setDepth(999);
        }
        
        const graphics = this.healthBarGraphics;
        
        const drawBar = (unit, yOffset = -35) => {
            if (!unit || !unit.active) return;
            
            const hp = unit.getData('hp');
            const maxHp = unit.getData('maxHp');
            if (!hp || !maxHp) return;
            
            const barWidth = 40;
            const barHeight = 5;
            const x = unit.x - barWidth / 2;
            const y = unit.y + yOffset;
            
            graphics.fillStyle(0x000000, 0.5);
            graphics.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
            graphics.fillStyle(0xff0000, 1);
            graphics.fillRect(x, y, barWidth, barHeight);
            
            const healthPercent = Math.max(0, hp / maxHp);
            const team = unit.getData('team');
            const color = team === 'blue' ? 0x00ff00 : 0xff6666;
            graphics.fillStyle(color, 1);
            graphics.fillRect(x, y, barWidth * healthPercent, barHeight);
        };
        
        if (this.player && this.player.active) drawBar(this.player, -40);
        
        this.allies.children.entries.forEach(ally => drawBar(ally, -30));
        this.mobs.children.entries.forEach(mob => drawBar(mob, -30));
        this.bosses.children.entries.forEach(boss => drawBar(boss, -50));
    }
    
    updateCameraZoom() {
        const armySize = this.allies.children.entries.length + 1;
        const targetZoom = Math.max(0.4, 0.7 - (armySize * 0.008));
        const currentZoom = this.cameras.main.zoom;
        const newZoom = currentZoom + (targetZoom - currentZoom) * 0.05;
        this.cameras.main.setZoom(newZoom);
    }
    
    levelComplete(victory) {
        this.isLevelComplete = true;
        
        // Stop everything
        if (this.player) this.player.setVelocity(0, 0);
        this.allies.children.entries.forEach(ally => ally.setVelocity(0, 0));
        this.mobs.children.entries.forEach(mob => mob.setVelocity(0, 0));
        this.bosses.children.entries.forEach(boss => boss.setVelocity(0, 0));
        
        if (victory) {
            gameData.completeLevel(this.goldEarned, this.totalKills);
            gameData.saveGame();
            this.showVictoryScreen();
        } else {
            this.showDefeatScreen();
        }
    }
    
    showVictoryScreen() {
        const { width, height } = this.cameras.main;
        
        this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(3000);
        
        this.add.text(width / 2, height / 2 - 100, '🏆 VICTORY! 🏆', {
            fontSize: '64px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.add.text(width / 2, height / 2, `Kills: ${this.totalKills}\nGold Earned: ${this.goldEarned}`, {
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.createButton(width / 2, height / 2 + 100, 'Continue →', () => {
            this.scene.start('CastleScene');
        });
    }
    
    showDefeatScreen() {
        const { width, height } = this.cameras.main;
        
        this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(3000);
        
        this.add.text(width / 2, height / 2 - 100, '💀 DEFEATED 💀', {
            fontSize: '64px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.add.text(width / 2, height / 2, 'Your castle has fallen!', {
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.createButton(width / 2, height / 2 + 70, 'Retry', () => {
            this.scene.restart();
        });
        
        this.createButton(width / 2, height / 2 + 130, '← Castle', () => {
            this.scene.start('CastleScene');
        });
    }
    
    createButton(x, y, text, callback) {
        const btn = this.add.rectangle(x, y, 200, 50, 0x00aa00)
            .setInteractive({ useHandCursor: true })
            .setScrollFactor(0)
            .setDepth(3002);
        
        const txt = this.add.text(x, y, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3003);
        
        btn.on('pointerover', () => btn.setFillStyle(0x00cc00));
        btn.on('pointerout', () => btn.setFillStyle(0x00aa00));
        btn.on('pointerdown', callback);
    }
    
    createEmojiTexture(key, emoji, size) {
        if (this.textures.exists(key)) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, size / 2, size / 2);
        
        this.textures.addCanvas(key, canvas);
    }
}