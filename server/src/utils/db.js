let db = null;
 
function getDb() {
  if (!db) {
    // TODO: Initialize real database (MongoDB, PostgreSQL, etc)
    console.log('[DB] Database initialized (mock)');
    db = { connected: true };
  }
  return db;
}
 
module.exports = { getDb };