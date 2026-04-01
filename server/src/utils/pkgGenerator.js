const { getDb } = require('./db');

/**
 * Generate a PKG identifier from first and last name.
 * Format: FirstInitial + LastInitial + 4-digit zero-padded number
 * Example: "Yeriel Rodriguez" → "YR0001"
 */
function generatePkg(firstName, lastName) {
  const db = getDb();
  const prefix = (firstName[0] + lastName[0]).toUpperCase();
  const count = db.getNextPkgCount(prefix);
  return `${prefix}${String(count).padStart(4, '0')}`;
}

module.exports = { generatePkg };
