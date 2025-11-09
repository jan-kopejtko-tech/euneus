// Game Configuration - All emojis and text in one place
const GameConfig = {
    // Hero emojis
    emojis: {
        player: '🛡️',
        knight: '⚔️',
        archer: '🏹',
        mob: '👹',
        boss: '😈',
        powerupSpeed: '⚡',
        powerupDamage: '💪',
        powerupHeal: '❤️'
    },
    
    // Class configurations
    classes: {
        tank: {
            icon: '🛡️',
            maxHp: 200,
            damage: 15,
            speed: 180,
            range: 70,
            color: 0x4dabf7
        },
        assassin: {
            icon: '⚔️',
            maxHp: 80,
            damage: 35,
            speed: 280,
            range: 75,
            color: 0xff6b6b
        },
        mage: {
            icon: '🔮',
            maxHp: 100,
            damage: 25,
            speed: 220,
            range: 150,
            color: 0xa78bfa
        }
    },
    
    // UI Text
    text: {
        // Connection status
        connecting: '🔄 Connecting...',
        connected: '✅ Connected',
        disconnected: '❌ Disconnected',
        
        // Class selection
        chooseHero: 'Choose Your Hero',
        tankName: 'TANK',
        assassinName: 'ASSASSIN',
        mageName: 'MAGE',
        
        // Stats labels
        hpLabel: '❤️ HP',
        damageLabel: '⚔️ Damage',
        speedLabel: '⚡ Speed',
        rangeLabel: '🎯 Range',
        xpLabel: '⭐ XP',
        armyLabel: '👥 Army',
        
        // Stat descriptions
        tankDescription: '💪 High survivability',
        assassinDescription: '⚡ High damage output',
        mageDescription: '🎯 Long range attacks',
        
        // Speed ratings
        speedSlow: 'Slow',
        speedNormal: 'Normal',
        speedFast: 'Fast',
        
        // Range ratings
        rangeShort: 'Short',
        rangeNormal: 'Normal',
        rangeLong: 'Long',
        
        // Game UI
        kills: 'Kills',
        army: 'Army',
        players: 'Players',
        level: 'Level',
        levelUp: 'LEVEL UP!',
        
        // Legend
        legend: '🛡️ You  •  ⚔️ Knights  •  🏹 Archers  •  👹 Goblins',
        controls: 'MOVE: Mouse  •  Auto-attack nearby enemies',
        
        // Abilities
        abilityDash: 'Q: Dash',
        abilityAOE: 'E: AOE Attack',
        
        // Death screen
        youDied: 'YOU DIED',
        retry: 'RETRY',
        restart: '↻ Restart',
        
        // Powerups
        powerupSpeed: '⚡ SPEED!',
        powerupDamage: '💪 DAMAGE!',
        powerupHeal: '❤️ HEAL!',
        
        // Boss
        bossDefeated: 'BOSS DEFEATED!'
    },
    
    // World settings
    world: {
        width: 4000,
        height: 3000
    },
    
    // Ability settings
    abilities: {
        dash: {
            cooldown: 5000,
            key: 'Q',
            emoji: '💨'
        },
        aoe: {
            cooldown: 10000,
            key: 'E',
            emoji: '💥'
        }
    }
};

// Export for use in main game file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}