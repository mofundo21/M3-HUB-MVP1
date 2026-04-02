const { Room, Client } = require('colyseus');
const jwt = require('jsonwebtoken');
const { Schema, MapSchema, type } = require('@colyseus/schema');
 
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
 
class PlayerState extends Schema {
  constructor(username, pkg) {
    super();
    this.username = username;
    this.pkg = pkg;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }
}
type('string')(PlayerState.prototype, 'username');
type('string')(PlayerState.prototype, 'pkg');
type('number')(PlayerState.prototype, 'x');
type('number')(PlayerState.prototype, 'y');
type('number')(PlayerState.prototype, 'z');
 
class HubRoomState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}
type(MapSchema)(HubRoomState.prototype, 'players', PlayerState);
 
class HubRoom extends Room {
  onCreate(options) {
    console.log('[HubRoom] Room created');
    this.setState(new HubRoomState());
  }
 
  onAuth(client, options) {
    console.log('[HubRoom] onAuth called with options:', options);
    
    if (!options || !options.token) {
      console.log('[HubRoom] Guest login (no token)');
      return { username: 'Guest', pkg: 'GUEST', isGuest: true };
    }
 
    try {
      const decoded = jwt.verify(options.token, JWT_SECRET);
      console.log('[HubRoom] Token verified for:', decoded.pkg);
      return decoded;
    } catch (e) {
      console.error('[HubRoom] Token verification failed:', e.message);
      throw new Error('Invalid token');
    }
  }
 
  onJoin(client, options) {
    const auth = this.auth;
    const player = new PlayerState(auth.username, auth.pkg);
    
    this.state.players.set(client.sessionId, player);
    
    console.log(`[HubRoom] Player joined: ${auth.pkg} (${client.sessionId})`);
    
    this.broadcast('player-joined', {
      sessionId: client.sessionId,
      username: auth.username,
      pkg: auth.pkg,
    });
  }
 
  onMessage(client, type, message) {
    console.log(`[HubRoom] Message from ${client.sessionId}:`, type);
    
    if (type === 'move') {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.x = message.x || 0;
        player.y = message.y || 0;
        player.z = message.z || 0;
      }
    }
  }
 
  onLeave(client, consented) {
    this.state.players.delete(client.sessionId);
    console.log(`[HubRoom] Player left: ${client.sessionId}`);
    
    this.broadcast('player-left', {
      sessionId: client.sessionId,
    });
  }
 
  onDispose() {
    console.log('[HubRoom] Room disposed');
  }
}
 
module.exports = { HubRoom, HubRoomState, PlayerState };