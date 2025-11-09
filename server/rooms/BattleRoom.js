const { Room } = require("@colyseus/core");
const { Schema, MapSchema, type } = require("@colyseus/schema");

// Define Player schema
class Player extends Schema {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.hp = 100;
    this.maxHp = 100;
    this.kills = 0;
    this.allyData = [];
  }
}

// Define type decorators for Player
type("number")(Player.prototype, "x");
type("number")(Player.prototype, "y");
type("number")(Player.prototype, "angle");
type("number")(Player.prototype, "hp");
type("number")(Player.prototype, "maxHp");
type("number")(Player.prototype, "kills");
type(["number"])(Player.prototype, "allyData"); // Flat array: [x1,y1,a1, x2,y2,a2, ...]

// Define Mob schema
class Mob extends Schema {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.hp = 30;
    this.maxHp = 30;
    this.targetX = x;
    this.targetY = y;
  }
}

// Define type decorators for Mob
type("number")(Mob.prototype, "x");
type("number")(Mob.prototype, "y");
type("number")(Mob.prototype, "hp");
type("number")(Mob.prototype, "maxHp");
type("number")(Mob.prototype, "targetX");
type("number")(Mob.prototype, "targetY");

// Define game state schema
class GameState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.mobs = new MapSchema();
    this.tick = 0;
  }
}

// Define type decorators for GameState
type({ map: Player })(GameState.prototype, "players");
type({ map: Mob })(GameState.prototype, "mobs");
type("number")(GameState.prototype, "tick");

class BattleRoom extends Room {
  onCreate(options) {
    console.log("🎮 Battle Room Created!");
    
    // Initialize game state with Schema
    this.setState(new GameState());
    
    // World constants
    this.WORLD_WIDTH = 4000;
    this.WORLD_HEIGHT = 3000;
    
    // Spawn initial mobs
    this.spawnMobs(80);
    
    // ✅ REGISTER MESSAGE HANDLERS (Colyseus 0.15 style)
    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      // Update player position and angle with bounds checking
      player.x = Math.max(30, Math.min(this.WORLD_WIDTH - 30, message.x));
      player.y = Math.max(30, Math.min(this.WORLD_HEIGHT - 30, message.y));
      player.angle = message.angle;
      
      console.log(`📍 Player ${client.sessionId} moved to ${Math.round(player.x)}, ${Math.round(player.y)}`);
    });
    
    this.onMessage("attack", (client, message) => {
      this.handleAttack(client.sessionId, message.targetId, message.targetType);
    });
    
    this.onMessage("input", (client, message) => {
      // Reserved for future use
    });
    
    this.onMessage("update_allies", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      
      // Flatten ally array: [x1,y1,a1, x2,y2,a2, ...]
      const flat = [];
      if (message.allies && Array.isArray(message.allies)) {
        message.allies.forEach(ally => {
          flat.push(ally.x, ally.y, ally.angle);
        });
      }
      
      player.allyData = flat;
    });
    
    // Game loop - 20 updates per second
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);
    
    // Spawn more mobs periodically
    this.mobSpawnTimer = this.clock.setInterval(() => {
      this.spawnMobs(5);
    }, 3000);
  }
  
  onJoin(client, options) {
    console.log(`✅ Player ${client.sessionId} joined`);
    
    // Create new player with Schema
    const player = new Player(
      this.WORLD_WIDTH / 2 + (Math.random() - 0.5) * 500,
      this.WORLD_HEIGHT / 2 + (Math.random() - 0.5) * 500
    );
    
    this.state.players.set(client.sessionId, player);
    
    // Send initial state to client
    client.send("init", {
      playerId: client.sessionId,
      worldWidth: this.WORLD_WIDTH,
      worldHeight: this.WORLD_HEIGHT
    });
  }
  
  onLeave(client, consented) {
    console.log(`❌ Player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }
  
  onDispose() {
    console.log("🛑 Battle Room Disposed");
    this.mobSpawnTimer.clear();
  }
  
  // Game loop
  update(deltaTime) {
    this.state.tick++;
    
    // Update mobs AI (simple random movement)
    this.state.mobs.forEach((mob, mobId) => {
      // Simple random walk
      if (!mob.targetX || Math.random() < 0.01) {
        mob.targetX = Math.random() * this.WORLD_WIDTH;
        mob.targetY = Math.random() * this.WORLD_HEIGHT;
      }
      
      // Move toward target
      const dx = mob.targetX - mob.x;
      const dy = mob.targetY - mob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 5) {
        const speed = 50 * (deltaTime / 1000);
        mob.x += (dx / dist) * speed;
        mob.y += (dy / dist) * speed;
      }
      
      // Keep in bounds
      mob.x = Math.max(30, Math.min(this.WORLD_WIDTH - 30, mob.x));
      mob.y = Math.max(30, Math.min(this.WORLD_HEIGHT - 30, mob.y));
    });
  }
  
  spawnMobs(count) {
    for (let i = 0; i < count; i++) {
      const mobId = `mob_${Date.now()}_${Math.random()}`;
      const mob = new Mob(
        Math.random() * this.WORLD_WIDTH,
        Math.random() * this.WORLD_HEIGHT
      );
      this.state.mobs.set(mobId, mob);
    }
  }
  
  handleAttack(attackerId, targetId, targetType) {
    const attacker = this.state.players.get(attackerId);
    if (!attacker) return;
    
    let damage = 20; // Hero base damage
    let target = null;
    
    if (targetType === 'mob') {
      target = this.state.mobs.get(targetId);
      if (!target) return; // Already dead
      if (target.hp <= 0) return; // Already dying
      
      target.hp -= damage;
      
      // Broadcast damage event
      this.broadcast("damage", {
        targetId: targetId,
        targetType: 'mob',
        damage: damage,
        newHp: target.hp
      });
      
      // Mob died
      if (target.hp <= 0) {
        this.state.mobs.delete(targetId);
        attacker.kills++;
        
        this.broadcast("mob_killed", {
          mobId: targetId,
          killerId: attackerId,
          newKillCount: attacker.kills
        });
      }
    } 
    else if (targetType === 'player') {
      target = this.state.players.get(targetId);
      if (!target) return;
      if (target.hp <= 0) return; // Already dead
      
      target.hp -= damage;
      
      this.broadcast("damage", {
        targetId: targetId,
        targetType: 'player',
        damage: damage,
        newHp: target.hp
      });
      
      // Player died
      if (target.hp <= 0) {
        attacker.kills++;
        
        this.broadcast("player_killed", {
          playerId: targetId,
          killerId: attackerId
        });
        
        // Respawn after delay
        setTimeout(() => {
          if (this.state.players.has(targetId)) {
            const deadPlayer = this.state.players.get(targetId);
            deadPlayer.hp = deadPlayer.maxHp;
            deadPlayer.x = this.WORLD_WIDTH / 2 + (Math.random() - 0.5) * 500;
            deadPlayer.y = this.WORLD_HEIGHT / 2 + (Math.random() - 0.5) * 500;
            
            this.broadcast("player_respawned", {
              playerId: targetId
            });
          }
        }, 3000);
      }
    }
  }
}

module.exports = { BattleRoom };