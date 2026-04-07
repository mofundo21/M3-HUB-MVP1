const { Room } = require('colyseus');
const jwt = require('jsonwebtoken');
const { HubRoomState, PlayerState } = require('./RoomState');
const { JWT_SECRET } = require('../utils/config');

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
  }

  onAuth(client, options) {
    const token = options.token;
    if (!token) throw new Error('No token provided');
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
    console.log('[HubRoom] Disposed');
  }
}

module.exports = { HubRoom };