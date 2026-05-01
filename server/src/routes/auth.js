const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDb } = require('../utils/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    if (!USERNAME_RE.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters, letters/numbers/underscore only' });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const db = getDb();

    if (db.findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    if (db.findUserByUsername(username)) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate pkg from username prefix
    const prefix = username.slice(0, 2).toUpperCase();
    const count = db.getNextPkgCount(prefix);
    const pkg = prefix + String(count).padStart(4, '0');

    const user = db.createUser({ email, username, password: hashedPassword, pkg });

    const token = jwt.sign({ id: user.id, email, username, pkg }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`[AUTH] Registered: ${username} (${email})`);
    res.json({ token, user: { id: user.id, email, username, pkg } });
  } catch (e) {
    console.error('[AUTH] Register error:', e.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login — accepts username or email
router.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const db = getDb();
    const user = db.findUserByEmail(identifier) || db.findUserByUsername(identifier);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, pkg: user.pkg },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[AUTH] Login: ${user.username}`);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username, pkg: user.pkg } });
  } catch (e) {
    console.error('[AUTH] Login error:', e.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Guest Login
router.post('/guest', async (req, res) => {
  try {
    const guestId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const pkg = 'GS' + guestId;
    const username = 'Guest' + guestId;

    const token = jwt.sign({ pkg, username, isGuest: true }, JWT_SECRET, { expiresIn: '12h' });

    console.log(`[AUTH] Guest: ${pkg}`);
    res.json({ token, user: { pkg, username, isGuest: true } });
  } catch (e) {
    console.error('[AUTH] Guest error:', e.message);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

module.exports = router;
