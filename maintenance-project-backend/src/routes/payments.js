const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /payments — insert/toggle payment, log transaction, update summary
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, month, paid, amount, flat_number } = req.body;
    const formattedMonth = `${month.slice(0, 7)}-01`;

    console.log('▶ /api/payments body:', req.body);

    await client.query('BEGIN');

    // 1) Upsert the payments table
    const payRes = await client.query(
      `INSERT INTO payments(user_id, month, paid)
       VALUES($1, $2::DATE, $3)
       ON CONFLICT (user_id, month)
         DO UPDATE SET paid = EXCLUDED.paid
       RETURNING user_id, month, paid;`,
      [user_id, formattedMonth, paid]
    );

    // 2) If marking paid, log a transaction
    if (paid) {
      await client.query(
        `INSERT INTO payment_transactions
           (user_id, flat_number, amount, payment_date, description)
         VALUES ($1, $2, $3, $4::DATE, $5)`,
        [user_id, flat_number, amount, formattedMonth, `Maintenance payment for Flat ${flat_number}`]
      );
      console.log('✔ payment_transactions insert succeeded');

      // 3) Update monthly_summary income & closing_balance
      await client.query(
        `INSERT INTO monthly_summary (month, income, expenses, opening_balance, closing_balance)
         VALUES ($1::DATE, $2, 0, 0, $2)
         ON CONFLICT (month)
         DO UPDATE
           SET income = monthly_summary.income + EXCLUDED.income,
               closing_balance = monthly_summary.closing_balance + EXCLUDED.income;`,
        [formattedMonth, amount]
      );
    }

    await client.query('COMMIT');
    res.json(payRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Payment POST error:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /payments — retrieve payment transactions for a specific month
router.get('/', async (req, res) => {
  const { month } = req.query;
  if (!month) {
    return res.status(400).json({ error: 'Month query parameter is required in YYYY-MM format' });
  }

  const formattedMonth = `${month}-01`;

  try {
    const payments = await pool.query(
      `SELECT user_id, flat_number, amount, payment_date::DATE AS date, description
       FROM payment_transactions
       WHERE payment_date = $1::DATE
       ORDER BY payment_date ASC;`,
      [formattedMonth]
    );
    res.json(payments.rows);
  } catch (err) {
    console.error('Payment GET error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
