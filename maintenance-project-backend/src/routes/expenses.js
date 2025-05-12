const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all expenses or filter by month (YYYY-MM)
router.get('/', async (req, res) => {
  const { month } = req.query;
  try {
    let query = 'SELECT * FROM expenses ORDER BY date DESC';
    let values = [];

    if (month) {
      query = `
        SELECT * FROM expenses 
        WHERE TO_CHAR(date, 'YYYY-MM') = $1 
        ORDER BY date DESC
      `;
      values = [month];
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new expense
router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3) RETURNING *',
      [description, amount, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


// // Get all expenses or filter by month (YYYY-MM)
// router.get('/', async (req, res) => {
//   const { month } = req.query;
  
//   // Validate the month format (YYYY-MM)
//   if (month && !/^\d{4}-\d{2}$/.test(month)) {
//     return res.status(400).json({ error: 'Month must be in the format YYYY-MM' });
//   }

//   try {
//     let query = 'SELECT * FROM expenses ORDER BY date DESC';
//     let values = [];

//     if (month) {
//       query = `
//         SELECT * FROM expenses 
//         WHERE TO_CHAR(date, 'YYYY-MM') = $1 
//         ORDER BY date DESC
//       `;
//       values = [month];
//     }

//     const result = await pool.query(query, values);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
