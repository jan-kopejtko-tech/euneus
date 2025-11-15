const { Room } = require("@colyseus/core");
const { Schema, MapSchema, type } = require("@colyseus/schema");
const GameConfig = require("../GameConfig");

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
    
    this.hp = GameConfig.BASE_HP;
    this.maxHp = GameConfig.BASE_HP;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.isAirborne = false;
    
    this.level = 1;
    this.xp = 0;
    this.xpToNext = GameConfig.XP_PER_LEVEL;
    this.kills = 0;
    
    this.class = "none";
    
    this.lastProcessedInput = 0;
  }
}

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
type("number")(Player.prototype, "lastProcessedInput");

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

class Destructible extends Schema {
  constructor(x, y, type) {
    super();
    this.x = x;
    this.y = y;
    this.type = type; // "barrel" or "crate"
    this.hp = type === "barrel" ? GameConfig.BARREL_HP : GameConfig.CRATE_HP;
    this.maxHp = this.hp;
  }
}

type("number")(Destructible.prototype, "x");
type("number")(Destructible.prototype, "y");
type("string")(Destructible.prototype, "type");
type("number")(Destructible.prototype, "hp");
type("number")(Destructible.prototype, "maxHp");

class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.npcs = new MapSchema();
    this.destructibles = new MapSchema();
    this.tick = 0;
  }
}

type({ map: Player })(GameState.prototype, "players");
type({ map: NPC })(GameState.prototype, "npcs");
type({ map: Destructible })(GameState.prototype, "destructibles");
type("number")(GameState.prototype, "tick");

class FFARoom extends Room {
  
