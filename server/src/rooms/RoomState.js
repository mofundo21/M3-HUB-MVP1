const { Schema, MapSchema, type } = require('@colyseus/schema');

class PlayerState extends Schema {
  constructor() {
    super();
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.rotY = 0;
    this.username = '';
    this.pkg = '';
    this.zone = 'hub';
    this.isGuest = false;
    this.isTyping = false;
    this.lastTypingTime = 0;
    this.avatar = '';
  }
}

type('number')(PlayerState.prototype, 'x');
type('number')(PlayerState.prototype, 'y');
type('number')(PlayerState.prototype, 'z');
type('number')(PlayerState.prototype, 'rotY');
type('string')(PlayerState.prototype, 'username');
type('string')(PlayerState.prototype, 'pkg');
type('string')(PlayerState.prototype, 'zone');
type('boolean')(PlayerState.prototype, 'isGuest');
type('boolean')(PlayerState.prototype, 'isTyping');
type('number')(PlayerState.prototype, 'lastTypingTime');
type('string')(PlayerState.prototype, 'avatar');

class HubRoomState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
  }
}

type({ map: PlayerState })(HubRoomState.prototype, 'players');

module.exports = { HubRoomState, PlayerState };
