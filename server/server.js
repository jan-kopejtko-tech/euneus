const { Server } = require("@colyseus/core");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const express = require("express");
const cors = require("cors");
const { FFARoom } = require("./rooms/FFARoom");

const port = process.env.PORT || 2567;
const app = express();

// CORS for local development and production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://euneus.com',
      'https://www.euneus.com',
      'https://euneus-9c6xjo3vz-jans-projects-e4f89011.vercel.app',
      process.env.CLIENT_URL
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Create Colyseus server
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: app.listen(port, () => {
      console.log(`ðŸŽ® FFA Server running on port ${port}`);
      console.log(`ðŸŒ WebSocket: ws://localhost:${port}`);
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