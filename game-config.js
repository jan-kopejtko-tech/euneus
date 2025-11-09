// Game Configuration - All game constants and settings
const GameConfig = {
    // World settings
    world: {
        width: 4000,
        height: 3000
    },
    
    // Game constants
    game: {
        totalLevels: 10,
        levelDuration: 300000, // 5 minutes in ms
        startingGold: 500,
        waveInterval: 30000 // 30 seconds between waves
    },
    
    // Hero classes
    classes: {
        tank: {
            name: 'Knight',
            icon: '🛡️',
            maxHp: 150,
            damage: 15,
            speed: 180,
            range: 70,
            color: 0x4dabf7,
            description: 'High defense, moderate damage'
        },
        assassin: {
            name: 'Rogue',
            icon: '🗡️',
            maxHp: 80,
            damage: 30,
            speed: 280,
            range: 80,
            color: 0xff6b6b,
            description: 'Fast and deadly, low HP'
        },
        mage: {
            name: 'Wizard',
            icon: '🧙',
            maxHp: 100,
            damage: 25,
            speed: 220,
            range: 150,
            color: 0xa78bfa,
            description: 'Long range magic attacks'
        }
    },
    
    // Castle buildings
    buildings: {
        wall: {
            name: 'Wall',
            icon: '🧱',
            cost: 100,
            hp: 500,
            description: 'Basic defensive wall'
        },
        tower: {
            name: 'Archer Tower',
            icon: '🗼',
            cost: 300,
            hp: 300,
            damage: 10,
            range: 200,
            attackSpeed: 1000,
            description: 'Shoots arrows at enemies'
        },
        gate: {
            name: 'Gate',
            icon: '🚪',
            cost: 200,
            hp: 400,
            description: 'Reinforced castle gate'
        },
        moat: {
            name: 'Moat',
            icon: '🌊',
            cost: 500,
            slowAmount: 0.5,
            description: 'Slows enemy movement'
        },
        barracks: {
            name: 'Barracks',
            icon: '🏰',
            cost: 400,
            description: 'Spawns knights periodically'
        },
        peasant: {
            name: 'Peasant',
            icon: '👨‍🌾',
            cost: 50,
            goldPerSecond: 2,
            description: 'Generates passive gold'
        }
    },
    
    // Units
    units: {
        knight: {
            icon: '⚔️',
            hp: 10,
            damage: 5,
            speed: 220,
            range: 75,
            attackSpeed: 550
        },
        archer: {
            icon: '🏹',
            hp: 5,
            damage: 2.5,
            speed: 210,
            range: 160,
            attackSpeed: 850
        }
    },
    
    // Enemies (mobs)
    enemies: {
        goblin: {
            icon: '👹',
            hp: 30,
            damage: 5,
            speed: 100,
            range: 60,
            attackSpeed: 800,
            goldReward: 10
        },
        orc: {
            icon: '👺',
            hp: 50,
            damage: 10,
            speed: 80,
            range: 70,
            attackSpeed: 1000,
            goldReward: 20
        },
        troll: {
            icon: '🧟',
            hp: 100,
            damage: 15,
            speed: 60,
            range: 80,
            attackSpeed: 1200,
            goldReward: 50
        },
        dragon: {
            icon: '🐉',
            hp: 300,
            damage: 30,
            speed: 120,
            range: 100,
            attackSpeed: 800,
            goldReward: 200,
            isBoss: true
        }
    },
    
    // Level configurations
    levels: [
        { 
            level: 1, 
            waves: 5, 
            enemyTypes: ['goblin'], 
            enemiesPerWave: 10,
            bossWave: false
        },
        { 
            level: 2, 
            waves: 6, 
            enemyTypes: ['goblin'], 
            enemiesPerWave: 15,
            bossWave: false
        },
        { 
            level: 3, 
            waves: 6, 
            enemyTypes: ['goblin', 'orc'], 
            enemiesPerWave: 20,
            bossWave: false
        },
        { 
            level: 4, 
            waves: 7, 
            enemyTypes: ['goblin', 'orc'], 
            enemiesPerWave: 25,
            bossWave: false
        },
        { 
            level: 5, 
            waves: 8, 
            enemyTypes: ['goblin', 'orc', 'troll'], 
            enemiesPerWave: 30,
            bossWave: true,
            boss: 'dragon'
        },
        { 
            level: 6, 
            waves: 8, 
            enemyTypes: ['orc', 'troll'], 
            enemiesPerWave: 35,
            bossWave: false
        },
        { 
            level: 7, 
            waves: 9, 
            enemyTypes: ['orc', 'troll'], 
            enemiesPerWave: 40,
            bossWave: false
        },
        { 
            level: 8, 
            waves: 9, 
            enemyTypes: ['goblin', 'orc', 'troll'], 
            enemiesPerWave: 45,
            bossWave: false
        },
        { 
            level: 9, 
            waves: 10, 
            enemyTypes: ['orc', 'troll'], 
            enemiesPerWave: 50,
            bossWave: false
        },
        { 
            level: 10, 
            waves: 12, 
            enemyTypes: ['goblin', 'orc', 'troll'], 
            enemiesPerWave: 60,
            bossWave: true,
            boss: 'dragon',
            bossCount: 2
        }
    ],
    
    // Abilities
    abilities: {
        dash: {
            key: 'Q',
            emoji: '💨',
            cooldown: 5000,
            distance: 200
        },
        aoe: {
            key: 'E',
            emoji: '💥',
            cooldown: 8000,
            range: 200,
            damageMultiplier: 2
        }
    },
    
    // UI Text
    text: {
        // Menu
        gameTitle: 'Kingdom of Euneus',
        newGame: 'New Game',
        loadGame: 'Load Game',
        settings: 'Settings',
        
        // Class Selection
        chooseHero: 'Choose Your Hero',
        tankName: 'Knight',
        assassinName: 'Rogue',
        mageName: 'Wizard',
        tankDescription: 'High defense, moderate damage',
        assassinDescription: 'Fast and deadly, low HP',
        mageDescription: 'Long range magic attacks',
        
        // Castle
        castleView: 'Castle Overview',
        gold: 'Gold',
        level: 'Level',
        buildings: 'Buildings',
        units: 'Units',
        startLevel: 'Start Level',
        upgradeHero: 'Upgrade Hero',
        
        // Battle
        wave: 'Wave',
        timeRemaining: 'Time',
        kills: 'Kills',
        hp: 'HP',
        victory: 'Victory!',
        defeat: 'Defeat!',
        continueBtn: 'Continue',
        retryBtn: 'Retry',
        
        // Stats
        hpLabel: 'HP',
        damageLabel: 'Damage',
        speedLabel: 'Speed',
        rangeLabel: 'Range',
        
        // Descriptions
        speedSlow: 'Slow',
        speedNormal: 'Normal',
        speedFast: 'Fast',
        rangeLong: 'Long',
        rangeShort: 'Short',
        
        // Abilities
        abilityDash: 'Q - Dash Forward',
        abilityAOE: 'E - Area Attack'
    },
    
    // Emojis
    emojis: {
        player: '🤴',
        knight: '⚔️',
        archer: '🏹',
        goblin: '👹',
        orc: '👺',
        troll: '🧟',
        dragon: '🐉',
        castle: '🏰',
        wall: '🧱',
        tower: '🗼',
        gate: '🚪',
        moat: '🌊',
        peasant: '👨‍🌾',
        gold: '💰'
    }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}