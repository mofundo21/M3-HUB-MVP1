const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('colyseus');
const { WebSocketTransport } = require('@colyseus/ws-transport');
const { monitor } = require('@colyseus/monitor');

const authRoutes = require('./routes/auth');
const mcpRoutes = require('./routes/mcp');
const MCPService = require('./services/MCPService');
const { HubRoom } = require('./rooms/HubRoom');
const { getDb } = require('./utils/db');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

getDb();
MCPService.initialize().catch(console.error);

// ─── REST API Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/mcp', mcpRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── HTTP Server Setup ────────────────────────────────────────────────────
const httpServer = http.createServer(app);

// ─── Colyseus Server Setup ─────────────────────────────────────────────────
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
    pingInterval: 15000,
    pingTimeout: 30000,
  }),
  graceTimeout: 120000,
});

gameServer.define('hub', HubRoom);

// ─── Colyseus Monitor ──────────────────────────────────────────────────────
app.use('/colyseus', monitor());

// ─── Start Server ──────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 M3 Hub Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Colyseus WebSocket: wss://m3-hub-mvp1-production.up.railway.app`);
  console.log(`   Colyseus monitor: http://localhost:${PORT}/colyseus`);
  console.log(`   Health check:     http://localhost:${PORT}/health\n`);
});