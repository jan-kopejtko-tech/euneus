// BattleScene - FULL ORIGINAL GAME with all mechanics restored
class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }
    
    preload() {
        // Load Tiny Swords sprite sheets
        const basePath = 'assets';
        
        // Player sprites (based on class)
        const heroClass = gameData.data.hero.class;
        const classSprites = {
            'tank': `${basePath}/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png`,
            'assassin': `${basePath}/Factions/Knights/Troops/Pawn/Red/Pawn_Red.png`,
            'mage': `${basePath}/Factions/Knights/Troops/Warrior/Purple/Warrior_Purple.png`
        };
        
        // Load as sprite sheets (each frame is 192x192 in a grid)
        this.load.spritesheet('player', classSprites[heroClass], { frameWidth: 192, frameHeight: 192 });
        
        // Allied units
        this.load.spritesheet('knight', `${basePath}/Factions/Knights/Troops/Warrior/Red/Warrior_Red.png`, { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('archer', `${basePath}/Factions/Knights/Troops/Archer/Red/Archer_Red.png`, { frameWidth: 192, frameHeight: 192 });
        
        // Enemies - using Goblins faction
        this.load.spritesheet('goblin', `${basePath}/Factions/Goblins/Troops/Torch/Red/Torch_Red.png`, { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('orc', `${basePath}/Factions/Goblins/Troops/TNT/Red/TNT_Red.png`, { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('troll', `${basePath}/Factions/Goblins/Troops/Barrel/Red/Barrel_Red.png`, { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('dragon', `${basePath}/Factions/Goblins/Troops/Torch/Purple/Torch_Purple.png`, { frameWidth: 192, frameHeight: 192 });
        
        // Powerups (these might be single images)
        this.load.image('powerup-speed', `${basePath}/UI/Icons/Regular_01.png`);
        this.load.image('powerup-damage', `${basePath}/UI/Icons/Regular_02.png`);
        this.load.image('powerup-heal', `${basePath}/UI/Icons/Regular_03.png`);
        
        // UI Assets - Buttons and Panels
        this.load.image('btn-blue', `${basePath}/UI/Buttons/Button_Blue.png`);
        this.load.image('btn-blue-hover', `${basePath}/UI/Buttons/Button_Hover.png`);
        this.load.image('btn-blue-pressed', `${basePath}/UI/Buttons/Button_Blue_Pressed.png`);
        this.load.image('btn-red', `${basePath}/UI/Buttons/Button_Red.png`);
        this.load.image('btn-red-pressed', `${basePath}/UI/Buttons/Button_Red_Pressed.png`);
        this.load.image('btn-disable', `${basePath}/UI/Buttons/Button_Disable.png`);
        
        // Banners and Panels
        this.load.image('banner-h', `${basePath}/UI/Banners/Banner_Horizontal.png`);
        this.load.image('banner-v', `${basePath}/UI/Banners/Banner_Vertical.png`);
        this.load.image('panel-carved', `${basePath}/UI/Banners/Carved_9Slides.png`);
        
        // Effects - Explosions and Fire
        this.load.spritesheet('explosion', `${basePath}/Effects/Explosion/Explosions.png`, 
            { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fire', `${basePath}/Effects/Fire/Fire.png`,
            { frameWidth: 16, frameHeight: 16 });
        
        // Buildings
        this.load.image('castle-sprite', `${basePath}/Factions/Knights/Buildings/Castle/Castle_Blue.png`);
        this.load.image('tower-sprite', `${basePath}/Factions/Knights/Buildings/Tower/Tower_Blue.png`);
        this.load.image('house-sprite', `${basePath}/Factions/Knights/Buildings/House/House_Blue.png`);
        
        // Decorations
        this.load.image('tree', `${basePath}/Resources/Trees/Tree.png`);
        
        // Dead sprite
        this.load.spritesheet('dead-sprite', `${basePath}/Factions/Knights/Troops/Dead/Dead.png`,
            { frameWidth: 192, frameHeight: 192 });
        
        // Arrow projectile
        this.load.image('arrow-sprite', `${basePath}/Factions/Knights/Troops/Archer/Arrow/Arrow.png`);
        
        // TERRAIN ASSETS - Complete environment!
        this.load.image('ground-tiles', `${basePath}/Terrain/Ground/Tilemap_Flat.png`);
        this.load.image('shadows', `${basePath}/Terrain/Ground/Shadows.png`);
        this.load.image('water', `${basePath}/Terrain/Water/Water.png`);
        this.load.spritesheet('foam', `${basePath}/Terrain/Water/Foam/Foam.png`, 
            { frameWidth: 32, frameHeight: 32 });
        
        // Water rocks
        this.load.image('rock1', `${basePath}/Terrain/Water/Rocks/Rocks_01.png`);
        this.load.image('rock2', `${basePath}/Terrain/Water/Rocks/Rocks_02.png`);
        this.load.image('rock3', `${basePath}/Terrain/Water/Rocks/Rocks_03.png`);
        this.load.image('rock4', `${basePath}/Terrain/Water/Rocks/Rocks_04.png`);
        
        // Bridge
        this.load.image('bridge', `${basePath}/Terrain/Bridge/Bridge_All.png`);
        
        // Decorations (all 18!)
        for (let i = 1; i <= 18; i++) {
            const num = i.toString().padStart(2, '0');
            this.load.image(`deco${i}`, `${basePath}/Deco/${num}.png`);
        }
        
        // Resources - Trees and ambient life
        this.load.image('tree', `${basePath}/Resources/Trees/Tree.png`);
        this.load.spritesheet('sheep', `${basePath}/Resources/Sheep/HappySheep_All.png`,
            { frameWidth: 44, frameHeight: 44 });
        
        // Resource piles (gold, metal, wood)
        this.load.image('gold-pile', `${basePath}/Resources/Resources/G_Idle.png`);
        this.load.image('metal-pile', `${basePath}/Resources/Resources/M_Idle.png`);
        this.load.image('wood-pile', `${basePath}/Resources/Resources/W_Idle.png`);
    }
    
    createAnimations() {
        console.log('🎨 Creating sprite animations...');
        
        const spriteTypes = ['player', 'knight', 'archer', 'goblin', 'orc', 'troll', 'dragon'];
        
        spriteTypes.forEach(type => {
            if (this.anims.exists(`${type}_idle`)) return;
            
            // Get actual frame count for this sprite
            const texture = this.textures.get(type);
            if (!texture) {
                console.warn(`Texture ${type} not found`);
                return;
            }
            
            const frameCount = texture.frameTotal - 1; // -1 because frames are 0-indexed
            
            // Determine frame ranges based on available frames
            let maxIdleFrame, maxWalkFrame, maxAttackFrame, walkStartFrame, attackStartFrame;
            
            if (frameCount < 12) {
                // Sprite has fewer frames (like archer or troll)
                maxIdleFrame = Math.min(3, frameCount);
                walkStartFrame = Math.min(4, frameCount);
                maxWalkFrame = Math.min(7, frameCount);
                attackStartFrame = Math.min(8, frameCount);
                maxAttackFrame = Math.min(11, frameCount);
            } else {
                // Sprite has full frame set
                maxIdleFrame = 5;
                walkStartFrame = 6;
                maxWalkFrame = 11;
                attackStartFrame = 12;
                maxAttackFrame = 17;
            }
            
            // Safety check - make sure we don't exceed available frames
            maxIdleFrame = Math.min(maxIdleFrame, frameCount);
            maxWalkFrame = Math.min(maxWalkFrame, frameCount);
            maxAttackFrame = Math.min(maxAttackFrame, frameCount);
            
            // IDLE
            this.anims.create({
                key: `${type}_idle`,
                frames: this.anims.generateFrameNumbers(type, { start: 0, end: maxIdleFrame }),
                frameRate: 8,
                repeat: -1
            });
            
            // WALK - only if we have enough frames
            if (walkStartFrame <= frameCount && maxWalkFrame > walkStartFrame) {
                this.anims.create({
                    key: `${type}_walk`,
                    frames: this.anims.generateFrameNumbers(type, { start: walkStartFrame, end: maxWalkFrame }),
                    frameRate: 12,
                    repeat: -1
                });
            } else {
                // Fallback to idle if not enough frames
                this.anims.create({
                    key: `${type}_walk`,
                    frames: this.anims.generateFrameNumbers(type, { start: 0, end: maxIdleFrame }),
                    frameRate: 10,
                    repeat: -1
                });
            }
            
            // ATTACK - only if we have enough frames
            if (attackStartFrame <= frameCount && maxAttackFrame > attackStartFrame) {
                this.anims.create({
                    key: `${type}_attack`,
                    frames: this.anims.generateFrameNumbers(type, { start: attackStartFrame, end: maxAttackFrame }),
                    frameRate: 15,
                    repeat: 0
                });
            } else {
                // Fallback to idle if not enough frames
                this.anims.create({
                    key: `${type}_attack`,
                    frames: this.anims.generateFrameNumbers(type, { start: 0, end: maxIdleFrame }),
                    frameRate: 12,
                    repeat: 0
                });
            }
            
            console.log(`  ✓ ${type}: ${frameCount + 1} frames available`);
        });
        
        // EXPLOSION animation
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 7 }),
            frameRate: 16,
            repeat: 0
        });
        
        // FIRE animation  
        this.anims.create({
            key: 'burn',
            frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 5 }),
            frameRate: 12,
            repeat: -1
        });
        
        // FOAM animation (water)
        this.anims.create({
            key: 'foam-wave',
            frames: this.anims.generateFrameNumbers('foam', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });
        
        // SHEEP animation (ambient life)
        this.anims.create({
            key: 'sheep-idle',
            frames: this.anims.generateFrameNumbers('sheep', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        
        this.anims.create({
            key: 'sheep-bounce',
            frames: this.anims.generateFrameNumbers('sheep', { start: 4, end: 9 }),
            frameRate: 10,
            repeat: -1
        });
        
        console.log('✅ Animations created!');
    }
    
    updateSpriteAnimation(sprite, isMoving, isAttacking) {
        if (!sprite || !sprite.active) return;
        
        const spriteKey = sprite.texture.key;
        
        // Safety check - make sure animations exist
        if (!this.anims.exists(`${spriteKey}_idle`)) {
            console.warn(`Animation ${spriteKey}_idle not found`);
            return;
        }
        
        if (isAttacking) {
            if (this.anims.exists(`${spriteKey}_attack`) && 
                (!sprite.anims.currentAnim || sprite.anims.currentAnim.key !== `${spriteKey}_attack`)) {
                sprite.play(`${spriteKey}_attack`);
                
                sprite.once('animationcomplete', () => {
                    if (sprite && sprite.active) {
                        const velocity = sprite.body ? sprite.body.velocity : null;
                        const moving = velocity && (Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10);
                        
                        if (moving && this.anims.exists(`${spriteKey}_walk`)) {
                            sprite.play(`${spriteKey}_walk`);
                        } else if (this.anims.exists(`${spriteKey}_idle`)) {
                            sprite.play(`${spriteKey}_idle`);
                        }
                    }
                });
            }
        } else if (isMoving) {
            if (this.anims.exists(`${spriteKey}_walk`) && 
                (!sprite.anims.currentAnim || sprite.anims.currentAnim.key !== `${spriteKey}_walk`)) {
                sprite.play(`${spriteKey}_walk`);
            }
        } else {
            if (!sprite.anims.currentAnim || sprite.anims.currentAnim.key !== `${spriteKey}_idle`) {
                sprite.play(`${spriteKey}_idle`);
            }
        }
    }
    
    createParticleSystems() {
        console.log('✨ Creating particle systems...');
        
        // Phaser 3.70 uses new particle system API
        // Blood particles (red)
        this.bloodEmitter = this.add.particles(0, 0, 'blood', {
            speed: { min: 100, max: 300 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            gravityY: 300,
            emitting: false
        });
        
        // Impact particles (yellow/orange for attacks)
        this.impactEmitter = this.add.particles(0, 0, 'blood', {
            speed: { min: 150, max: 250 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 400,
            tint: 0xffaa00,
            emitting: false
        });
        
        // Gold particles for powerups
        this.goldEmitter = this.add.particles(0, 0, 'blood', {
            speed: { min: 50, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            gravityY: -100,
            tint: 0xffd700,
            emitting: false
        });
        
        console.log('✅ Particle systems ready!');
    }
    
    screenShake(intensity = 0.01, duration = 200) {
        this.cameras.main.shake(duration, intensity);
    }
    
    screenFlash(color = 0xffffff, alpha = 0.5, duration = 100) {
        this.cameras.main.flash(duration, 
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff,
            false,
            null,
            alpha
        );
    }
    
    emitBlood(x, y, amount = 10) {
        this.bloodEmitter.explode(amount, x, y);
    }
    
    emitImpact(x, y, amount = 5) {
        this.impactEmitter.explode(amount, x, y);
    }
    
    emitGold(x, y, amount = 15) {
        this.goldEmitter.explode(amount, x, y);
    }
    
    showDamageText(x, y, damage, isCrit = false) {
        const color = isCrit ? '#ff0000' : '#ffaa00';
        const fontSize = isCrit ? '32px' : '24px';
        const text = isCrit ? `${damage}!` : `${damage}`;
        
        const damageText = this.add.text(x, y, text, {
            fontSize: fontSize,
            color: color,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 50,
            alpha: 0,
            scale: isCrit ? 1.5 : 1.2,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => damageText.destroy()
        });
    }
    
    energyRing(x, y, color = 0x00ffff, maxRadius = 150) {
        const ring1 = this.add.circle(x, y, 20, color, 0.6);
        const ring2 = this.add.circle(x, y, 15, color, 0.8);
        
        this.tweens.add({
            targets: ring1,
            radius: maxRadius,
            alpha: 0,
            duration: 500,
            ease: 'Cubic.easeOut',
            onComplete: () => ring1.destroy()
        });
        
        this.tweens.add({
            targets: ring2,
            radius: maxRadius * 0.8,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.easeOut',
            onComplete: () => ring2.destroy()
        });
    }
    
    shockwave(x, y, color = 0xffffff, maxRadius = 300) {
        const wave = this.add.circle(x, y, 10, color, 0);
        wave.setStrokeStyle(4, color, 1);
        
        this.tweens.add({
            targets: wave,
            radius: maxRadius,
            alpha: 0,
            duration: 600,
            ease: 'Cubic.easeOut',
            onComplete: () => wave.destroy()
        });
    }
    
    levelUpEffect(x, y) {
        const colors = [0xff0000, 0xff6600, 0xffaa00, 0xffd700, 0xffff00];
        
        colors.forEach((color, index) => {
            this.time.delayedCall(index * 50, () => {
                this.energyRing(x, y, color, 200);
            });
        });
        
        this.goldEmitter.explode(50, x, y);
    }
    
    deathExplosion(x, y, isBoss = false) {
        const flashColor = isBoss ? 0xff0000 : 0xff6600;
        
        // Use actual explosion sprite!
        const explosionSprite = this.add.sprite(x, y, 'explosion');
        explosionSprite.setScale(isBoss ? 3 : 2);
        explosionSprite.play('explode');
        explosionSprite.once('animationcomplete', () => {
            explosionSprite.destroy();
        });
        
        // Still add some blood particles for extra juice
        this.emitBlood(x, y, isBoss ? 20 : 10);
        this.shockwave(x, y, flashColor, isBoss ? 400 : 200);
    }
    
    powerupCollectionEffect(x, y, type) {
        const colors = {
            speed: 0x00ffff,
            damage: 0xff0000,
            heal: 0x00ff00
        };
        
        const color = colors[type] || 0xffd700;
        
        this.energyRing(x, y, color, 100);
        this.emitGold(x, y, 20);
    }
    
    create() {
        console.log('Ã°Å¸Å½Â® Battle Scene Started - FULL VERSION');
        
        // Create all animations first
        this.createAnimations();
        
        // Create particle systems for juicy effects
        this.createParticleSystems();
        
        // Initialize core variables (from original)
        this.levelConfig = gameData.getCurrentLevelConfig();
        this.currentWave = 0;
        this.enemiesAlive = 0;
        this.totalKills = 0;
        this.goldEarned = 0;
        this.timeRemaining = GameConfig.game.levelDuration;
        this.isLevelComplete = false;
        
        // Original game variables
        this.kills = 0;
        this.nextAllyAt = 3; // Spawn ally every 3 kills!
        
        // Hero stats (from GameData)
        this.heroStats = {
            level: gameData.data.hero.level,
            xp: gameData.data.hero.xp || 0,
            xpToNext: gameData.data.hero.xpToNext || 100,
            maxHp: gameData.data.hero.maxHp,
            hp: gameData.data.hero.maxHp,
            damage: gameData.data.hero.damage,
            speed: gameData.data.hero.speed,
            range: gameData.data.hero.range
        };
        
        // Abilities
        this.abilities = {
            dash: { cooldown: GameConfig.abilities.dash.cooldown, lastUsed: 0 },
            aoe: { cooldown: GameConfig.abilities.aoe.cooldown, lastUsed: 0 }
        };
        
        // World setup
        const WORLD_WIDTH = GameConfig.world.width;
        const WORLD_HEIGHT = GameConfig.world.height;
        
        this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        this.cameras.main.setZoom(0.7);
        
        // Background - neutral to let ground tiles show
        this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, 0x5a7c3e);
        
        // Create textures
        this.createAllTextures();
        
        // Create castle
        this.createCastle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        
        // Add environment decorations
        this.createEnvironment(WORLD_WIDTH, WORLD_HEIGHT);
        
        // Create player
        this.createPlayer(WORLD_WIDTH / 2 - 100, WORLD_HEIGHT / 2);
        
        // Create groups
        this.allies = this.physics.add.group();
        this.mobs = this.physics.add.group();
        this.powerups = this.physics.add.group();
        this.bosses = this.physics.add.group();
        
        // Spawn initial army
        this.spawnInitialArmy();
        
        // UI - Original style!
        this.createOriginalUI();
        
        // Input
        this.pointer = this.input.activePointer;
        this.setupAbilities();
        
        // Start waves
        this.time.delayedCall(3000, () => this.spawnWave());
        
        // Spawn powerups
        this.time.addEvent({
            delay: 10000,
            callback: () => this.spawnPowerup(),
            loop: true
        });
        
        // Spawn initial powerups
        for (let i = 0; i < 5; i++) {
            this.spawnPowerup();
        }
        
        // Show and initialize Hero HUD
        this.showHeroHUD();
    }
    
    showHeroHUD() {
        const hud = document.getElementById('hero-hud');
        if (!hud) return;
        
        hud.style.display = 'block';
        
        // Set hero icon and class
        const heroClass = gameData.data.hero.class;
        const classConfig = GameConfig.classes[heroClass];
        
        document.getElementById('hero-icon').textContent = classConfig.icon;
        document.getElementById('hero-class').textContent = classConfig.name.toUpperCase();
        document.getElementById('hero-level').textContent = `Level ${this.heroStats.level}`;
        
        // Set initial stats
        this.updateHeroHUD();
    }
    
    updateHeroHUD() {
        // Update HP
        document.getElementById('hp-text').textContent = `${Math.round(this.heroStats.hp)}/${this.heroStats.maxHp}`;
        document.getElementById('hp-bar').style.width = `${(this.heroStats.hp / this.heroStats.maxHp) * 100}%`;
        
        // Update XP
        document.getElementById('xp-text').textContent = `${this.heroStats.xp}/${this.heroStats.xpToNext}`;
        document.getElementById('xp-bar').style.width = `${(this.heroStats.xp / this.heroStats.xpToNext) * 100}%`;
        
        // Update level
        document.getElementById('hero-level').textContent = `Level ${this.heroStats.level}`;
        
        // Update stats
        document.getElementById('stat-damage').textContent = this.heroStats.damage;
        document.getElementById('stat-speed').textContent = this.heroStats.speed;
        document.getElementById('stat-range').textContent = this.heroStats.range;
        document.getElementById('stat-army').textContent = this.allies ? this.allies.children.entries.length + 1 : 1;
    }
    
    startAbilityCooldown(key, cooldownMs) {
        const ability = document.querySelector(`.ability[data-key="${key}"]`);
        if (!ability) return;
        
        const cooldownDiv = ability.querySelector('.ability-cooldown');
        let remaining = Math.ceil(cooldownMs / 1000);
        
        cooldownDiv.textContent = remaining;
        cooldownDiv.classList.add('active');
        
        const interval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                clearInterval(interval);
                cooldownDiv.classList.remove('active');
            } else {
                cooldownDiv.textContent = remaining;
            }
        }, 1000);
    }
    createAllTextures() {
        // SVG icons are already loaded via preload()
        // Just create the projectile graphics
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
        // Use actual castle sprite instead of emoji!
        this.castleSprite = this.add.image(x, y, 'castle-sprite');
        this.castleSprite.setScale(2);
        
        this.castle = { x: x, y: y, hp: 1000, maxHp: 1000 };
        
        // Add protective circle
        this.add.circle(x, y, 250, 0xffd700, 0.05)
            .setStrokeStyle(2, 0xffd700, 0.2);
    }
    
    createEnvironment(worldWidth, worldHeight) {
        const centerX = worldWidth / 2;
        const centerY = worldHeight / 2;
        const castleSafeZone = 500; // Keep area around castle clear
        
        console.log('🌍 Creating beautiful terrain...');
        
        // 1. GROUND TILES - Create tiled ground texture
        this.createGroundTiles(worldWidth, worldHeight);
        
        // 2. WATER MOAT - Around the castle (but with gaps)
        this.createWaterMoat(centerX, centerY);
        
        // 3. TREES - Dense forest around edges
        this.createTrees(worldWidth, worldHeight, centerX, centerY, castleSafeZone);
        
        // 4. ROCKS - Near water and scattered
        this.createRocks(worldWidth, worldHeight, centerX, centerY, castleSafeZone);
        
        // 5. DECORATIONS - All 18 deco sprites scattered
        this.createDecorations(worldWidth, worldHeight, centerX, centerY, castleSafeZone);
        
        // 6. RESOURCE PILES - Gold, metal, wood
        this.createResourcePiles(worldWidth, worldHeight, centerX, centerY, castleSafeZone);
        
        // 7. SHEEP - Ambient life
        this.createSheep(worldWidth, worldHeight, centerX, centerY, castleSafeZone);
        
        console.log('✅ Terrain created!');
    }
    
    createGroundTiles(worldWidth, worldHeight) {
        // Create repeating ground texture using TileSprite for better performance
        if (this.textures.exists('ground-tiles')) {
            const ground = this.add.tileSprite(0, 0, worldWidth, worldHeight, 'ground-tiles');
            ground.setOrigin(0, 0);
            ground.setDepth(-100);
            ground.setAlpha(0.9);
            console.log('✅ Ground tiles loaded');
        } else {
            console.warn('⚠️ Ground tiles not found, using pattern');
            // Checkered ground pattern as fallback
            const tileSize = 128;
            for (let x = 0; x < worldWidth; x += tileSize) {
                for (let y = 0; y < worldHeight; y += tileSize) {
                    const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
                    const color = isEven ? 0x6b8e3d : 0x5a7c3e;
                    const rect = this.add.rectangle(x + tileSize/2, y + tileSize/2, tileSize, tileSize, color);
                    rect.setDepth(-100);
                }
            }
        }
    }
    
    createWaterMoat(centerX, centerY) {
        // Create water moat around castle in a circle (but not complete)
        const moatRadius = 350;
        const waterTiles = [];
        
        // Create water patches around castle
        const waterSections = [
            { startAngle: 0, endAngle: 60 },      // Top right
            { startAngle: 90, endAngle: 150 },    // Right
            { startAngle: 180, endAngle: 240 },   // Bottom
            { startAngle: 270, endAngle: 330 }    // Left
        ];
        
        waterSections.forEach(section => {
            for (let angle = section.startAngle; angle < section.endAngle; angle += 15) {
                const rad = (angle * Math.PI) / 180;
                const x = centerX + Math.cos(rad) * moatRadius;
                const y = centerY + Math.sin(rad) * moatRadius;
                
                // Add water tile
                const water = this.add.image(x, y, 'water');
                water.setScale(2);
                water.setDepth(-50);
                water.setAlpha(0.7);
                waterTiles.push(water);
                
                // Add animated foam
                if (Math.random() < 0.3) {
                    const foam = this.add.sprite(x + Phaser.Math.Between(-20, 20), 
                                                  y + Phaser.Math.Between(-20, 20), 
                                                  'foam');
                    foam.setScale(1.5);
                    foam.setDepth(-49);
                    foam.play('foam-wave');
                }
            }
        });
        
        console.log(`  💧 Created water moat with ${waterTiles.length} tiles`);
    }
    
    createTrees(worldWidth, worldHeight, centerX, centerY, safeZone) {
        const numTrees = 60;
        let treesPlaced = 0;
        
        for (let i = 0; i < numTrees; i++) {
            let x = Phaser.Math.Between(100, worldWidth - 100);
            let y = Phaser.Math.Between(100, worldHeight - 100);
            
            const distToCenter = Phaser.Math.Distance.Between(x, y, centerX, centerY);
            
            // Only place if outside safe zone
            if (distToCenter > safeZone) {
                if (this.textures.exists('tree')) {
                    const tree = this.add.image(x, y, 'tree');
                    tree.setScale(Phaser.Math.FloatBetween(1.2, 2.0));
                    tree.setDepth(y);
                } else {
                    // Fallback tree visualization
                    const tree = this.add.circle(x, y, 30, 0x2d7010);
                    tree.setDepth(y);
                    const trunk = this.add.rectangle(x, y + 20, 12, 25, 0x4a3020);
                    trunk.setDepth(y);
                }
                treesPlaced++;
            }
        }
        
        console.log(`  🌳 Placed ${treesPlaced} trees`);
    }
    
    createRocks(worldWidth, worldHeight, centerX, centerY, safeZone) {
        const numRocks = 30;
        let rocksPlaced = 0;
        
        for (let i = 0; i < numRocks; i++) {
            let x = Phaser.Math.Between(50, worldWidth - 50);
            let y = Phaser.Math.Between(50, worldHeight - 50);
            
            const distToCenter = Phaser.Math.Distance.Between(x, y, centerX, centerY);
            
            if (distToCenter > safeZone) {
                const rockType = Phaser.Math.Between(1, 4);
                if (this.textures.exists(`rock${rockType}`)) {
                    const rock = this.add.image(x, y, `rock${rockType}`);
                    rock.setScale(Phaser.Math.FloatBetween(1.0, 1.8));
                    rock.setDepth(y - 100);
                } else {
                    // Fallback rocks
                    const rock = this.add.circle(x, y, Phaser.Math.Between(15, 25), 0x6b6b6b);
                    rock.setDepth(y - 100);
                }
                rocksPlaced++;
            }
        }
        
        console.log(`  🪨 Placed ${rocksPlaced} rocks`);
    }
    
    createDecorations(worldWidth, worldHeight, centerX, centerY, safeZone) {
        const numDecos = 40; // Use ALL 18 deco types!
        let decosPlaced = 0;
        
        for (let i = 0; i < numDecos; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Phaser.Math.Between(100, worldWidth - 100);
                y = Phaser.Math.Between(100, worldHeight - 100);
                attempts++;
            } while (
                (Phaser.Math.Distance.Between(x, y, centerX, centerY) < safeZone) &&
                attempts < 10
            );
            
            if (attempts < 10) {
                const decoType = Phaser.Math.Between(1, 18);
                if (this.textures.exists(`deco${decoType}`)) {
                    const deco = this.add.image(x, y, `deco${decoType}`);
                    deco.setScale(Phaser.Math.FloatBetween(0.8, 1.3));
                    deco.setDepth(-8);
                } else {
                    // Fallback decorations - colorful shapes
                    const colors = [0xffaa00, 0xff6b6b, 0x4dabf7, 0xa78bfa, 0x00ff88];
                    const shapes = ['circle', 'triangle', 'square'];
                    const shape = shapes[decoType % 3];
                    const size = Phaser.Math.Between(10, 20);
                    const color = colors[decoType % colors.length];
                    
                    if (shape === 'circle') {
                        const obj = this.add.circle(x, y, size, color);
                        obj.setDepth(-8);
                    } else {
                        const obj = this.add.rectangle(x, y, size * 2, size * 2, color);
                        obj.setDepth(-8);
                    }
                }
                decosPlaced++;
            }
        }
        
        console.log(`  🎨 Placed ${decosPlaced} decorations`);
    }
    
    createResourcePiles(worldWidth, worldHeight, centerX, centerY, safeZone) {
        // Add some resource piles (gold, metal, wood) scattered around
        const resources = [
            { type: 'gold-pile', count: 8 },
            { type: 'metal-pile', count: 6 },
            { type: 'wood-pile', count: 6 }
        ];
        
        let totalPlaced = 0;
        
        resources.forEach(resource => {
            for (let i = 0; i < resource.count; i++) {
                let x, y;
                let attempts = 0;
                
                do {
                    x = Phaser.Math.Between(200, worldWidth - 200);
                    y = Phaser.Math.Between(200, worldHeight - 200);
                    attempts++;
                } while (
                    (Phaser.Math.Distance.Between(x, y, centerX, centerY) < safeZone) &&
                    attempts < 10
                );
                
                if (attempts < 10) {
                    const pile = this.add.image(x, y, resource.type);
                    pile.setScale(1.2);
                    pile.setDepth(-6);
                    
                    // Add glow for gold
                    if (resource.type === 'gold-pile') {
                        const glow = this.add.circle(x, y, 20, 0xffd700, 0.2);
                        glow.setDepth(-7);
                    }
                    
                    totalPlaced++;
                }
            }
        });
        
        console.log(`  💎 Placed ${totalPlaced} resource piles`);
    }
    
    createSheep(worldWidth, worldHeight, centerX, centerY, safeZone) {
        const numSheep = 12;
        let sheepPlaced = 0;
        
        for (let i = 0; i < numSheep; i++) {
            let x, y;
            let attempts = 0;
            
            do {
                x = Phaser.Math.Between(200, worldWidth - 200);
                y = Phaser.Math.Between(200, worldHeight - 200);
                attempts++;
            } while (
                (Phaser.Math.Distance.Between(x, y, centerX, centerY) < safeZone) &&
                attempts < 10
            );
            
            if (attempts < 10) {
                const sheep = this.add.sprite(x, y, 'sheep');
                sheep.setScale(1.5);
                sheep.setDepth(-7);
                
                // Random animation
                const anim = Math.random() < 0.7 ? 'sheep-idle' : 'sheep-bounce';
                sheep.play(anim);
                
                // Make sheep wander occasionally
                this.time.addEvent({
                    delay: Phaser.Math.Between(3000, 8000),
                    callback: () => {
                        if (sheep && sheep.active) {
                            // Small random movement
                            this.tweens.add({
                                targets: sheep,
                                x: sheep.x + Phaser.Math.Between(-50, 50),
                                y: sheep.y + Phaser.Math.Between(-50, 50),
                                duration: 2000,
                                ease: 'Sine.easeInOut'
                            });
                        }
                    },
                    loop: true
                });
                
                sheepPlaced++;
            }
        }
        
        console.log(`  🐑 Placed ${sheepPlaced} sheep`);
    }
    
    createPlayer(x, y) {
        this.player = this.physics.add.sprite(x, y, 'player', 0);
        this.player.setScale(0.7);
        this.player.setData('hp', this.heroStats.hp);
        this.player.setData('maxHp', this.heroStats.maxHp);
        this.player.setData('damage', this.heroStats.damage);
        this.player.setData('attackRange', this.heroStats.range);
        this.player.setData('attackSpeed', 500);
        this.player.setData('lastAttack', 0);
        this.player.setData('team', 'blue');
        this.player.setData('isPlayer', true);
        
        // Start with idle animation
        this.player.play('player_idle');
        
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
    
    spawnInitialArmy() {
        const knights = gameData.data.army.knights || 0;
        const archers = gameData.data.army.archers || 0;
        
        for (let i = 0; i < knights; i++) {
            const angle = (Math.PI * 2 * i) / Math.max(1, knights);
            const dist = 80 + Math.random() * 30;
            this.spawnAlly('knight', this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist);
        }
        
        for (let i = 0; i < archers; i++) {
            const angle = (Math.PI * 2 * i) / Math.max(1, archers);
            const dist = 120 + Math.random() * 30;
            this.spawnAlly('archer', this.player.x + Math.cos(angle) * dist, this.player.y + Math.sin(angle) * dist);
        }
    }
    
    spawnAlly(type, x, y) {
        if (this.allies.children.entries.length >= 100) return;
        
        const config = GameConfig.units[type || 'knight'];
        const isArcher = type === 'archer' || Math.random() < 0.4;
        const texture = isArcher ? 'archer' : 'knight';
        
        const ally = this.allies.create(
            x || this.player.x + (Math.random() - 0.5) * 100,
            y || this.player.y + (Math.random() - 0.5) * 100,
            texture
        );
        
        ally.setFrame(0);
        ally.setScale(0.6);
        ally.setData('team', 'blue');
        ally.setData('isArcher', isArcher);
        
        if (isArcher) {
            ally.setData('hp', 5);
            ally.setData('maxHp', 5);
            ally.setData('damage', 2.5);
            ally.setData('attackRange', 160);
            ally.setData('attackSpeed', 850);
        } else {
            ally.setData('hp', 10);
            ally.setData('maxHp', 10);
            ally.setData('damage', 5);
            ally.setData('attackRange', 75);
            ally.setData('attackSpeed', 550);
        }
        
        ally.setData('lastAttack', 0);
        
        // Start with idle animation
        ally.play(`${texture}_idle`);
        
        // Spawn animation
        ally.setScale(0);
        ally.setAlpha(0);
        this.tweens.add({
            targets: ally,
            scale: 1,
            alpha: 1,
            duration: 400,
            ease: 'Back.easeOut'
        });
        
        // Flash effect
        const flash = this.add.circle(ally.x, ally.y, 50, 0xffaa00, 0.6);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scale: 2,
            duration: 400,
            onComplete: () => flash.destroy()
        });
        
        // Update army text
        if (this.armyText) {
            this.armyText.setText(`Army: ${this.allies.children.entries.length + 1}`);
        }
        
        // Update HUD
        this.updateHeroHUD();
    }
    
    createOriginalUI() {
        const { width, height } = this.cameras.main;
        
        // Top left - kills, gold, wave
        this.killText = this.add.text(20, 20, `Kills: 0`, {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setScrollFactor(0).setDepth(2000);
        
        this.armyText = this.add.text(20, 65, `Army: 1`, {
            fontSize: '28px',
            color: '#ffaa00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(2000);
        
        this.waveText = this.add.text(20, 105, `Wave: 0/${this.levelConfig.waves}`, {
            fontSize: '24px',
            color: '#00ffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0).setDepth(2000);
        
        // Top center - timer
        this.timeText = this.add.text(width / 2, 20, '', {
            fontSize: '28px',
            color: '#ffaa00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(2000);
        
        // Top right - castle HP
        this.castleHPText = this.add.text(width - 20, 20, 'Castle: 1000/1000', {
            fontSize: '24px',
            color: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(2000);
        
        // Bottom center - legend
        this.add.text(width / 2, height - 25, 'Ã°Å¸Å½Â® Click to Move | Q - Dash | E - AOE Attack', {
            fontSize: '18px',
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    }
    
    spawnWave() {
        if (this.isLevelComplete) return;
        
        this.currentWave++;
        
        if (this.currentWave > this.levelConfig.waves) return;
        
        console.log(`Ã°Å¸Å’Å  Wave ${this.currentWave}/${this.levelConfig.waves}`);
        this.waveText.setText(`Wave: ${this.currentWave}/${this.levelConfig.waves}`);
        
        const enemyTypes = this.levelConfig.enemyTypes;
        const count = this.levelConfig.enemiesPerWave;
        
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 300, () => {
                const type = Phaser.Utils.Array.GetRandom(enemyTypes);
                this.spawnMob(type);
            });
        }
        
        if (this.levelConfig.bossWave && this.currentWave === this.levelConfig.waves) {
            const bossCount = this.levelConfig.bossCount || 1;
            for (let i = 0; i < bossCount; i++) {
                this.time.delayedCall(4000 + (i * 2000), () => {
                    this.spawnBoss();
                });
            }
        }
        
        if (this.currentWave < this.levelConfig.waves) {
            this.time.delayedCall(GameConfig.game.waveInterval, () => this.spawnWave());
        }
    }
    
    spawnMob(type) {
        const config = GameConfig.enemies[type];
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        
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
        mob.setFrame(0);
        mob.setScale(1.0);
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
        
        // Start with idle animation
        mob.play(`${type}_idle`);
        
        this.enemiesAlive++;
    }
    
    spawnBoss() {
        const config = GameConfig.enemies.dragon;
        const WORLD_WIDTH = this.physics.world.bounds.width;
        const WORLD_HEIGHT = this.physics.world.bounds.height;
        
        const side = Math.floor(Math.random() * 4);
        let x, y;
        switch(side) {
            case 0: x = Math.random() * WORLD_WIDTH; y = 50; break;
            case 1: x = WORLD_WIDTH - 50; y = Math.random() * WORLD_HEIGHT; break;
            case 2: x = Math.random() * WORLD_WIDTH; y = WORLD_HEIGHT - 50; break;
            case 3: x = 50; y = Math.random() * WORLD_HEIGHT; break;
        }
        
        const boss = this.bosses.create(x, y, 'dragon');
        boss.setFrame(0);
        boss.setScale(0.8);
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
        
        // Start with idle animation
        boss.play('dragon_idle');
        
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
        powerup.setScale(1.0);
        
        this.tweens.add({
            targets: powerup,
            y: powerup.y - 10,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    setupAbilities() {
        this.input.keyboard.on('keydown-Q', () => this.useDash());
        this.input.keyboard.on('keydown-E', () => this.useAOE());
    }
    
    useDash() {
        if (!this.player || !this.player.active) return;
        
        const now = Date.now();
        if (now - this.abilities.dash.lastUsed < this.abilities.dash.cooldown) return;
        
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
        
        // Cool effects!
        this.energyRing(this.player.x, this.player.y, 0x00ffff, 80);
        
        const trail = this.add.circle(this.player.x, this.player.y, 40, 0xffd700, 0.5);
        this.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 2,
            duration: 300,
            onComplete: () => trail.destroy()
        });
        
        // Show cooldown in HUD
        this.startAbilityCooldown('Q', this.abilities.dash.cooldown);
    }
    
    useAOE() {
        if (!this.player || !this.player.active) return;
        
        const now = Date.now();
        if (now - this.abilities.aoe.lastUsed < this.abilities.aoe.cooldown) return;
        
        this.abilities.aoe.lastUsed = now;
        
        const range = GameConfig.abilities.aoe.range;
        const damage = this.heroStats.damage * 2;
        
        // EPIC AOE EFFECTS!
        this.shockwave(this.player.x, this.player.y, 0xff0000, range);
        this.emitBlood(this.player.x, this.player.y, 30);
        
        const aoeCircle = this.add.circle(this.player.x, this.player.y, range, 0xff0000, 0.3);
        this.tweens.add({
            targets: aoeCircle,
            alpha: 0,
            scale: 1.3,
            duration: 500,
            onComplete: () => aoeCircle.destroy()
        });
        
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
        
        // Show cooldown in HUD
        this.startAbilityCooldown('E', this.abilities.aoe.cooldown);
    }
    
    gainXP(amount) {
        this.heroStats.xp += amount;
        
        while (this.heroStats.xp >= this.heroStats.xpToNext) {
            this.heroStats.xp -= this.heroStats.xpToNext;
            this.heroStats.level++;
            this.heroStats.xpToNext = Math.floor(this.heroStats.xpToNext * 1.5);
            
            this.heroStats.maxHp += 10;
            this.heroStats.hp = this.heroStats.maxHp;
            this.heroStats.damage += 2;
            this.heroStats.range += 2;
            
            if (this.player && this.player.active) {
                const levelUpText = this.add.text(this.player.x, this.player.y - 50, 'Ã¢Â¬â€ Ã¯Â¸Â LEVEL UP!', {
                    fontSize: '32px',
                    color: '#ffd700',
                    fontStyle: 'bold',
                    stroke: '#000000',
                    strokeThickness: 6
                }).setOrigin(0.5);
                
                this.tweens.add({
                    targets: levelUpText,
                    y: this.player.y - 100,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => levelUpText.destroy()
                });
            }
            
            this.player.setData('damage', this.heroStats.damage);
            this.player.setData('attackRange', this.heroStats.range);
        }
        
        // Update HUD
        this.updateHeroHUD();
    }
    
    update(time, delta) {
        if (this.isLevelComplete) return;
        
        // Timer
        this.timeRemaining -= delta;
        const seconds = Math.max(0, Math.floor(this.timeRemaining / 1000));
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        this.timeText.setText(`Ã¢ÂÂ±Ã¯Â¸Â ${minutes}:${secs.toString().padStart(2, '0')}`);
        
        // Victory
        if (this.timeRemaining <= 0 || (this.currentWave >= this.levelConfig.waves && this.enemiesAlive === 0)) {
            this.levelComplete(true);
            return;
        }
        
        // Defeat
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
        this.updateBossesAI();
        
        // Combat
        this.updateCombat(time);
        
        // Powerups
        this.updatePowerups();
        
        // Health bars
        this.renderHealthBars();
        
        // Camera zoom
        this.updateCameraZoom();
        
        // Update UI
        this.castleHPText.setText(`Castle: ${Math.round(this.castle.hp)}/${this.castle.maxHp}`);
        
        // Update animations based on movement
        this.updatePlayerAnimation();
        this.updateAlliesAnimations();
        this.updateEnemiesAnimations();
    }
    
    updatePlayerMovement() {
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.pointer.worldX, this.pointer.worldY
        );
        
        const speed = this.heroStats.speed;
        
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
        
        // Knights front
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
        
        // Archers back
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
            
            const angle = Phaser.Math.Angle.Between(mob.x, mob.y, this.castle.x, this.castle.y);
            const speed = mob.getData('speed');
            mob.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        });
    }
    
    updateBossesAI() {
        this.bosses.children.entries.forEach(boss => {
            if (!boss || !boss.active) return;
            
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
        this.autoAttack(this.player, time);
        
        this.allies.children.entries.forEach(ally => {
            if (ally.active) this.autoAttack(ally, time);
        });
        
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
            
            // Trigger attack animation
            attacker.setData('isAttacking', true);
            
            if (isArcher) {
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
        
        const distToCastle = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.castle.x, this.castle.y);
        if (distToCastle < range) {
            enemy.setData('lastAttack', time);
            enemy.setData('isAttacking', true);
            this.castle.hp = Math.max(0, this.castle.hp - damage);
            return;
        }
        
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < range) {
            enemy.setData('lastAttack', time);
            enemy.setData('isAttacking', true);
            const hp = this.player.getData('hp') - damage;
            this.player.setData('hp', Math.max(0, hp));
            return;
        }
        
        this.allies.children.entries.forEach(ally => {
            if (!ally.active) return;
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, ally.x, ally.y);
            if (dist < range) {
                enemy.setData('lastAttack', time);
                enemy.setData('isAttacking', true);
                const hp = ally.getData('hp') - damage;
                ally.setData('hp', Math.max(0, hp));
                if (hp <= 0) {
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
                    this.armyText.setText(`Army: ${this.allies.children.entries.length + 1}`);
                }
            }
        });
    }
    
    damageMob(mob, damage) {
        const hp = mob.getData('hp') - damage;
        mob.setData('hp', hp);
        
        // Critical hit chance (10%)
        const isCrit = Math.random() < 0.1;
        const actualDamage = isCrit ? damage * 2 : damage;
        
        // Hit flash
        mob.setTint(0xffffff);
        this.time.delayedCall(80, () => {
            if (mob && mob.active) mob.clearTint();
        });
        
        // Blood particles (use new particle system)
        this.emitBlood(mob.x, mob.y, 8);
        
        // Impact effect
        this.emitImpact(mob.x, mob.y, 3);
        
        // Damage text
        this.showDamageText(mob.x, mob.y - 20, Math.round(actualDamage), isCrit);
        
        if (hp <= 0) {
            this.killMob(mob);
        }
    }
    
    damageBoss(boss, damage) {
        const hp = boss.getData('hp') - damage;
        boss.setData('hp', hp);
        
        // Boss hits always feel BIG
        boss.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (boss && boss.active) boss.clearTint();
        });
        
        // MORE particles for boss
        this.emitBlood(boss.x, boss.y, 15);
        this.emitImpact(boss.x, boss.y, 8);
        
        // Bigger damage text
        this.showDamageText(boss.x, boss.y - 30, Math.round(damage), false);
        
        if (hp <= 0) {
            this.killBoss(boss);
        }
    }
    
    killMob(mob) {
        const gold = mob.getData('goldReward');
        this.goldEarned += gold;
        this.totalKills++;
        this.kills++; // Original kills counter!
        this.enemiesAlive--;
        
        this.killText.setText(`Kills: ${this.kills}`);
        
        // Gain XP
        this.gainXP(10);
        
        // SPAWN ALLY EVERY 3 KILLS!
        if (this.kills >= this.nextAllyAt) {
            this.spawnAlly();
            this.nextAllyAt += 3;
        }
        
        // Death explosion effect!
        this.deathExplosion(mob.x, mob.y, false);
        
        mob.destroy();
    }
    
    killBoss(boss) {
        const gold = boss.getData('goldReward');
        this.goldEarned += gold;
        this.totalKills += 5;
        this.kills += 5;
        this.enemiesAlive--;
        
        this.killText.setText(`Kills: ${this.kills}`);
        this.gainXP(100);
        
        // EPIC BOSS DEATH EXPLOSION!
        this.deathExplosion(boss.x, boss.y, true);
        
        const text = this.add.text(boss.x, boss.y, '💀 BOSS DEFEATED! 💀', {
            fontSize: '48px',
            color: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: text,
            y: text.y - 100,
            alpha: 0,
            scale: 1.5,
            duration: 2500,
            ease: 'Cubic.easeOut',
            onComplete: () => text.destroy()
        });
        
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
        
        // Use our fancy effect system!
        this.powerupCollectionEffect(powerup.x, powerup.y, type);
        
        const text = this.add.text(powerup.x, powerup.y - 20, '', {
            fontSize: '20px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        if (type === 'speed') {
            text.setText('Ã¢Å¡Â¡ SPEED BOOST!');
            const old = this.heroStats.speed;
            this.heroStats.speed *= 1.5;
            this.time.delayedCall(8000, () => { this.heroStats.speed = old; });
        } else if (type === 'damage') {
            text.setText('Ã°Å¸â€™Âª DAMAGE BOOST!');
            const old = this.heroStats.damage;
            this.heroStats.damage *= 2;
            this.player.setData('damage', this.heroStats.damage);
            this.time.delayedCall(8000, () => {
                this.heroStats.damage = old;
                this.player.setData('damage', old);
            });
        } else {
            text.setText('Ã¢ÂÂ¤Ã¯Â¸Â HEAL!');
            this.heroStats.hp = this.heroStats.maxHp;
            this.player.setData('hp', this.heroStats.hp);
        }
        
        this.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 1500,
            onComplete: () => text.destroy()
        });
        
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
        
        this.add.text(width / 2, height / 2 - 100, 'Ã°Å¸Ââ€  VICTORY! Ã°Å¸Ââ€ ', {
            fontSize: '64px',
            color: '#ffd700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.add.text(width / 2, height / 2, `Kills: ${this.kills}\nGold Earned: ${this.goldEarned}\nArmy Size: ${this.allies.children.entries.length + 1}`, {
            fontSize: '28px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(3001);
        
        this.createButton(width / 2, height / 2 + 120, 'Continue Ã¢â€ â€™', () => {
            this.scene.start('CastleScene');
        });
    }
    
    showDefeatScreen() {
        const { width, height } = this.cameras.main;
        
        this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.8)
            .setScrollFactor(0).setDepth(3000);
        
        this.add.text(width / 2, height / 2 - 100, 'Ã°Å¸â€™â‚¬ DEFEATED Ã°Å¸â€™â‚¬', {
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
        
        this.createButton(width / 2, height / 2 + 130, 'Ã¢â€ Â Castle', () => {
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
    
    updatePlayerAnimation() {
        if (!this.player || !this.player.active) return;
        
        const velocity = this.player.body.velocity;
        const isMoving = Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10;
        const isAttacking = this.player.getData('isAttacking') || false;
        
        this.updateSpriteAnimation(this.player, isMoving, isAttacking);
        
        // Reset attacking flag after a frame
        if (isAttacking) {
            this.time.delayedCall(50, () => {
                if (this.player && this.player.active) {
                    this.player.setData('isAttacking', false);
                }
            });
        }
    }
    
    updateAlliesAnimations() {
        this.allies.children.entries.forEach(ally => {
            if (!ally || !ally.active) return;
            
            const velocity = ally.body.velocity;
            const isMoving = Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10;
            const isAttacking = ally.getData('isAttacking') || false;
            
            this.updateSpriteAnimation(ally, isMoving, isAttacking);
            
            if (isAttacking) {
                this.time.delayedCall(50, () => {
                    if (ally && ally.active) {
                        ally.setData('isAttacking', false);
                    }
                });
            }
        });
    }
    
    updateEnemiesAnimations() {
        this.mobs.children.entries.forEach(mob => {
            if (!mob || !mob.active) return;
            
            const velocity = mob.body.velocity;
            const isMoving = Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10;
            const isAttacking = mob.getData('isAttacking') || false;
            
            this.updateSpriteAnimation(mob, isMoving, isAttacking);
            
            if (isAttacking) {
                this.time.delayedCall(50, () => {
                    if (mob && mob.active) {
                        mob.setData('isAttacking', false);
                    }
                });
            }
        });
        
        this.bosses.children.entries.forEach(boss => {
            if (!boss || !boss.active) return;
            
            const velocity = boss.body.velocity;
            const isMoving = Math.abs(velocity.x) > 10 || Math.abs(velocity.y) > 10;
            const isAttacking = boss.getData('isAttacking') || false;
            
            this.updateSpriteAnimation(boss, isMoving, isAttacking);
            
            if (isAttacking) {
                this.time.delayedCall(50, () => {
                    if (boss && boss.active) {
                        boss.setData('isAttacking', false);
                    }
                });
            }
        });
    }
}