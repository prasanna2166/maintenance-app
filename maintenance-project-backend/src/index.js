const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const expenseRoutes = require('./routes/expenses');
const summaryRoutes = require('./routes/summary');

app.use(cors());
app.use(express.json());

// Mount all routes BEFORE starting the server
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/summary', summaryRoutes);

// Sample route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
