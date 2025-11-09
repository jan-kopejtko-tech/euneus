// Save System - Handles all localStorage operations
class SaveSystem {
    constructor() {
        this.SAVE_KEY = 'euneus_save_data';
    }
    
    // Create new game data
    createNewGame() {
        return {
            version: '1.0.0',
            createdAt: Date.now(),
            lastPlayed: Date.now(),
            
            // Player progress
            currentLevel: 1,
            maxLevelReached: 1,
            totalGold: GameConfig.game.startingGold,
            
            // Hero stats
            hero: {
                class: null, // Will be set on class selection
                level: 1,
                xp: 0,
                xpToNext: 100,
                maxHp: 100,
                damage: 20,
                speed: 220,
                range: 80,
                skillPoints: 0
            },
            
            // Castle state
            castle: {
                walls: [],
                towers: [],
                gates: [],
                moats: [],
                barracks: [],
                peasants: 0,
                level: 1
            },
            
            // Army
            army: {
                knights: 0,
                archers: 0,
                maxUnits: 10
            },
            
            // Statistics
            stats: {
                totalKills: 0,
                totalWaves: 0,
                totalGoldEarned: 0,
                levelsCompleted: 0,
                timePlayed: 0
            },
            
            // Settings
            settings: {
                musicVolume: 0.7,
                sfxVolume: 0.8,
                showTutorial: true
            }
        };
    }
    
    // Save game data
    save(gameData) {
        try {
            gameData.lastPlayed = Date.now();
            const jsonData = JSON.stringify(gameData);
            localStorage.setItem(this.SAVE_KEY, jsonData);
            console.log('✅ Game saved successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            return false;
        }
    }
    
    // Load game data
    load() {
        try {
            const jsonData = localStorage.getItem(this.SAVE_KEY);
            if (!jsonData) {
                console.log('📝 No save data found');
                return null;
            }
            
            const gameData = JSON.parse(jsonData);
            console.log('✅ Game loaded successfully');
            return gameData;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            return null;
        }
    }
    
    // Check if save exists
    hasSaveData() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
    
    // Delete save data
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ Save data deleted');
            return true;
        } catch (error) {
            console.error('❌ Failed to delete save:', error);
            return false;
        }
    }
    
    // Export save data (for cloud sync later)
    exportSave() {
        const gameData = this.load();
        if (!gameData) return null;
        
        return {
            data: gameData,
            checksum: this.generateChecksum(gameData)
        };
    }
    
    // Import save data (for cloud sync later)
    importSave(saveData) {
        try {
            if (!this.validateChecksum(saveData.data, saveData.checksum)) {
                console.error('❌ Save data corrupted');
                return false;
            }
            
            return this.save(saveData.data);
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            return false;
        }
    }
    
    // Generate simple checksum
    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    }
    
    // Validate checksum
    validateChecksum(data, checksum) {
        return this.generateChecksum(data) === checksum;
    }
    
    // Auto-save functionality
    enableAutoSave(gameDataGetter, interval = 60000) {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            const gameData = gameDataGetter();
            if (gameData) {
                this.save(gameData);
                console.log('💾 Auto-saved');
            }
        }, interval);
    }
    
    disableAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

// Make available globally
const saveSystem = new SaveSystem();