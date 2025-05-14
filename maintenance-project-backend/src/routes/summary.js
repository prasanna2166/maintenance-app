const express = require('express');
const router = express.Router();
const pool = require('../db');

const MAINTENANCE_AMOUNT = 1000; // your flat-rate, if still used elsewhere

// GET /api/summary?month=YYYY-MM
router.get('/', async (req, res) => {
  const { month } = req.query;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Month is required in YYYY-MM format' });
  }

  try {
    // === 1) Summary calculation ===
    // Total income from payments table
    const incomeResult = await pool.query(
      `SELECT COUNT(*) AS count
         FROM payments
        WHERE TO_CHAR(month, 'YYYY-MM') = $1
          AND paid = true;`,
      [month]
    );
    const totalIncome = parseInt(incomeResult.rows[0].count, 10) * MAINTENANCE_AMOUNT;

    // Total expenses from expenses table
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total
         FROM expenses
        WHERE TO_CHAR(date, 'YYYY-MM') = $1;`,
      [month]
    );
    const totalExpenses = parseFloat(expenseResult.rows[0].total);

    // Prior closing balance
    const [y, m] = month.split('-');
    const prevMonth = m === '01'
      ? `${y - 1}-12`
      : `${y}-${String(Number(m) - 1).padStart(2,'0')}`;
    const prevBalRes = await pool.query(
      `SELECT closing_balance
         FROM monthly_summary
        WHERE month = $1;`,
      [prevMonth]
    );
    const openingBalance = prevBalRes.rows[0]?.closing_balance || 0;
    const closingBalance = openingBalance + totalIncome - totalExpenses;

    // Upsert summary
    await pool.query(
      `INSERT INTO monthly_summary (month, opening_balance, income, expenses, closing_balance)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (month) DO UPDATE
         SET opening_balance = EXCLUDED.opening_balance,
             income          = EXCLUDED.income,
             expenses        = EXCLUDED.expenses,
             closing_balance = EXCLUDED.closing_balance;`,
      [month, openingBalance, totalIncome, totalExpenses, closingBalance]
    );

    // === 2) Fetch all expense transactions ===
    const expensesRes = await pool.query(
      `SELECT id,
              amount,
              TO_CHAR(date,'YYYY-MM-DD') AS date,
              description
         FROM expenses
        WHERE TO_CHAR(date,'YYYY-MM') = $1
        ORDER BY date DESC;`,
      [month]
    );

    // === 3) Fetch all payment transactions ===
    const paymentsRes = await pool.query(
      `SELECT id,
              amount,
              TO_CHAR(payment_date,'YYYY-MM-DD') AS date,
              description
         FROM payment_transactions
        WHERE TO_CHAR(payment_date,'YYYY-MM') = $1
        ORDER BY payment_date DESC;`,
      [month]
    );

    // Combine into one array, tagging each record
    const transactions = [
      ...paymentsRes.rows.map(r => ({ ...r, type: 'Income' })),
      ...expensesRes.rows.map(r => ({ ...r, type: 'Expense' }))
    ].sort((a,b) => b.date.localeCompare(a.date));

    // === 4) Return everything ===
    res.json({
      month,
      openingBalance,
      totalIncome,
      totalExpenses,
      closingBalance,
      transactions
    });

  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
