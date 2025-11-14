// Server-side GameConfig
module.exports = {
  WORLD_WIDTH: 4000,
  WORLD_HEIGHT: 3000,
  TICK_RATE: 20,
  GRAVITY: 9.8,
  FRICTION: 0.9,
  BASE_SPEED: 180,
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
    { level: 1, name: "Peasant", sprite: "pawn", scale: 0.8, hp: 50, damage: 10, speed: 180 },
    { level: 2, name: "Militia", sprite: "pawn", scale: 0.9, hp: 75, damage: 12, speed: 190 },
    { level: 3, name: "Footman", sprite: "warrior", scale: 1.0, hp: 100, damage: 15, speed: 200 },
    { level: 4, name: "Veteran", sprite: "warrior", scale: 1.1, hp: 125, damage: 18, speed: 205 },
    { level: 5, name: "Knight", sprite: "warrior", scale: 1.2, hp: 150, damage: 22, speed: 210 },
    { level: 6, name: "Elite Knight", sprite: "warrior", scale: 1.3, hp: 180, damage: 26, speed: 215 },
    { level: 7, name: "Champion", sprite: "warrior", scale: 1.4, hp: 210, damage: 30, speed: 220 },
    { level: 8, name: "Lord", sprite: "warrior", scale: 1.5, hp: 250, damage: 35, speed: 220 },
    { level: 9, name: "Hero", sprite: "warrior", scale: 1.6, hp: 300, damage: 40, speed: 220 },
    { level: 10, name: "Legend", sprite: "warrior", scale: 1.8, hp: 400, damage: 50, speed: 220 }
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