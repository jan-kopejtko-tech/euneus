const { Room } = require("@colyseus/core");
const { Schema, MapSchema, type } = require("@colyseus/schema");
const GameConfig = require("../GameConfig");

// Player state schema
class Player extends Schema {
  constructor(x, y, username) {
    super();
    this.x = x;
    this.y = y;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.angle = 0;
    this.username = username || "Player";
    
    // Combat
    this.hp = GameConfig.BASE_HP;
    this.maxHp = GameConfig.BASE_HP;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.isAirborne = false;
    
    // Progression
    this.level = 1;
    this.xp = 0;
    this.xpToNext = GameConfig.XP_PER_LEVEL;
    this.kills = 0;
    
    // Class
    this.class = "none";
    
    // Last update time for validation
    this.lastUpdateTime = Date.now();
  }
}

// Define schema decorators
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "z");
type("number")(Player.prototype, "vx");
type("number")(Player.prototype, "vy");
type("number")(Player.prototype, "vz");
type("number")(Player.prototype, "angle");
type("string")(Player.prototype, "username");
type("number")(Player.prototype, "hp");
type("number")(Player.prototype, "maxHp");
type("boolean")(Player.prototype, "isAttacking");
type("number")(Player.prototype, "attackCooldown");
type("boolean")(Player.prototype, "isAirborne");
type("number")(Player.prototype, "level");
type("number")(Player.prototype, "xp");
type("number")(Player.prototype, "xpToNext");
type("number")(Player.prototype, "kills");
type("string")(Player.prototype, "class");

// NPC schema
class NPC extends Schema {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.hp = GameConfig.NPC_HP;
    this.maxHp = GameConfig.NPC_HP;
    this.targetX = x;
    this.targetY = y;
  }
}

type("number")(NPC.prototype, "x");
type("number")(NPC.prototype, "y");
type("number")(NPC.prototype, "vx");
type("number")(NPC.prototype, "vy");
type("number")(NPC.prototype, "hp");
type("number")(NPC.prototype, "maxHp");
type("number")(NPC.prototype, "targetX");
type("number")(NPC.prototype, "targetY");

// Game state
class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.npcs = new MapSchema();
    this.tick = 0;
  }
}

type({ map: Player })(GameState.prototype, "players");
type({ map: NPC })(GameState.prototype, "npcs");
type("number")(GameState.prototype, "tick");

// Main game room with CLIENT-AUTHORITATIVE movement
class FFARoom extends Room {
  
