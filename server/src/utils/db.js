/**
 * Simple JSON file-based store for MVP local dev.
 * No native deps required.
 */
const fs = require('fs');
const path = require('path');

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
        id: data.nextId++,
        firstName, lastName, email, password, pkg, username,
        createdAt: new Date().toISOString(),
      };
      data.users.push(user);
      save();
      return user;
    },

    findUserByEmail(email) {
      return load().users.find(u => u.email === email) || null;
    },

    findUserById(id) {
      return load().users.find(u => u.id === id) || null;
    },

    findUserByPkg(pkg) {
      return load().users.find(u => u.pkg === pkg) || null;
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
