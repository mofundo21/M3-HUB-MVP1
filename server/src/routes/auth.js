const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

const router = express.Router();

// Derive a stable PKG from email so the same user always gets the same PKG
// (until a real DB is wired up). Format: first 2 chars of local + 4-digit hash
function derivePkg(email) {
  const local = email.split('@')[0].replace(/[^a-zA-Z]/g, '') || 'MB';
  const prefix = local.slice(0, 2).toUpperCase();
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash + email.charCodeAt(i)) | 0;
  }
  const num = String(Math.abs(hash) % 10000).padStart(4, '0');
  return prefix + num;
}
 
// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
 
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing fields' });
    }
 
    // TODO: Hash password, save to DB
    const pkg = derivePkg(email);
    const token = jwt.sign({ email, username, pkg }, JWT_SECRET, { expiresIn: '7d' });
 
    console.log(`[AUTH] User registered: ${email}`);
    res.json({ token, user: { email, username, pkg } });
  } catch (e) {
    console.error('[AUTH] Register error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
 
// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
 
    // TODO: Check password against hashed DB password
    const pkg = derivePkg(email);
    const username = email.split('@')[0];
    const token = jwt.sign({ email, username, pkg, isGuest: false }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[AUTH] User logged in: ${email}`);
    res.json({ token, user: { email, username, pkg, isGuest: false } });
  } catch (e) {
    console.error('[AUTH] Login error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
 
// Guest Login
router.post('/guest', async (req, res) => {
  try {
    console.log('[AUTH] Guest login attempt');
    
    // Generate random guest ID
    const guestId = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, '0');
    
    const pkg = 'GS' + guestId;
    const username = 'Guest' + guestId;
    
    // Create token with guest flag
    const token = jwt.sign(
      { pkg, username, isGuest: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
 
    console.log(`[AUTH] Guest created: ${pkg}`);
    
    res.json({
      token,
      user: { pkg, username, isGuest: true }
    });
  } catch (e) {
    console.error('[AUTH] Guest login error:', e.message);
    res.status(500).json({ error: e.message });
  }
});
 
module.exports = router;