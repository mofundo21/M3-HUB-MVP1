const { Room } = require('colyseus');
const { HubRoomState, PlayerState } = require('./RoomState');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'm3-hub-secret-key-local';

// Spawn positions spread around the hub
function randomSpawn() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 4;
  return {
    x: Math.cos(angle) * radius,
    y: 0,
    z: Math.sin(angle) * radius,
  };
}

class HubRoom extends Room {
  onCreate(options) {
    this.setState(new HubRoomState());
    this.setSimulationInterval(() => this.update(), 50); // 20hz

    this.onMessage('move', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (typeof data.x === 'number') player.x = data.x;
      if (typeof data.y === 'number') player.y = data.y;
      if (typeof data.z === 'number') player.z = data.z;
      if (typeof data.rotY === 'number') player.rotY = data.rotY;
    });

    this.onMessage('zone', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (typeof data.zone === 'string') player.zone = data.zone;
    });

    console.log('[HubRoom] Created, roomId:', this.roomId);
  }

  onAuth(client, options) {
    // Allow guest login without token
    if (!options || !options.token) {
      console.log('[HubRoom] Guest login (no token)');
      return { username: 'Guest', pkg: 'GUEST', isGuest: true };
    }
    
    try {
      const decoded = jwt.verify(options.token, JWT_SECRET);
      console.log('[HubRoom] Authenticated user:', decoded.username);
      return decoded;
    } catch (e) {
      console.error('[HubRoom] Auth failed:', e.message);
      throw new Error('Invalid token');
    }
  }

  onJoin(client, options, auth) {
    const spawn = randomSpawn();
    const player = new PlayerState();
    player.x = spawn.x;
    player.y = spawn.y;
    player.z = spawn.z;
    player.username = auth.username || 'Unknown';
    player.pkg = auth.pkg || 'XXXX';
    player.isGuest = auth.isGuest || false;
    player.zone = 'hub';

    this.state.players.set(client.sessionId, player);
    console.log(`[HubRoom] ${player.username} (${player.pkg}) joined. Total: ${this.state.players.size}`);
  }

  onLeave(client, consented) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`[HubRoom] ${player.username} left`);
    }
    this.state.players.delete(client.sessionId);
  }

  update() {
    // Server-side tick — currently just a heartbeat placeholder
  }

  onDispose() {
    console.log('[HubRoom] Disposed');
  }
}

module.exports = { HubRoom };