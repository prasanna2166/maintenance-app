import { useState, useEffect } from 'react';
import api from '../api';

function Summary({ isAdmin }) {
  const [year, setYear] = useState('2025');
  const [month, setMonth] = useState('01');
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [flats, setFlats] = useState([]);

  // Admin form states
  const [newExpense, setNewExpense] = useState({ amount: '', description: '', date: '' });
  const [newPayment, setNewPayment] = useState({ flat_number: '', amount: '', description: '', annual: false });

  const months = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  useEffect(() => {
    const m = `${year}-${month}`;
    async function fetchData() {
      try {
        const [summaryRes, expensesRes, incomeRes, usersRes] = await Promise.all([
          api.get('/summary', { params: { month: m } }),
          api.get('/expenses', { params: { month: m } }),
          api.get('/payments', { params: { month: m } }),
          api.get('/users'),
        ]);

        setOpeningBalance(summaryRes.data.openingBalance);
        setClosingBalance(summaryRes.data.closingBalance);
        setExpenses(expensesRes.data);
        setIncome(incomeRes.data);
        setFlats(usersRes.data.map(u => u.flat_number));
      } catch (err) {
        console.error('Error fetching summary:', err);
        alert('Failed to load summary.');
      }
    }

    fetchData();
  }, [year, month]);

  const submitExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', newExpense);
      setNewExpense({ amount: '', description: '', date: '' });
      const res = await api.get('/expenses', { params: { month: `${year}-${month}` } });
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to add expense');
    }
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        ...newPayment,
        month: `${year}-${month}-01`,
        paid: true,
      });
      setNewPayment({ flat_number: '', amount: '', description: '', annual: false });

      // Refresh summary, income and balance
      const m = `${year}-${month}`;
      const [summaryRes, incomeRes] = await Promise.all([
        api.get('/summary', { params: { month: m } }),
        api.get('/payments', { params: { month: m } }),
      ]);
      setOpeningBalance(summaryRes.data.openingBalance);
      setClosingBalance(summaryRes.data.closingBalance);
      setIncome(incomeRes.data);
    } catch (err) {
      console.error(err);
      alert('Failed to record payment');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-center">Monthly Summary</h2>

      <div className="flex justify-center space-x-4">
        <select value={year} onChange={(e) => setYear(e.target.value)} className="border px-3 py-1 rounded">
          {['2023', '2024', '2025', '2026'].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} className="border px-3 py-1 rounded">
          {months.map((m) => (
            <option key={m} value={m}>
              {new Date(0, Number(m) - 1).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center space-x-8">
        <div className="bg-white p-4 rounded shadow w-48 text-center">
          <p className="font-medium">Opening</p>
          <p className="text-xl">{openingBalance}</p>
        </div>
        <div className="bg-white p-4 rounded shadow w-48 text-center">
          <p className="font-medium">Closing</p>
          <p className="text-xl">{closingBalance}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-6">
          <form onSubmit={submitExpense} className="bg-red-50 p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Add Expense</h3>
            <input
              type="date"
              className="w-full mb-2 border rounded px-2 py-1"
              value={newExpense.date}
              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              className="w-full mb-2 border rounded px-2 py-1"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full mb-2 border rounded px-2 py-1"
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
            <button type="submit" className="w-full bg-red-600 text-white py-1 rounded hover:bg-red-700">
              Submit Expense
            </button>
          </form>

          <form onSubmit={submitPayment} className="bg-green-50 p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Record Payment</h3>
            <select
              className="w-full mb-2 border rounded px-2 py-1"
              value={newPayment.flat_number}
              onChange={(e) => setNewPayment({ ...newPayment, flat_number: e.target.value })}
              required
            >
              <option value="">Select Flat</option>
              {flats.map((flat) => (
                <option key={flat} value={flat}>{flat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              className="w-full mb-2 border rounded px-2 py-1"
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description"
              className="w-full mb-2 border rounded px-2 py-1"
              value={newPayment.description}
              onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
            />
            <label className="inline-flex items-center mb-2">
              <input
                type="checkbox"
                className="mr-2"
                checked={newPayment.annual}
                onChange={(e) => setNewPayment({ ...newPayment, annual: e.target.checked })}
              />
              Annual Payment
            </label>
            <button type="submit" className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700">
              Record Payment
            </button>
          </form>
        </div>
      )}

      <div className="overflow-auto bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Income for {month}-{year}</h3>
        <table className="min-w-full table-auto">
          <thead className="bg-green-100">
            <tr>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {income.length > 0 ? (
              income.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-100">
                  <td className="px-2 py-1">{inc.date}</td>
                  <td className="px-2 py-1">{inc.amount}</td>
                  <td className="px-2 py-1">{inc.description}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center py-2">No income recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-auto bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Expenses for {month}-{year}</h3>
        <table className="min-w-full table-auto">
          <thead className="bg-red-100">
            <tr>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-100">
                  <td className="px-2 py-1">{exp.date}</td>
                  <td className="px-2 py-1">{exp.amount}</td>
                  <td className="px-2 py-1">{exp.description}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center py-2">No expenses recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Summary;
