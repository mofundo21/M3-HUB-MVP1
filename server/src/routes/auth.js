const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generatePkg } = require('../utils/pkgGenerator');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'm3-hub-secret-key-local';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pkg = generatePkg(firstName, lastName);
    const username = pkg; // Default username equals PKG, can be changed later

    const user = User.create({ firstName, lastName, email, password: hashedPassword, pkg, username });

    const token = jwt.sign(
      { userId: user.id, pkg: user.pkg, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: User.safeFields(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, pkg: user.pkg, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: User.safeFields(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/guest
router.post('/guest', (req, res) => {
  try {
    const guestId = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const pkg = `GS${guestId}`;
    const username = `Guest${guestId}`;

    const token = jwt.sign(
      { userId: null, pkg, username, isGuest: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { pkg, username, isGuest: true } });
  } catch (err) {
    console.error('Guest error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/verify - verify JWT and return user info
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

module.exports = router;
