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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define('hub', HubRoom);

// Colyseus monitor (admin UI at /colyseus)
app.use('/colyseus', monitor());

gameServer.listen(PORT).then(() => {
  console.log(`\n🚀 M3 Hub Server running on http://localhost:${PORT}`);
  console.log(`   Colyseus monitor: http://localhost:${PORT}/colyseus`);
  console.log(`   Health check:     http://localhost:${PORT}/health\n`);
});
