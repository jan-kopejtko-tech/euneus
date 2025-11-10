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
            icon: 'ðŸ›¡ï¸',
            maxHp: 150,
            damage: 15,
            speed: 180,
            range: 70,
            color: 0x4dabf7,
            description: 'High defense, moderate damage'
        },
        assassin: {
            name: 'Rogue',
            icon: 'ðŸ—¡ï¸',
            maxHp: 80,
            damage: 30,
            speed: 280,
            range: 80,
            color: 0xff6b6b,
            description: 'Fast and deadly, low HP'
        },
        mage: {
            name: 'Wizard',
            icon: 'ðŸ§™',
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
            icon: 'ðŸ§±',
            cost: 100,
            hp: 500,
            description: 'Basic defensive wall'
        },
        tower: {
            name: 'Archer Tower',
            icon: 'ðŸ—¼',
            cost: 300,
            hp: 300,
            damage: 10,
            range: 200,
            attackSpeed: 1000,
            description: 'Shoots arrows at enemies'
        },
        gate: {
            name: 'Gate',
            icon: 'ðŸšª',
            cost: 200,
            hp: 400,
            description: 'Reinforced castle gate'
        },
        moat: {
            name: 'Moat',
            icon: 'ðŸŒŠ',
            cost: 500,
            slowAmount: 0.5,
            description: 'Slows enemy movement'
        },
        barracks: {
            name: 'Barracks',
            icon: 'ðŸ°',
            cost: 400,
            description: 'Spawns knights periodically'
        },
        peasant: {
            name: 'Peasant',
            icon: 'ðŸ‘¨â€ðŸŒ¾',
            cost: 50,
            goldPerSecond: 2,
            description: 'Generates passive gold'
        }
    },
    
    // Units
    units: {
        knight: {
            icon: 'âš”ï¸',
            hp: 10,
            damage: 5,
            speed: 220,
            range: 75,
            attackSpeed: 550
        },
        archer: {
            icon: 'ðŸ¹',
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
            icon: 'ðŸ‘¹',
            hp: 30,
            damage: 5,
            speed: 100,
            range: 60,
            attackSpeed: 800,
            goldReward: 10
        },
        orc: {
            icon: 'ðŸ‘º',
            hp: 50,
            damage: 10,
            speed: 80,
            range: 70,
            attackSpeed: 1000,
            goldReward: 20
        },
        troll: {
            icon: 'ðŸ§Ÿ',
            hp: 100,
            damage: 15,
            speed: 60,
            range: 80,
            attackSpeed: 1200,
            goldReward: 50
        },
        dragon: {
            icon: 'ðŸ‰',
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
    // Abilities
    abilities: {
        dash: {
            keys: ['W', 'A', 'S', 'D'],
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
        },
        attack: {
            key: 'LEFT_CLICK',
            emoji: '⚔️',
            cooldown: 400,
            range: 120,  // Increased from 80
            arc: Math.PI / 2.5  // Wider arc (72 degrees instead of 60)
        }
    },
    
    // Level-up Upgrades (Hades-style)
    upgrades: {
        damage1: {
            name: '+5 Damage',
            icon: '⚔️',
            description: 'Increase attack damage',
            effect: { stat: 'damage', value: 5 }
        },
        damage2: {
            name: '+10 Damage',
            icon: '🗡️',
            description: 'Major damage boost',
            effect: { stat: 'damage', value: 10 },
            rarity: 'rare'
        },
        hp1: {
            name: '+20 Max HP',
            icon: '❤️',
            description: 'Increase maximum health',
            effect: { stat: 'maxHp', value: 20 }
        },
        hp2: {
            name: '+50 Max HP',
            icon: '💖',
            description: 'Major health boost',
            effect: { stat: 'maxHp', value: 50 },
            rarity: 'rare'
        },
        speed1: {
            name: '+20 Speed',
            icon: '💨',
            description: 'Move faster',
            effect: { stat: 'speed', value: 20 }
        },
        range1: {
            name: '+15 Range',
            icon: '🎯',
            description: 'Increase attack range',
            effect: { stat: 'range', value: 15 }
        },
        heal: {
            name: 'Full Heal',
            icon: '💚',
            description: 'Restore all health',
            effect: { stat: 'heal', value: 'full' }
        },
        crit: {
            name: 'Critical Strikes',
            icon: '⚡',
            description: '15% chance for double damage',
            effect: { stat: 'crit', value: 0.15 },
            rarity: 'rare'
        },
        attackSpeed: {
            name: 'Swift Strikes',
            icon: '🌪️',
            description: 'Reduce attack cooldown by 100ms',
            effect: { stat: 'attackSpeed', value: -100 }
        },
        dashCooldown: {
            name: 'Agile Dash',
            icon: '🏃',
            description: 'Reduce dash cooldown by 1s',
            effect: { stat: 'dashCooldown', value: -1000 }
        },
        aoe: {
            name: 'Explosive Power',
            icon: '💥',
            description: 'AOE deals 50% more damage',
            effect: { stat: 'aoeDamage', value: 0.5 },
            rarity: 'rare'
        },
        lifesteal: {
            name: 'Vampiric',
            icon: '🩸',
            description: 'Heal 10% of damage dealt',
            effect: { stat: 'lifesteal', value: 0.1 },
            rarity: 'rare'
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
        abilityDash: 'WASD - Directional Dash',
        abilityAOE: 'E - Area Attack',
        abilityAttack: 'LEFT CLICK - Sword Slash'
    },
    
    // Emojis
    emojis: {
        player: 'ðŸ¤´',
        knight: 'âš”ï¸',
        archer: 'ðŸ¹',
        goblin: 'ðŸ‘¹',
        orc: 'ðŸ‘º',
        troll: 'ðŸ§Ÿ',
        dragon: 'ðŸ‰',
        castle: 'ðŸ°',
        wall: 'ðŸ§±',
        tower: 'ðŸ—¼',
        gate: 'ðŸšª',
        moat: 'ðŸŒŠ',
        peasant: 'ðŸ‘¨â€ðŸŒ¾',
        gold: 'ðŸ’°'
    }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}