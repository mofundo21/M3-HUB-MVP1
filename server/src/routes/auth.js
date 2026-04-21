const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb } = require('../utils/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDb();
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pkg = 'PKG' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const user = db.createUser({
      email,
      username,
      password: hashedPassword,
      pkg,
    });

    const token = jwt.sign({ id: user.id, email, username, pkg }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[AUTH] User registered: ${email}`);
    res.json({ token, user: { id: user.id, email, username, pkg } });
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

    const db = getDb();
    const user = db.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, username: user.username, pkg: user.pkg }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[AUTH] User logged in: ${email}`);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, pkg: user.pkg } });
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