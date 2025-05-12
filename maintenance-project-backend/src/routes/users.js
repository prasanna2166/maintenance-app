const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY flat_number');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new user
router.post('/', async (req, res) => {
  const { name, flat_number } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, flat_number) VALUES ($1, $2) RETURNING *',
      [name, flat_number]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
