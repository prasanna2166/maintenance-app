const express = require('express');
const router = express.Router();
const pool = require('../db');

const MAINTENANCE_AMOUNT = 1000; // Maintenance amount

// Get the monthly financial summary
router.get('/', async (req, res) => {
  const { month } = req.query;

  // Validate query parameter format
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Month is required in YYYY-MM format' });
  }

  try {
    const formattedMonth = month; // No need for "-01" as payments use 'month' directly

    // Query total paid users in the selected month
    const incomeResult = await pool.query(
      `SELECT COUNT(*) 
       FROM payments 
       WHERE TO_CHAR(month, 'YYYY-MM') = $1 
       AND paid = true`,
      [formattedMonth]
    );
    const totalIncome = parseInt(incomeResult.rows[0].count || 0) * MAINTENANCE_AMOUNT;

    // Query total expenses for the selected month
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_expenses
       FROM expenses 
       WHERE TO_CHAR(date, 'YYYY-MM') = $1`,
      [formattedMonth]
    );
    const totalExpenses = parseFloat(expenseResult.rows[0].total_expenses || 0);

    // Calculate previous month for opening balance reference
    const [year, mon] = month.split('-');
    const prevMonth = mon === '01'
      ? `${parseInt(year) - 1}-12`
      : `${year}-${String(parseInt(mon) - 1).padStart(2, '0')}`;

    // Query previous month's closing balance
    const prevBalanceRes = await pool.query(
      `SELECT closing_balance FROM monthly_summary WHERE month = $1`,
      [prevMonth]
    );
    const openingBalance = prevBalanceRes.rows.length > 0 ? prevBalanceRes.rows[0].closing_balance : 0;

    // Calculate closing balance for the current month
    const closingBalance = openingBalance + totalIncome - totalExpenses;

    // Store or update the summary in the database
    await pool.query(
      `INSERT INTO monthly_summary (month, opening_balance, income, expenses, closing_balance)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (month) DO UPDATE SET 
       opening_balance = EXCLUDED.opening_balance, 
       income = EXCLUDED.income, 
       expenses = EXCLUDED.expenses, 
       closing_balance = EXCLUDED.closing_balance`,
      [month, openingBalance, totalIncome, totalExpenses, closingBalance]
    );

    // Return the summary data
    res.json({
      month,
      openingBalance,
      totalIncome,
      totalExpenses,
      closingBalance,
    });

    console.log(`Summary for ${month} retrieved successfully.`);
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
