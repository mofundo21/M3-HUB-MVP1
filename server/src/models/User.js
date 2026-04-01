const { getDb } = require('../utils/db');

const User = {
  create({ firstName, lastName, email, password, pkg, username }) {
    return getDb().createUser({ firstName, lastName, email, password, pkg, username });
  },

  findByEmail(email) {
    return getDb().findUserByEmail(email);
  },

  findById(id) {
    return getDb().findUserById(id);
  },

  findByPkg(pkg) {
    return getDb().findUserByPkg(pkg);
  },

  safeFields(user) {
    const { password, ...safe } = user;
    return safe;
  },
};

module.exports = User;
