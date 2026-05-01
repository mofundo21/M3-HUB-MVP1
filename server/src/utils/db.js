const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DB_PATH = path.join(__dirname, '../../m3hub.json');

let _data = null;

function load() {
  if (_data) return _data;
  if (fs.existsSync(DB_PATH)) {
    try {
      _data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    } catch (_) {
      _data = defaultData();
    }
  } else {
    _data = defaultData();
  }
  return _data;
}

function defaultData() {
  return {
    users: [],
    pkgCounters: {},
    nextId: 1,
  };
}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(_data, null, 2), 'utf8');
}

function getDb() {
  return {
    // Users
    createUser({ firstName, lastName, email, password, pkg, username }) {
      const data = load();
      const user = {
        id: randomUUID(),
        firstName, lastName, email, password, pkg, username,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        consecutiveLoginDays: 1,
        zonesVisited: [],
        avatar: {
          model: 'geometric_1',
          primaryColor: '#00ffff',
          secondaryColor: '#ff00ff',
          accentColor: '#ffff00',
        },
      };
      data.users.push(user);
      save();
      return user;
    },

    findUserByEmail(email) {
      return load().users.find(u => u.email === email) || null;
    },

    findUserByUsername(username) {
      return load().users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
    },

    findUserById(id) {
      return load().users.find(u => u.id === id) || null;
    },

    findUserByPkg(pkg) {
      return load().users.find(u => u.pkg === pkg) || null;
    },

    // Update avatar customization
    updateUserAvatar(userId, avatar) {
      const user = this.findUserById(userId);
      if (user) {
        user.avatar = { ...user.avatar, ...avatar };
        save();
      }
      return user;
    },

    // Update stats
    recordZoneVisit(userId, zoneName) {
      const user = this.findUserById(userId);
      if (user && !user.zonesVisited.includes(zoneName)) {
        user.zonesVisited.push(zoneName);
        save();
      }
      return user;
    },

    // Update login streak
    updateLoginStreak(userId) {
      const user = this.findUserById(userId);
      if (user) {
        const today = new Date().toDateString();
        const lastLogin = new Date(user.lastLoginAt).toDateString();
        user.lastLoginAt = new Date().toISOString();
        if (today !== lastLogin) {
          user.consecutiveLoginDays = (user.consecutiveLoginDays || 0) + 1;
        }
        save();
      }
      return user;
    },

    // PKG counters
    getNextPkgCount(prefix) {
      const data = load();
      if (!data.pkgCounters[prefix]) data.pkgCounters[prefix] = 0;
      data.pkgCounters[prefix]++;
      save();
      return data.pkgCounters[prefix];
    },
  };
}

module.exports = { getDb };
