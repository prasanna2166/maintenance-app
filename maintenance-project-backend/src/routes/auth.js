const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key'; // Replace with a secure key

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log(`Login attempt: username="${username}"`);

    // Fetch user from database
    const result = await pool.query('SELECT username, password, role FROM auth_users WHERE username = $1', [username]);
    const user = result.rows[0];

    // Verify user exists
    if (!user) {
      console.warn(`Login failed: User not found - ${username}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    if (password !== user.password) {
      console.warn(`Login failed: Password mismatch for user - ${username}`);
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    console.log(`Login successful: ${username}`);
    res.json({ token, role: user.role });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

module.exports = router;
