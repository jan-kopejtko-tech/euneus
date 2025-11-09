// GameData - Central game state manager
class GameData {
    constructor() {
        this.data = null;
        this.isLoaded = false;
    }
    
    // Initialize new game
    newGame() {
        this.data = saveSystem.createNewGame();
        this.isLoaded = true;
        console.log('🎮 New game started');
        return this.data;
    }
    
    // Load existing game
    loadGame() {
        this.data = saveSystem.load();
        if (this.data) {
            this.isLoaded = true;
            console.log('📂 Game loaded');
            return this.data;
        }
        console.log('❌ No save data to load');
        return null;
    }
    
    // Save current game
    saveGame() {
        if (!this.data) {
            console.error('❌ No game data to save');
            return false;
        }
        return saveSystem.save(this.data);
    }
    
    // Set hero class (during class selection)
    setHeroClass(className) {
        if (!this.data) return;
        
        const classConfig = GameConfig.classes[className];
        if (!classConfig) return;
        
        this.data.hero.class = className;
        this.data.hero.maxHp = classConfig.maxHp;
        this.data.hero.damage = classConfig.damage;
        this.data.hero.speed = classConfig.speed;
        this.data.hero.range = classConfig.range;
        
        console.log(`🛡️ Hero class set to: ${className}`);
    }
    
    // Add gold
    addGold(amount) {
        if (!this.data) return;
        this.data.totalGold += amount;
        this.data.stats.totalGoldEarned += amount;
    }
    
    // Spend gold
    spendGold(amount) {
        if (!this.data) return false;
        if (this.data.totalGold < amount) return false;
        
        this.data.totalGold -= amount;
        return true;
    }
    
    // Add XP and handle level ups
    addXP(amount) {
        if (!this.data) return;
        
        this.data.hero.xp += amount;
        
        while (this.data.hero.xp >= this.data.hero.xpToNext) {
            this.levelUpHero();
        }
    }
    
    // Level up hero
    levelUpHero() {
        this.data.hero.xp -= this.data.hero.xpToNext;
        this.data.hero.level++;
        this.data.hero.xpToNext = Math.floor(this.data.hero.xpToNext * 1.5);
        
        // Stat increases
        this.data.hero.maxHp += 10;
        this.data.hero.damage += 2;
        this.data.hero.range += 2;
        this.data.hero.skillPoints += 1;
        
        console.log(`⬆️ Hero leveled up to ${this.data.hero.level}!`);
    }
    
    // Complete level
    completeLevel(goldEarned, killCount) {
        if (!this.data) return;
        
        this.data.currentLevel++;
        if (this.data.currentLevel > this.data.maxLevelReached) {
            this.data.maxLevelReached = this.data.currentLevel;
        }
        
        this.addGold(goldEarned);
        this.data.stats.totalKills += killCount;
        this.data.stats.levelsCompleted++;
        
        console.log(`✅ Level ${this.data.currentLevel - 1} completed!`);
    }
    
    // Build castle building
    buildBuilding(buildingType, position = null) {
        if (!this.data) return false;
        
        const building = GameConfig.buildings[buildingType];
        if (!building) return false;
        
        if (!this.spendGold(building.cost)) {
            console.log('❌ Not enough gold');
            return false;
        }
        
        const buildingData = {
            type: buildingType,
            position: position,
            hp: building.hp || 0,
            level: 1,
            builtAt: Date.now()
        };
        
        // Add to appropriate array
        switch(buildingType) {
            case 'wall':
                this.data.castle.walls.push(buildingData);
                break;
            case 'tower':
                this.data.castle.towers.push(buildingData);
                break;
            case 'gate':
                this.data.castle.gates.push(buildingData);
                break;
            case 'moat':
                this.data.castle.moats.push(buildingData);
                break;
            case 'barracks':
                this.data.castle.barracks.push(buildingData);
                break;
            case 'peasant':
                this.data.castle.peasants++;
                break;
        }
        
        console.log(`🏗️ Built ${buildingType}`);
        return true;
    }
    
    // Recruit unit
    recruitUnit(unitType) {
        if (!this.data) return false;
        
        const unitConfig = GameConfig.units[unitType];
        if (!unitConfig) return false;
        
        // Check max units
        const currentUnits = this.data.army.knights + this.data.army.archers;
        if (currentUnits >= this.data.army.maxUnits) {
            console.log('❌ Max units reached');
            return false;
        }
        
        const cost = unitType === 'knight' ? 50 : 75;
        if (!this.spendGold(cost)) {
            console.log('❌ Not enough gold');
            return false;
        }
        
        if (unitType === 'knight') {
            this.data.army.knights++;
        } else {
            this.data.army.archers++;
        }
        
        console.log(`⚔️ Recruited ${unitType}`);
        return true;
    }
    
    // Get passive gold per second from peasants
    getPassiveGoldRate() {
        if (!this.data) return 0;
        return this.data.castle.peasants * GameConfig.buildings.peasant.goldPerSecond;
    }
    
    // Update play time
    updatePlayTime(deltaSeconds) {
        if (!this.data) return;
        this.data.stats.timePlayed += deltaSeconds;
    }
    
    // Get current level config
    getCurrentLevelConfig() {
        if (!this.data) return null;
        const levelIndex = this.data.currentLevel - 1;
        if (levelIndex >= GameConfig.levels.length) return null;
        return GameConfig.levels[levelIndex];
    }
    
    // Reset to specific level (for testing)
    resetToLevel(levelNum) {
        if (!this.data) return;
        this.data.currentLevel = Math.max(1, Math.min(levelNum, GameConfig.game.totalLevels));
    }
}

// Make available globally
const gameData = new GameData();