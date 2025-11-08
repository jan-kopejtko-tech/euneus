const { Server } = require("@colyseus/core");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const express = require("express");
const cors = require("cors");
const { BattleRoom } = require("./rooms/BattleRoom");

const port = process.env.PORT || 2567;
const app = express();

// Enable CORS for your Vercel domain
app.use(cors({
  origin: [
    'https://euneus-9c6xjo3vz-jans-projects-e4f89011.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Create game server first (before the health check so we can reference it)
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: app.listen(port, () => {
      console.log(`🎮 Euneus Server listening on port ${port}`);
      console.log(`🌐 WebSocket: ws://localhost:${port}`);
    })
  })
});

// Define game room
gameServer.define("battle", BattleRoom);

// Health check endpoint (after gameServer is defined)
app.get("/", (req, res) => {
  res.json({ 
    status: "Euneus Game Server Running",
    version: "1.0.0",
    rooms: gameServer.rooms.size
  });
});

console.log("✅ Server initialized!");

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});