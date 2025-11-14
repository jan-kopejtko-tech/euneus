const { Room } = require("@colyseus/core");
const { Schema, MapSchema, type } = require("@colyseus/schema");
const GameConfig = require("../../shared/GameConfig");

// Player state schema
class Player extends Schema {
  constructor(x, y, username) {
    super();
    this.x = x;
    this.y = y;
    this.z = 0; // Jump height
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
    
    // Class (unlocked at level 5)
    this.class = "none";
    
    // Input buffer
    this.input = {
      moveX: 0,
      moveY: 0,
      wantsToJump: false,
      wantsToAttack: false,
      attackAngle: 0
    };
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

// Main game room
class FFARoom extends Room {
  
  onCreate(options) {
    console.log("ðŸŽ® FFA Room Created!");
    
    this.setState(new GameState());
    this.maxClients = 200;
    
    // Spawn initial NPCs
    this.spawnNPCs(GameConfig.NPC_COUNT);
    
    // Message handlers
    this.onMessage("input", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      // Store input for processing in game loop
      player.input.moveX = Math.max(-1, Math.min(1, message.moveX || 0));
      player.input.moveY = Math.max(-1, Math.min(1, message.moveY || 0));
      player.input.wantsToJump = message.jump || false;
      player.input.wantsToAttack = message.attack || false;
      player.input.attackAngle = message.attackAngle || 0;
      
      // Update facing angle
      if (message.mouseX !== undefined && message.mouseY !== undefined) {
        player.angle = Math.atan2(
          message.mouseY - player.y,
          message.mouseX - player.x
        );
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
    
    // Game loop - 20 ticks per second
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
    console.log(`âœ… ${options.username || "Player"} joined`);
    
    // Random spawn position
    const player = new Player(
      Math.random() * GameConfig.WORLD_WIDTH,
      Math.random() * GameConfig.WORLD_HEIGHT,
      options.username || `Player${Math.floor(Math.random() * 1000)}`
    );
    
    this.state.players.set(client.sessionId, player);
    
    // Send initial info
    client.send("init", {
      sessionId: client.sessionId,
      worldWidth: GameConfig.WORLD_WIDTH,
      worldHeight: GameConfig.WORLD_HEIGHT
    });
  }
  
  onLeave(client, consented) {
    console.log(`âŒ Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }
  
  onDispose() {
    console.log("ðŸ›‘ FFA Room Disposed");
    this.npcSpawnTimer.clear();
  }
  
  // GAME LOOP
  update(deltaTime) {
    this.state.tick++;
    const dt = deltaTime / 1000; // Convert to seconds
    
    // 1. Process inputs
    this.processInputs(dt);
    
    // 2. Update physics
    this.updatePhysics(dt);
    
    // 3. Check collisions
    this.checkCollisions();
    
    // 4. Update NPCs
    this.updateNPCs(dt);
    
    // 5. Update cooldowns
    this.updateCooldowns(dt);
  }
  
  processInputs(dt) {
    for (let [sessionId, player] of this.state.players) {
      if (player.hp <= 0) continue;
      
      const stage = this.getEvolutionStage(player.level);
      let speed = stage.speed;
      
      // Apply class modifiers
      if (player.class === "berserker") {
        speed *= GameConfig.CLASSES.berserker.speedBonus;
      } else if (player.class === "paladin") {
        speed *= GameConfig.CLASSES.paladin.speedPenalty;
      } else if (player.class === "assassin") {
        speed *= GameConfig.CLASSES.assassin.speedBonus;
      }
      
      // Apply movement input
      const inputMag = Math.sqrt(player.input.moveX ** 2 + player.input.moveY ** 2);
      if (inputMag > 0) {
        player.vx = (player.input.moveX / inputMag) * speed;
        player.vy = (player.input.moveY / inputMag) * speed;
      }
      
      // Jump
      if (player.input.wantsToJump && player.z === 0 && !player.isAirborne) {
        player.vz = GameConfig.JUMP_FORCE;
        player.z = 0.1;
        player.isAirborne = true;
      }
      
      // Attack
      if (player.input.wantsToAttack && player.attackCooldown <= 0 && !player.isAttacking) {
        this.performAttack(sessionId, player.input.attackAngle);
      }
    }
  }
  
  updatePhysics(dt) {
    for (let [sessionId, player] of this.state.players) {
      // Update position
      player.x += player.vx * dt;
      player.y += player.vy * dt;
      
      // Gravity & jump physics
      if (player.z > 0 || player.vz > 0) {
        player.vz -= GameConfig.GRAVITY * dt;
        player.z += player.vz * dt;
        
        // Landing
        if (player.z <= 0) {
          player.z = 0;
          player.vz = 0;
          player.isAirborne = false;
        }
      }
      
      // Friction
      player.vx *= GameConfig.FRICTION;
      player.vy *= GameConfig.FRICTION;
      
      // Keep in world bounds
      player.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, player.x));
      player.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, player.y));
    }
    
    // NPC physics
    for (let [npcId, npc] of this.state.npcs) {
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
      
      npc.vx *= GameConfig.FRICTION;
      npc.vy *= GameConfig.FRICTION;
      
      npc.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, npc.x));
      npc.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, npc.y));
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
            
            // Knockback
            const nx = dx / dist;
            const ny = dy / dist;
            p1.vx -= nx * GameConfig.KNOCKBACK_FORCE;
            p1.vy -= ny * GameConfig.KNOCKBACK_FORCE;
            p1.vz = -10; // Slam down
            
            p2.vx += nx * GameConfig.KNOCKBACK_FORCE;
            p2.vy += ny * GameConfig.KNOCKBACK_FORCE;
            p2.vz = -10;
            
            this.broadcast("midair_collision", { p1: id1, p2: id2, damage });
            
            this.checkDeath(id1, p1, id2);
            this.checkDeath(id2, p2, id1);
          }
          // Ground collision (push apart)
          else if (!p1.isAirborne && !p2.isAirborne) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            
            p1.x -= nx * overlap * 0.5;
            p1.y -= ny * overlap * 0.5;
            p2.x += nx * overlap * 0.5;
            p2.y += ny * overlap * 0.5;
          }
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
        npc.vx *= 0.7;
        npc.vy *= 0.7;
      }
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
  
  performAttack(attackerId, angle) {
    const attacker = this.state.players.get(attackerId);
    if (!attacker || attacker.hp <= 0) return;
    
    attacker.isAttacking = true;
    attacker.attackCooldown = GameConfig.ATTACK_COOLDOWN;
    
    const stage = this.getEvolutionStage(attacker.level);
    const range = GameConfig.ATTACK_RANGE * stage.scale;
    const arc = GameConfig.ATTACK_ARC;
    let damage = stage.damage;
    
    // Class modifiers
    if (attacker.class === "berserker") {
      damage *= GameConfig.CLASSES.berserker.damageBonus;
    }
    
    // Check players
    for (let [targetId, target] of this.state.players) {
      if (targetId === attackerId || target.hp <= 0) continue;
      if (target.z > 10 && attacker.z < 5) continue; // Can't hit airborne
      
      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > range) continue;
      
      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToTarget - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff <= arc / 2) {
        // Backstab check
        const isBackstab = Math.abs(angleDiff - Math.PI) < Math.PI / 4;
        let backstabMult = isBackstab ? GameConfig.BACKSTAB_MULTIPLIER : 1;
        
        if (attacker.class === "assassin" && isBackstab) {
          backstabMult = GameConfig.CLASSES.assassin.backstabBonus;
        }
        
        const finalDamage = damage * backstabMult;
        target.hp -= finalDamage;
        
        // Knockback
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
        
        // Knockback
        npc.vx += Math.cos(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        npc.vy += Math.sin(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        
        this.broadcast("npc_hit", { npcId, damage });
        
        if (npc.hp <= 0) {
          console.log(`💀 NPC ${npcId} killed`);
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
      
      // XP steal
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
      player.hp = stage.hp; // Full heal on level up
      
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
    
    // Reset to level 1
    player.level = 1;
    player.xp = 0;
    player.xpToNext = GameConfig.XP_PER_LEVEL;
    player.hp = GameConfig.BASE_HP;
    player.maxHp = GameConfig.BASE_HP;
    player.kills = 0;
    player.class = "none";
    
    // Random spawn
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