  onCreate(options) {
    console.log("ðŸŽ® FFA Room Created! (SERVER AUTHORITATIVE)");
    
    this.setState(new GameState());
    this.maxClients = 200;
    
    // Initialize terrain grid
    this.initTerrainGrid();
    
    this.spawnNPCs(GameConfig.NPC_COUNT);
    this.spawnDestructibles(GameConfig.DESTRUCTIBLE_COUNT);
    
    // INPUT PROCESSING
    this.onMessage("input", (client, input) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || player.hp <= 0) return;
      
      if (input.attack) {
        console.log(`ðŸ“¥ Attack input received from ${player.username}`);
      }
      
      this.processInput(player, input);
      player.lastProcessedInput = input.seq;
      
      // Send state update back to client
      client.send("state_update", {
        x: player.x,
        y: player.y,
        z: player.z,
        vx: player.vx,
        vy: player.vy,
        vz: player.vz,
        isAirborne: player.isAirborne,
        lastProcessedInput: input.seq
      });
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
    
    this.onMessage("request_terrain", (client) => {
      // Send terrain grid to client
      client.send("terrain_data", { terrainGrid: this.terrainGrid });
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
    
    // Respawn destructibles periodically
    this.destructibleRespawnTimer = this.clock.setInterval(() => {
      const currentDestructibles = Array.from(this.state.destructibles.values()).length;
      if (currentDestructibles < GameConfig.DESTRUCTIBLE_COUNT) {
        this.spawnDestructibles(1);
      }
    }, GameConfig.DESTRUCTIBLE_RESPAWN_TIME);
  }
  
  processInput(player, input) {
    const dt = 0.05;
    
    const stage = this.getEvolutionStage(player.level);
    let speed = stage.speed;
    
    if (player.class === "berserker") speed *= GameConfig.CLASSES.berserker.speedBonus;
    else if (player.class === "paladin") speed *= GameConfig.CLASSES.paladin.speedPenalty;
    else if (player.class === "assassin") speed *= GameConfig.CLASSES.assassin.speedBonus;
    
    // Check terrain type at player position
    const terrainType = this.getTerrainAt(player.x, player.y);
    if (terrainType === GameConfig.TERRAIN_TYPES.MUD) {
      speed *= GameConfig.MUD_SPEED_MULTIPLIER; // 50% speed on mud
    }
    
    const inputMag = Math.sqrt(input.moveX ** 2 + input.moveY ** 2);
    if (inputMag > 0) {
      player.vx = (input.moveX / inputMag) * speed;
      player.vy = (input.moveY / inputMag) * speed;
    } else {
      // Apply terrain-specific friction
      let friction = GameConfig.FRICTION;
      if (terrainType === GameConfig.TERRAIN_TYPES.ICE) {
        friction = GameConfig.ICE_FRICTION_MULTIPLIER; // Very low friction = sliding
      }
      player.vx *= friction;
      player.vy *= friction;
    }
    
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    
    if (player.z > 0 || player.vz > 0) {
      player.vz -= GameConfig.GRAVITY * dt;
      player.z += player.vz * dt;
      
      if (player.z <= 0) {
        player.z = 0;
        player.vz = 0;
        player.isAirborne = false;
      }
    }
    
    player.x = Math.max(30, Math.min(GameConfig.WORLD_WIDTH - 30, player.x));
    player.y = Math.max(30, Math.min(GameConfig.WORLD_HEIGHT - 30, player.y));
    
    player.angle = input.angle;
    
    if (input.jump && player.z === 0 && !player.isAirborne) {
      player.vz = GameConfig.JUMP_FORCE;
      player.z = 0.1;
      player.isAirborne = true;
    }
    
    if (input.attack && player.attackCooldown <= 0 && !player.isAttacking) {
      console.log(`ðŸŽ¯ Processing attack: cooldown=${player.attackCooldown}, isAttacking=${player.isAttacking}`);
      this.performAttack(player, input.angle);
    } else if (input.attack) {
      console.log(`âŒ Attack blocked: cooldown=${player.attackCooldown}, isAttacking=${player.isAttacking}`);
    }
  }
  
  onJoin(client, options) {
    console.log(`ðŸ‘‹ ${options.username || "Player"} joined`);
    
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
    console.log(`âŒ Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }
  
  onDispose() {
    console.log("ðŸ—‘ï¸ FFA Room Disposed");
    this.npcSpawnTimer.clear();
    this.destructibleRespawnTimer.clear();
  }
  
  update(deltaTime) {
    this.state.tick++;
    const dt = deltaTime / 1000;
    
    this.updateNPCs(dt);
    this.updateCooldowns(dt);
    this.checkCollisions();
  }
  
  updateNPCs(dt) {
    for (let [npcId, npc] of this.state.npcs) {
      if (Math.random() < 0.02) {
        npc.targetX = Math.random() * GameConfig.WORLD_WIDTH;
        npc.targetY = Math.random() * GameConfig.WORLD_HEIGHT;
      }
      
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
      
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
      
      npc.vx *= GameConfig.FRICTION;
      npc.vy *= GameConfig.FRICTION;
      
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
      
      if (player.class === "paladin" && player.hp < player.maxHp && player.hp > 0) {
        player.hp += GameConfig.CLASSES.paladin.regenRate * dt;
        player.hp = Math.min(player.hp, player.maxHp);
      }
    }
  }
  
  checkCollisions() {
    const players = Array.from(this.state.players.entries());
    
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
          } else if (!p1.isAirborne && !p2.isAirborne) {
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
  
  performAttack(attacker, angle) {
    if (attacker.hp <= 0) return;
    
    // Find attacker's sessionId
    let attackerId = null;
    for (let [sessionId, player] of this.state.players) {
      if (player === attacker) {
        attackerId = sessionId;
        break;
      }
    }
    
    if (!attackerId) return;
    
    console.log(`âš”ï¸ Attack from ${attacker.username} at angle ${angle.toFixed(2)}`);
    
    attacker.isAttacking = true;
    attacker.attackCooldown = GameConfig.ATTACK_COOLDOWN;
    
    const stage = this.getEvolutionStage(attacker.level);
    const range = GameConfig.ATTACK_RANGE * stage.scale;
    const arc = GameConfig.ATTACK_ARC;
    let damage = stage.damage;
    
    console.log(`  Range: ${range.toFixed(0)}, Damage: ${damage}`);
    
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
    let npcsInRange = 0;
    let npcsHit = 0;
    for (let [npcId, npc] of this.state.npcs) {
      const dx = npc.x - attacker.x;
      const dy = npc.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist <= range) npcsInRange++;
      if (dist > range) continue;
      
      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToTarget - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff <= arc / 2) {
        npcsHit++;
        const oldHp = npc.hp;
        npc.hp -= damage;
        console.log(`  ðŸŽ¯ HIT NPC ${npcId}: HP ${oldHp} -> ${npc.hp} (damage: ${damage})`);
        
        npc.vx += Math.cos(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        npc.vy += Math.sin(angle) * GameConfig.KNOCKBACK_FORCE * 0.5;
        
        this.broadcast("npc_hit", { npcId, damage });
        
        if (npc.hp <= 0) {
          console.log(`  ðŸ’€ NPC ${npcId} KILLED - deleting from state`);
          this.state.npcs.delete(npcId);
          this.giveXP(attacker, GameConfig.NPC_XP_REWARD);
          this.broadcast("npc_killed", { npcId, killerId: attackerId });
        } else {
          console.log(`  â¤ï¸ NPC ${npcId} survived with ${npc.hp} HP`);
        }
      }
    }
    console.log(`  NPCs in range: ${npcsInRange}, NPCs hit: ${npcsHit}, Total NPCs: ${this.state.npcs.size}`);
    
    // Check Destructibles
    for (let [destructibleId, destructible] of this.state.destructibles) {
      const dx = destructible.x - attacker.x;
      const dy = destructible.y - attacker.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > range) continue;
      
      const angleToTarget = Math.atan2(dy, dx);
      let angleDiff = Math.abs(angleToTarget - angle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      if (angleDiff <= arc / 2) {
        destructible.hp -= damage;
        console.log(`  ðŸ"¦ HIT ${destructible.type.toUpperCase()} ${destructibleId}: HP ${destructible.hp}/${destructible.maxHp}`);
        
        this.broadcast("destructible_hit", { destructibleId, damage });
        
        if (destructible.hp <= 0) {
          console.log(`  ðŸ'¥ ${destructible.type.toUpperCase()} DESTROYED`);
          const xpReward = Math.floor(
            Math.random() * (GameConfig.DESTRUCTIBLE_XP_MAX - GameConfig.DESTRUCTIBLE_XP_MIN + 1) + 
            GameConfig.DESTRUCTIBLE_XP_MIN
          );
          this.giveXP(attacker, xpReward);
          this.state.destructibles.delete(destructibleId);
          this.broadcast("destructible_destroyed", { 
            destructibleId, 
            x: destructible.x, 
            y: destructible.y, 
            type: destructible.type 
          });
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
  
  initTerrainGrid() {
    // Create terrain grid
    const gridWidth = Math.ceil(GameConfig.WORLD_WIDTH / GameConfig.TERRAIN_GRID_SIZE);
    const gridHeight = Math.ceil(GameConfig.WORLD_HEIGHT / GameConfig.TERRAIN_GRID_SIZE);
    
    this.terrainGrid = [];
    for (let x = 0; x < gridWidth; x++) {
      this.terrainGrid[x] = [];
      for (let y = 0; y < gridHeight; y++) {
        this.terrainGrid[x][y] = GameConfig.TERRAIN_TYPES.NORMAL;
      }
    }
    
    // Generate mud patches
    for (let i = 0; i < GameConfig.MUD_PATCH_COUNT; i++) {
      const centerX = Math.random() * GameConfig.WORLD_WIDTH;
      const centerY = Math.random() * GameConfig.WORLD_HEIGHT;
      this.createTerrainPatch(centerX, centerY, GameConfig.TERRAIN_PATCH_RADIUS, GameConfig.TERRAIN_TYPES.MUD);
    }
    
    // Generate ice patches
    for (let i = 0; i < GameConfig.ICE_PATCH_COUNT; i++) {
      const centerX = Math.random() * GameConfig.WORLD_WIDTH;
      const centerY = Math.random() * GameConfig.WORLD_HEIGHT;
      this.createTerrainPatch(centerX, centerY, GameConfig.TERRAIN_PATCH_RADIUS, GameConfig.TERRAIN_TYPES.ICE);
    }
    
    console.log(`🗺️ Terrain grid initialized: ${gridWidth}x${gridHeight}`);
  }
  
  createTerrainPatch(centerX, centerY, radius, terrainType) {
    const gridSize = GameConfig.TERRAIN_GRID_SIZE;
    const minGridX = Math.max(0, Math.floor((centerX - radius) / gridSize));
    const maxGridX = Math.min(this.terrainGrid.length - 1, Math.floor((centerX + radius) / gridSize));
    const minGridY = Math.max(0, Math.floor((centerY - radius) / gridSize));
    const maxGridY = Math.min(this.terrainGrid[0].length - 1, Math.floor((centerY + radius) / gridSize));
    
    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gy = minGridY; gy <= maxGridY; gy++) {
        const cellCenterX = gx * gridSize + gridSize / 2;
        const cellCenterY = gy * gridSize + gridSize / 2;
        const dist = Math.sqrt((cellCenterX - centerX) ** 2 + (cellCenterY - centerY) ** 2);
        
        if (dist <= radius) {
          this.terrainGrid[gx][gy] = terrainType;
        }
      }
    }
  }
  
  getTerrainAt(x, y) {
    const gridX = Math.floor(x / GameConfig.TERRAIN_GRID_SIZE);
    const gridY = Math.floor(y / GameConfig.TERRAIN_GRID_SIZE);
    
    if (gridX >= 0 && gridX < this.terrainGrid.length && 
        gridY >= 0 && gridY < this.terrainGrid[0].length) {
      return this.terrainGrid[gridX][gridY];
    }
    
    return GameConfig.TERRAIN_TYPES.NORMAL;
  }
  
  spawnDestructibles(count) {
    for (let i = 0; i < count; i++) {
      const destructibleId = `dest_${Date.now()}_${Math.random()}`;
      const type = Math.random() < 0.5 ? "barrel" : "crate";
      const destructible = new Destructible(
        Math.random() * GameConfig.WORLD_WIDTH,
        Math.random() * GameConfig.WORLD_HEIGHT,
        type
      );
      this.state.destructibles.set(destructibleId, destructible);
    }
    console.log(`📦 Spawned ${count} destructibles`);
  }
}

module.exports = { FFARoom };