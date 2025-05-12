import { useState, useEffect } from 'react';
import api from '../api';

function MonthlySummary({ isAdmin }) {
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('01');
  const [expenses, setExpenses] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', date: '' });

  const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  const fetchSummaryData = async () => {
    try {
      const formattedMonth = `${year}-${month}`;
      const response = await api.get('/expenses/summary', {
        params: { month: formattedMonth },
      });

      if (response.data) {
        setExpenses(response.data.expenses);
        setOpeningBalance(response.data.openingBalance);
        setClosingBalance(response.data.closingBalance);
      }
    } catch (error) {
      alert('Failed to fetch data. Please try again.');
    }
  };

  useEffect(() => {
    if (year && month) {
      fetchSummaryData();
    }
  }, [year, month]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', newExpense);
      setNewExpense({ amount: '', description: '', date: '' });
      fetchSummaryData(); // Refresh after adding
    } catch (err) {
      alert('Failed to add expense');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Monthly Summary
      </h2>

      <div className="flex justify-center space-x-6 mb-6">
        <div>
          <label className="text-lg font-medium">Select Year: </label>
          <select
            className="border rounded px-4 py-2 text-lg"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        <div>
          <label className="text-lg font-medium">Select Month: </label>
          <select
            className="border rounded px-4 py-2 text-lg"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString('en', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-700">
          Summary for {new Date(year, month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex justify-center space-x-12 mt-4">
          <div className="p-4 bg-white rounded-lg shadow-lg w-1/4">
            <h4 className="text-lg font-medium text-gray-700">Opening Balance</h4>
            <p className="text-2xl text-gray-900">{openingBalance}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-lg w-1/4">
            <h4 className="text-lg font-medium text-gray-700">Closing Balance</h4>
            <p className="text-2xl text-gray-900">{closingBalance}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleExpenseSubmit} className="bg-yellow-50 border rounded p-4 mb-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add New Expense</h3>
          <div className="flex space-x-4 mb-4">
            <input
              type="number"
              placeholder="Amount"
              className="border rounded px-3 py-2 w-1/4"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              className="border rounded px-3 py-2 w-1/2"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              required
            />
            <input
              type="date"
              className="border rounded px-3 py-2 w-1/4"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Add Expense
          </button>
        </form>
      )}

      <div className="overflow-hidden shadow-lg rounded-lg bg-white p-4">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Expense Type</th>
              <th className="px-4 py-3 text-left font-semibold">Amount</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((expense, index) => (
                <tr key={index} className="hover:bg-gray-100 transition-colors">
                  <td className="border px-4 py-3">{expense.type || 'General'}</td>
                  <td className="border px-4 py-3">{expense.amount}</td>
                  <td className="border px-4 py-3">{expense.date}</td>
                  <td className="border px-4 py-3">{expense.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center px-4 py-3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlySummary;
