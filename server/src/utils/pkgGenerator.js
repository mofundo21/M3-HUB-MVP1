/**
 * Generate a PKG identifier from first and last name.
 * Format: FirstInitial + LastInitial + 4-digit zero-padded number
 * Example: "Yeriel Rodriguez" → "YR0001"
 *
 * NOTE: The counter is in-memory only (resets on server restart) until
 * a real DB is wired up. Replace pkgCounts with a DB-backed counter then.
 */
const pkgCounts = {};

function generatePkg(firstName, lastName) {
  const prefix = (firstName[0] + lastName[0]).toUpperCase();
  pkgCounts[prefix] = (pkgCounts[prefix] || 0) + 1;
  return `${prefix}${String(pkgCounts[prefix]).padStart(4, '0')}`;
}

module.exports = { generatePkg };
