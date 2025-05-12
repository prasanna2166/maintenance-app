const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /payments?year=2025 - Retrieve payments for a specific year
router.get('/', async (req, res) => {
  const { year } = req.query;

  try {
    const result = await pool.query(
      `SELECT user_id, TO_CHAR(month, 'YYYY-MM-DD') AS month, paid 
       FROM payments 
       WHERE EXTRACT(YEAR FROM month) = $1 
       ORDER BY month, user_id`,
      [year]
    );

    console.log('Fetched Payments:', result.rows); // Debugging
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).send('Server error');
  }
});

// POST /payments - Insert or toggle paid status
router.post('/', async (req, res) => {
  try {
    const { user_id, month, paid } = req.body;

    // Ensure the month is in the correct format: 'YYYY-MM-DD'
    const formattedMonth = `${month.slice(0, 7)}-01`;

    console.log('Received Payment Update:', { user_id, month: formattedMonth, paid });

    // Insert or update payment ensuring the date format is correct
    const result = await pool.query(
      `
      INSERT INTO payments (user_id, month, paid)
      VALUES ($1, $2::DATE, $3)
      ON CONFLICT (user_id, month)
      DO UPDATE SET paid = EXCLUDED.paid
      RETURNING user_id, TO_CHAR(month, 'YYYY-MM-DD') AS month, paid;
      `,
      [user_id, formattedMonth, paid]
    );

    console.log('Payment updated or inserted:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).send('Server error');
  }
});

// PUT /payments/:id - Update payment status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { paid } = req.body;

    console.log('Updating Payment:', { id, paid });

    const result = await pool.query(
      `
      UPDATE payments 
      SET paid = $1 
      WHERE id = $2 
      RETURNING user_id, TO_CHAR(month, 'YYYY-MM-DD') AS month, paid;
      `,
      [paid, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    console.log('Payment updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
