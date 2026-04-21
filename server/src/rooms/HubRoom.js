const { Room } = require('colyseus');
const jwt = require('jsonwebtoken');
const { HubRoomState, PlayerState } = require('./RoomState');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class HubRoom extends Room {
  seatReservationTime = 15;

  onCreate(options) {
    this.setState(new HubRoomState());

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

    this.onMessage('chat', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const text = (typeof data.text === 'string' ? data.text : '').slice(0, 50);
      if (text.length === 0) return;
      this.broadcast('chatMessage', {
        sessionId: client.sessionId,
        username: player.username,
        pkg: player.pkg,
        text,
        timestamp: Date.now(),
      });
    });

    this.onMessage('typing', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.isTyping = data.isTyping === true;
      if (data.isTyping) {
        player.lastTypingTime = Date.now();
      }
    });

    // Clean up typing status after 3 seconds of inactivity
    this.typingCleanupInterval = setInterval(() => {
      const now = Date.now();
      this.state.players.forEach((player) => {
        if (player.isTyping && now - player.lastTypingTime > 3000) {
          player.isTyping = false;
        }
      });
    }, 1000);
  }

  onAuth(client, options) {
    const token = options.token;
    if (!token) throw new Error('No token provided');

    // Allow guest token for demo
    if (token === 'guest-token') {
      return { username: 'Guest', isGuest: true };
    }

    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      throw new Error('Invalid or expired token');
    }
  }

  onJoin(client, options, auth) {
    const player = new PlayerState();
    player.username = auth.username || 'Unknown';
    player.pkg = auth.pkg || '';
    player.isGuest = auth.isGuest || false;
    player.x = (Math.random() - 0.5) * 4;
    player.y = 0;
    player.z = (Math.random() - 0.5) * 4;
    this.state.players.set(client.sessionId, player);
    console.log(`[HubRoom] ${player.username} joined (${client.sessionId})`);
  }

  onLeave(client, consented) {
    const player = this.state.players.get(client.sessionId);
    console.log(`[HubRoom] ${player ? player.username : client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    if (this.typingCleanupInterval) {
      clearInterval(this.typingCleanupInterval);
    }
    console.log('[HubRoom] Disposed');
  }
}

module.exports = { HubRoom };