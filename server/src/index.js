const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('colyseus');
const { WebSocketTransport } = require('@colyseus/ws-transport');
const { monitor } = require('@colyseus/monitor');

const authRoutes = require('./routes/auth');
const { HubRoom } = require('./rooms/HubRoom');
const { getDb } = require('./utils/db');

const PORT = process.env.PORT || 3001;

const app = express();

// Update CORS to allow your deployed frontend!
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://bejewelled-quokka-402582.netlify.app'  // ← ADD THIS LINE
  ],
  credentials: true,
}));
app.use(express.json());

// Init DB on startup
getDb();

// REST routes
app.use('/api/auth', authRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Colyseus setup
const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ 
    server: httpServer,
    pingInterval: 5000,
    pingTimeout: 10000,
  }),
});

gameS