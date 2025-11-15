// Game configuration shared between client and server
const GameConfig = {
    WORLD_WIDTH: 4000,
    WORLD_HEIGHT: 3000,
    TICK_RATE: 20,
    GRAVITY: 9.8,
    FRICTION: 0.85, // More friction = stops faster
    BASE_SPEED: 120, // Reduced from 180
    BASE_HP: 50,
    BASE_DAMAGE: 10,
    BASE_SIZE: 0.8,
    JUMP_FORCE: 25,
    ATTACK_COOLDOWN: 400,
    ATTACK_RANGE: 80,
    ATTACK_ARC: Math.PI / 3,
    BACKSTAB_MULTIPLIER: 1.5,
    KNOCKBACK_FORCE: 150,
    EVOLUTION_STAGES: [
        { level: 1, name: "Peasant", sprite: "pawn", scale: 0.8, hp: 50, damage: 10, speed: 120 },
        { level: 2, name: "Militia", sprite: "pawn", scale: 0.9, hp: 75, damage: 12, speed: 130 },
        { level: 3, name: "Footman", sprite: "warrior", scale: 1.0, hp: 100, damage: 15, speed: 135 },
        { level: 4, name: "Veteran", sprite: "warrior", scale: 1.1, hp: 125, damage: 18, speed: 140 },
        { level: 5, name: "Knight", sprite: "warrior", scale: 1.2, hp: 150, damage: 22, speed: 145 },
        { level: 6, name: "Elite Knight", sprite: "warrior", scale: 1.3, hp: 180, damage: 26, speed: 145 },
        { level: 7, name: "Champion", sprite: "warrior", scale: 1.4, hp: 210, damage: 30, speed: 145 },
        { level: 8, name: "Lord", sprite: "warrior", scale: 1.5, hp: 250, damage: 35, speed: 145 },
        { level: 9, name: "Hero", sprite: "warrior", scale: 1.6, hp: 300, damage: 40, speed: 145 },
        { level: 10, name: "Legend", sprite: "warrior", scale: 1.8, hp: 400, damage: 50, speed: 145 }
    ],
    XP_PER_LEVEL: 100,
    XP_LEVEL_MULTIPLIER: 1.5,
    NPC_XP_REWARD: 10,
    PLAYER_XP_STEAL: 0.5,
    ASSASSINATION_BONUS: 1.0,
    NPC_COUNT: 80,
    NPC_SPAWN_RATE: 3000,
    NPC_SPAWN_BATCH: 5,
    NPC_HP: 30,
    NPC_SPEED: 80,
    NPC_DAMAGE: 5,
    
    // DESTRUCTIBLES
    DESTRUCTIBLE_COUNT: 50,
    DESTRUCTIBLE_RESPAWN_TIME: 15000, // 15 seconds
    BARREL_HP: 30,
    CRATE_HP: 40,
    DESTRUCTIBLE_XP_MIN: 15,
    DESTRUCTIBLE_XP_MAX: 25,
    
    // TERRAIN
    TERRAIN_GRID_SIZE: 200, // Grid cell size in pixels
    TERRAIN_TYPES: {
        NORMAL: 0,
        MUD: 1,
        ICE: 2
    },
    MUD_SPEED_MULTIPLIER: 0.5, // 50% speed reduction
    ICE_FRICTION_MULTIPLIER: 0.95, // Very low friction = sliding
    MUD_PATCH_COUNT: 15,
    ICE_PATCH_COUNT: 10,
    TERRAIN_PATCH_RADIUS: 150,
    
    CLASSES: {
        berserker: {
            name: "Berserker",
            speedBonus: 1.3,
            damageBonus: 1.2,
            hpPenalty: 0.8
        },
        paladin: {
            name: "Paladin",
            speedPenalty: 0.85,
            hpBonus: 1.4,
            regenRate: 2
        },
        assassin: {
            name: "Assassin",
            speedBonus: 1.15,
            sizeBonus: 0.85,
            backstabBonus: 2.0
        }
    }
};

// For Node.js (server)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
}

// For browser (client) - will be available as global GameConfig in index.html