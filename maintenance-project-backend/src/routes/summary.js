const express = require('express');
const router = express.Router();
const pool = require('../db');

const MAINTENANCE_AMOUNT = 1000; // Maintenance amount

// Get the monthly financial summary
router.get('/', async (req, res) => {
  const { month } = req.query;

  // Check if the month query parameter is in the correct format
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Month is required in YYYY-MM format' });
  }

  try {
    const formattedDate = `${month}-01`;  // For example, "2024-03-01"

    // Query to get the total number of paid users in the selected month
    const incomeResult = await pool.query(
      `SELECT COUNT(*) 
       FROM payments 
       WHERE "Date" >= TO_DATE($1, 'YYYY-MM-DD') 
       AND "Date" < TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1 month'
       AND paid = true`,
      [formattedDate]
    );
    const totalIncome = parseInt(incomeResult.rows[0].count) * MAINTENANCE_AMOUNT;

    // Query to get the total expenses in the selected month
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) 
       FROM expenses 
       WHERE "Date" >= TO_DATE($1, 'YYYY-MM-DD') 
       AND "Date" < TO_DATE($1, 'YYYY-MM-DD') + INTERVAL '1 month'`,
      [formattedDate]
    );
    const totalExpenses = parseFloat(expenseResult.rows[0].coalesce);

    // Get the previous month's closing balance for the opening balance of the current month
    const [year, mon] = month.split('-');
    const prevMonth = mon === '01'
      ? `${parseInt(year) - 1}-12`
      : `${year}-${String(mon - 1).padStart(2, '0')}`;

    // Query to get the previous month's closing balance
    const prevBalanceRes = await pool.query(
      `SELECT closing_balance FROM monthly_summary WHERE month = $1`,
      [prevMonth]
    );
    const openingBalance = prevBalanceRes.rows[0]?.closing_balance || 0;

    // Calculate the closing balance for the current month
    const closingBalance = openingBalance + totalIncome - totalExpenses;

    // Store or update the summary in the database
    await pool.query(
      `INSERT INTO monthly_summary (month, opening_balance, income, expenses, closing_balance)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (month) DO UPDATE SET 
       opening_balance = $2, income = $3, expenses = $4, closing_balance = $5`,
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
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