  onCreate(options) {
    console.log("🎮 FFA Room Created (CLIENT-AUTHORITATIVE)");
    
    this.setState(new GameState());
    this.maxClients = 200;
    
    // Spawn initial NPCs
    this.spawnNPCs(GameConfig.NPC_COUNT);
    
    // CLIENT SENDS POSITION (Agar.io style)
    this.onMessage("position", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.hp <= 0) return;
      
      const now = Date.now();
      const timeSinceLastUpdate = now - player.lastUpdateTime;
      
      // Anti-cheat: Validate movement speed
      const dx = message.x - player.x;
      const dy = message.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate max allowed distance based on time and player speed
      const stage = this.getEvolutionStage(player.level);
      let maxSpeed = stage.speed;
      
      // Apply class modifiers
      if (player.class === "berserker") maxSpeed *= GameConfig.CLASSES.berserker.speedBonus;
      else if (player.class === "paladin") maxSpeed *= GameConfig.CLASSES.paladin.speedPenalty;
      else if (player.class === "assassin") maxSpeed *= GameConfig.CLASSES.assassin.speedBonus;
      
      const maxDistance = (maxSpeed * (timeSinceLastUpdate / 1000)) * 1.5; // 50% tolerance
      
      if (distance > maxDistance) {
        console.warn(`⚠️ ${player.username} moved too fast! ${distance.toFixed(0)}px in ${timeSinceLastUpdate}ms (max: ${maxDistance.toFixed(0)}px)`);
        // Reject the update - don't move player
        return;
      }
      
      // ACCEPT CLIENT POSITION
      player.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, message.x));
      player.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, message.y));
      player.vx = message.vx || 0;
      player.vy = message.vy || 0;
      player.angle = message.angle || player.angle;
      
      player.lastUpdateTime = now;
    });
    
    this.onMessage("attack", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.hp <= 0) return;
      
      if (player.attackCooldown <= 0 && !player.isAttacking) {
        this.performAttack(client.sessionId, message.angle);
      }
    });
    
    this.onMessage("jump", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.hp <= 0) return;
      
      if (player.z === 0 && !player.isAirborne) {
        player.vz = GameConfig.JUMP_FORCE;
        player.z = 0.1;
        player.isAirborne = true;
      }
    });
    
    this.onMessage("respawn", (client) => {
      this.respawnPlayer(client.sessionId);
    });
    
    this.onMessage("choose_class", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.level < 5 || player.class !== "none") return;
      
      if (["berserker", "paladin", "assassin"].includes(message.class)) {
        player.class = message.class;
        this.applyClassStats(player);
        console.log(`Player ${player.username} chose ${message.class}`);
      }
    });
    
    // Game loop - ONLY for NPCs and server-side effects now
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 1000 / GameConfig.TICK_RATE);
    
    // Spawn NPCs periodically
    this.npcSpawnTimer = this.clock.setInterval(() => {
      const currentNPCs = Array.from(this.state.npcs.values()).length;
      if (currentNPCs < GameConfig.NPC_COUNT) {
        this.spawnNPCs(GameConfig.NPC_SPAWN_BATCH);
      }
    }, GameConfig.NPC_SPAWN_RATE);
  }
  
  onJoin(client, options) {
    console.log(`✅ ${options.username || "Player"} joined`);
    
    const player = new Player(
      Math.random() * GameConfig.WORLD_WIDTH,
      Math.random() * GameConfig.WORLD_HEIGHT,
      options.username || `Player${Math.floor(Math.random() * 1000)}`
    );
    
    this.state.players.set(client.sessionId, player);
    
    client.send("init", {
      sessionId: client.sessionId,
      worldWidth: GameConfig.WORLD_WIDTH,
      worldHeight: GameConfig.WORLD_HEIGHT
    });
  }
  
  onLeave(client, consented) {
    console.log(`❌ Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }
  
  onDispose() {
    console.log("🛑 FFA Room Disposed");
    this.npcSpawnTimer.clear();
  }
  
  // GAME LOOP - Only NPCs and server-side effects
  update(deltaTime) {
    this.state.tick++;
    const dt = deltaTime / 1000;
    
    // Update NPCs
    this.updateNPCs(dt);
    
    // Update player physics (jump/gravity only)
    this.updatePlayerPhysics(dt);
    
    // Update cooldowns
    this.updateCooldowns(dt);
    
    // Check collisions
    this.checkCollisions();
  }
  
  updatePlayerPhysics(dt) {
    // Only handle gravity/jump - position is client-controlled
    for (let [sessionId, player] of this.state.players) {
      if (player.z > 0 || player.vz > 0) {
        player.vz -= GameConfig.GRAVITY * dt;
        player.z += player.vz * dt;
        
        if (player.z <= 0) {
          player.z = 0;
          player.vz = 0;
          player.isAirborne = false;
        }
      }
    }
  }
  
  updateNPCs(dt) {
    for (let [npcId, npc] of this.state.npcs) {
      // Random walk
      if (Math.random() < 0.02) {
        npc.targetX = Math.random() * GameConfig.WORLD_WIDTH;
        npc.targetY = Math.random() * GameConfig.WORLD_HEIGHT;
      }
      
      // Move toward target
      const dx = npc.targetX - npc.x;
      const dy = npc.targetY - npc.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 10) {
        npc.vx = (dx / dist) * GameConfig.NPC_SPEED;
        npc.vy = (dy / dist) * GameConfig.NPC_SPEED;
      } else {
        npc.vx *= GameConfig.FRICTION;
        npc.vy *= GameConfig.FRICTION;
      }
      
      // Update position
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
      
      // Bounds
      npc.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, npc.x));
      npc.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, npc.y));
    }
  }
  
  updateCooldowns(dt) {
    for (let player of this.state.players.values()) {
      if (player.attackCooldown > 0) {
        player.attackCooldown -= dt * 1000;
        if (player.attackCooldown <= 0) {
          player.isAttacking = false;
        }
      }
      
      // Paladin regen
      if (player.class === "paladin" && player.hp < player.maxHp && player.hp > 0) {
        player.hp += GameConfig.CLASSES.paladin.regenRate * dt;
        player.hp = Math.min(player.hp, player.maxHp);
      }
    }
  }
  
  checkCollisions() {
    const players = Array.from(this.state.players.entries());
    
    // Player vs Player
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const [id1, p1] = players[i];
        const [id2, p2] = players[j];
        
        if (p1.hp <= 0 || p2.hp <= 0) continue;
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const stage1 = this.getEvolutionStage(p1.level);
        const stage2 = this.getEvolutionStage(p2.level);
        const r1 = stage1.scale * 30;
        const r2 = stage2.scale * 30;
        const minDist = r1 + r2;
        
        if (dist < minDist && dist > 0) {
          // Mid-air collision
          if (p1.isAirborne && p2.isAirborne) {
            const relativeSpeed = Math.sqrt(
              (p1.vx - p2.vx) ** 2 + 
              (p1.vy - p2.vy) ** 2 +
              (p1.vz - p2.vz) ** 2
            );
            const damage = relativeSpeed * 0.5;
            
            p1.hp -= damage;
            p2.hp -= damage;
            
            const nx = dx / dist;
            const ny = dy / dist;
            p1.vx -= nx * GameConfig.KNOCKBACK_FORCE;
            p1.vy -= ny * GameConfig.KNOCKBACK_FORCE;
            p1.vz = -10;
            
            p2.vx += nx * GameConfig.KNOCKBACK_FORCE;
            p2.vy += ny * GameConfig.KNOCKBACK_FORCE;
            p2.vz = -10;
            
            this.broadcast("midair_collision", { p1: id1, p2: id2, damage });
            
            this.checkDeath(id1, p1, id2);
            this.checkDeath(id2, p2, id1);
          }
        }
      }
    }
  }
  
  performAttack(attackerId, angle) {
    const attacker = this.state.players.get(attackerId);
    if (!attacker || attacker.hp <= 0) return;
    
    attacker.isAttacking = true;
    attacker.attackCooldown = GameConfig.ATTACK_COOLDOWN;
    
    const stage = this.getEvolutionStage(attacker.level);
    const range = GameConfig.ATTACK_RANGE * stage.scale;
    const arc = GameConfig.ATTACK_ARC;
    let damage = stage.damage;
    
    if (attacker.class === "berserker") {
      damage *= GameConfig.CLASSES.berserker.damageBonus;
    }
    
    // Check players
    for (let [targetId, target] of this.state.players) {
      if (targetId === attackerId || target.hp <= 0) continue;
      if (target.z > 10 && attacker.z < 5) continue;
      
      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > range) continue;
      
      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToTarget - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff <= arc / 2) {
        const isBackstab = Math.abs(angleDiff - Math.PI) < Math.PI / 4;
        let backstabMult = isBackstab ? GameConfig.BACKSTAB_MULTIPLIER : 1;
        
        if (attacker.class === "assassin" && isBackstab) {
          backstabMult = GameConfig.CLASSES.assassin.backstabBonus;
        }
        
        const finalDamage = damage * backstabMult;
        target.hp -= finalDamage;
        
        const nx = Math.cos(angle);
        const ny = Math.sin(angle);
        target.vx += nx * GameConfig.KNOCKBACK_FORCE;
        target.vy += ny * GameConfig.KNOCKBACK_FORCE;
        
        this.broadcast("player_hit", {
          attacker: attackerId,
          target: targetId,
          damage: finalDamage,
          isBackstab: isBackstab
        });
        
        this.checkDeath(targetId, target, attackerId);
      }
    }
    
    // Check NPCs
    for (let [npcId, npc] of this.state.npcs) {
      const dx = npc.x - attacker.x;
      const dy = npc.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > range) continue;
      
      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToTarget - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff <= arc / 2) {
        npc.hp -= damage;
        
        npc.vx += Math.cos(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        npc.vy += Math.sin(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        
        this.broadcast("npc_hit", { npcId, damage });
        
        if (npc.hp <= 0) {
          this.state.npcs.delete(npcId);
          this.giveXP(attacker, GameConfig.NPC_XP_REWARD);
          this.broadcast("npc_killed", { npcId, killerId: attackerId });
        }
      }
    }
  }
  
  checkDeath(victimId, victim, killerId) {
    if (victim.hp <= 0) {
      const killer = this.state.players.get(killerId);
      
      if (killer) {
        const levelDiff = victim.level - killer.level;
        const isAssassination = levelDiff >= 5;
        const stealPercent = isAssassination ? 1.0 : GameConfig.PLAYER_XP_STEAL;
        const xpStolen = Math.floor(victim.xp * stealPercent);
        
        this.giveXP(killer, xpStolen);
        killer.kills++;
      }
      
      this.broadcast("player_killed", {
        victim: victimId,
        killer: killerId,
        assassination: killer && (victim.level - killer.level >= 5)
      });
    }
  }
  
  giveXP(player, amount) {
    player.xp += amount;
    
    while (player.xp >= player.xpToNext) {
      player.xp -= player.xpToNext;
      player.level++;
      player.xpToNext = Math.floor(GameConfig.XP_PER_LEVEL * Math.pow(GameConfig.XP_LEVEL_MULTIPLIER, player.level - 1));
      
      const stage = this.getEvolutionStage(player.level);
      player.maxHp = stage.hp;
      player.hp = stage.hp;
      
      this.applyClassStats(player);
      
      this.broadcast("player_levelup", {
        playerId: player,
        level: player.level
      });
    }
  }
  
  applyClassStats(player) {
    const stage = this.getEvolutionStage(player.level);
    
    if (player.class === "berserker") {
      player.maxHp = Math.floor(stage.hp * GameConfig.CLASSES.berserker.hpPenalty);
    } else if (player.class === "paladin") {
      player.maxHp = Math.floor(stage.hp * GameConfig.CLASSES.paladin.hpBonus);
    }
    
    player.hp = Math.min(player.hp, player.maxHp);
  }
  
  respawnPlayer(sessionId) {
    const player = this.state.players.get(sessionId);
    if (!player) return;
    
    player.level = 1;
    player.xp = 0;
    player.xpToNext = GameConfig.XP_PER_LEVEL;
    player.hp = GameConfig.BASE_HP;
    player.maxHp = GameConfig.BASE_HP;
    player.kills = 0;
    player.class = "none";
    
    player.x = Math.random() * GameConfig.WORLD_WIDTH;
    player.y = Math.random() * GameConfig.WORLD_HEIGHT;
    player.z = 0;
    player.vx = 0;
    player.vy = 0;
    player.vz = 0;
    player.isAirborne = false;
    player.isAttacking = false;
    
    console.log(`Player ${player.username} respawned`);
  }
  
  spawnNPCs(count) {
    for (let i = 0; i < count; i++) {
      const npcId = `npc_${Date.now()}_${Math.random()}`;
      const npc = new NPC(
        Math.random() * GameConfig.WORLD_WIDTH,
        Math.random() * GameConfig.WORLD_HEIGHT
      );
      this.state.npcs.set(npcId, npc);
    }
  }
  
  getEvolutionStage(level) {
    const clampedLevel = Math.max(1, Math.min(level, GameConfig.EVOLUTION_STAGES.length));
    return GameConfig.EVOLUTION_STAGES[clampedLevel - 1];
  }
}

module.exports = { FFARoom };