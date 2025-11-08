const { Room } = require("@colyseus/core");

class BattleRoom extends Room {
  onCreate(options) {
    console.log("🎮 Battle Room Created!");
    
    // Initialize game state
    this.state = {
      players: {},
      mobs: {},
      tick: 0
    };
    
    // World constants
    this.WORLD_WIDTH = 4000;
    this.WORLD_HEIGHT = 3000;
    
    // Spawn initial mobs
    this.spawnMobs(80);
    
    // Game loop - 20 updates per second
    this.setSimulationInterval((deltaTime) => this.update(deltaTime), 50);
    
    // Spawn more mobs periodically
    this.mobSpawnTimer = this.clock.setInterval(() => {
      this.spawnMobs(5);
    }, 3000);
  }
  
  onJoin(client, options) {
    console.log(`✅ Player ${client.sessionId} joined`);
    
    // Create new player
    const player = {
      id: client.sessionId,
      x: this.WORLD_WIDTH / 2 + (Math.random() - 0.5) * 500,
      y: this.WORLD_HEIGHT / 2 + (Math.random() - 0.5) * 500,
      angle: 0,
      hp: 100,
      maxHp: 100,
      kills: 0,
      army: [] // Will store {type: 'knight'/'archer', hp, maxHp, damage}
    };
    
    this.state.players[client.sessionId] = player;
    
    // Send initial state to client
    client.send("init", {
      playerId: client.sessionId,
      worldWidth: this.WORLD_WIDTH,
      worldHeight: this.WORLD_HEIGHT
    });
  }
  
  onMessage(client, type, message) {
    const player = this.state.players[client.sessionId];
    if (!player) return;
    
    switch(type) {
      case "move":
        // Update player position and angle
        player.x = Math.max(30, Math.min(this.WORLD_WIDTH - 30, message.x));
        player.y = Math.max(30, Math.min(this.WORLD_HEIGHT - 30, message.y));
        player.angle = message.angle;
        break;
        
      case "attack":
        // Client is attacking - server validates and calculates damage
        this.handleAttack(client.sessionId, message.targetId, message.targetType);
        break;
        
      case "spawn_ally":
        // Player killed a mob and wants to spawn an ally
        if (player.kills >= message.killThreshold) {
          const ally = {
            type: message.type, // 'knight' or 'archer'
            hp: message.type === 'knight' ? 10 : 5,
            maxHp: message.type === 'knight' ? 10 : 5,
            damage: message.type === 'knight' ? 5 : 2.5
          };
          player.army.push(ally);
        }
        break;
    }
  }
  
  onLeave(client, consented) {
    console.log(`❌ Player ${client.sessionId} left`);
    delete this.state.players[client.sessionId];
  }
  
  onDispose() {
    console.log("🛑 Battle Room Disposed");
    this.mobSpawnTimer.clear();
  }
  
  // Game loop
  update(deltaTime) {
    this.state.tick++;
    
    // Update mobs AI (simple random movement)
    for (let mobId in this.state.mobs) {
      const mob = this.state.mobs[mobId];
      
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
    }
  }
  
  spawnMobs(count) {
    for (let i = 0; i < count; i++) {
      const mobId = `mob_${Date.now()}_${Math.random()}`;
      this.state.mobs[mobId] = {
        id: mobId,
        x: Math.random() * this.WORLD_WIDTH,
        y: Math.random() * this.WORLD_HEIGHT,
        hp: 30,
        maxHp: 30,
        targetX: Math.random() * this.WORLD_WIDTH,
        targetY: Math.random() * this.WORLD_HEIGHT
      };
    }
  }
  
  handleAttack(attackerId, targetId, targetType) {
    const attacker = this.state.players[attackerId];
    if (!attacker) return;
    
    let damage = 20; // Hero base damage
    let target = null;
    
    if (targetType === 'mob') {
      target = this.state.mobs[targetId];
      if (!target) return;
      
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
        delete this.state.mobs[targetId];
        attacker.kills++;
        
        this.broadcast("mob_killed", {
          mobId: targetId,
          killerId: attackerId,
          newKillCount: attacker.kills
        });
      }
    } 
    else if (targetType === 'player') {
      target = this.state.players[targetId];
      if (!target) return;
      
      target.hp -= damage;
      
      this.broadcast("damage", {
        targetId: targetId,
        targetType: 'player',
        damage: damage,
        newHp: target.hp
      });
      
      // Player died
      if (target.hp <= 0) {
        this.broadcast("player_killed", {
          playerId: targetId,
          killerId: attackerId
        });
      }
    }
    else if (targetType === 'unit') {
      // Attacking another player's army unit
      const [targetPlayerId, unitIndex] = targetId.split('_');
      const targetPlayer = this.state.players[targetPlayerId];
      
      if (targetPlayer && targetPlayer.army[unitIndex]) {
        const unit = targetPlayer.army[unitIndex];
        unit.hp -= damage;
        
        this.broadcast("damage", {
          targetId: targetId,
          targetType: 'unit',
          damage: damage,
          newHp: unit.hp
        });
        
        // Unit died
        if (unit.hp <= 0) {
          targetPlayer.army.splice(unitIndex, 1);
          
          this.broadcast("unit_killed", {
            unitId: targetId,
            killerId: attackerId
          });
        }
      }
    }
  }
}

module.exports = { BattleRoom };