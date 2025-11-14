const { Server } = require("@colyseus/core");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const express = require("express");
const cors = require("cors");
const { FFARoom } = require("./rooms/FFARoom");

const port = process.env.PORT || 2567;
const app = express();

// CORS for local development and production
app.use(cors({
  origin: [
    'http://localhost:8000',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://www.euneus.com',
    'https://euneus.com',
    'https://euneus-9c6xjo3vz-jans-projects-e4f89011.vercel.app',
    process.env.CLIENT_URL // For future domain changes
  ],
  credentials: true
}));

app.use(express.json());

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: app.listen(port, () => {
      console.log(`🎮 FFA Server running on port ${port}`);
      console.log(`🌐 WebSocket: ws://localhost:${port}`);
    })
  })
});

// Define game room
gameServer.define("ffa", FFARoom);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    status: "FFA Server Running",
    rooms: gameServer.rooms.size,
    timestamp: Date.now()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});