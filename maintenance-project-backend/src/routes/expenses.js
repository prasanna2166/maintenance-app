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
        SELECT id, amount, TO_CHAR(date, 'YYYY-MM-DD') as date, description 
        FROM expenses 
        WHERE TO_CHAR(date, 'YYYY-MM') = $1 
        ORDER BY date DESC
      `;
      values = [month];
    }

    console.log("Fetching expenses for month:", month);
    const result = await pool.query(query, values);

    console.log("Fetched Expenses from DB:", result.rows); // Debugging log
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new expense
router.post('/', async (req, res) => {
  const { description, amount, date } = req.body;
  
  // Validate input
  if (!description || !amount || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    console.log("Adding expense:", { description, amount, date });

    const result = await pool.query(
      'INSERT INTO expenses (description, amount, date) VALUES ($1, $2, $3) RETURNING *',
      [description, amount, date]
    );

    console.log("Expense added successfully:", result.rows[0]); // Debugging log
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error inserting expense:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete an expense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    console.log("Deleted Expense:", result.rows[0]); // Debugging log
    res.json({ message: "Expense deleted successfully", deletedExpense: result.rows[0] });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
