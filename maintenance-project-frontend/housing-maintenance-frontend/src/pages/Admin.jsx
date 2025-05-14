import { useEffect, useState } from 'react';
import api from '../api';

function Admin() {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [year, setYear] = useState('2025');

  const maintenanceAmount = 1000; // Adjust as needed

  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, paymentRes] = await Promise.all([
          api.get('/users'),
          api.get('/payments', { params: { year } }),
        ]);
        setUsers(userRes.data);
        setPayments(paymentRes.data);
      } catch {
        alert('Failed to fetch data.');
      }
    };
    fetchData();
  }, [year]);

  const findPayment = (userId, month) => {
    return payments.find((p) => {
      const paymentMonth = p.month.slice(0, 7); // Ensure YYYY-MM comparison
      return p.user_id === userId && paymentMonth === month;
    });
  };

  const togglePayment = async (userId, month, flatNumber) => {
    const fullDate = `${month}-01`;
    const existingPayment = findPayment(userId, month);
    const newPaid = existingPayment ? !existingPayment.paid : true;

    try {
      await api.post('/payments', {
        user_id: userId,
        month: fullDate,
        paid: newPaid,
        amount: maintenanceAmount,
        flat_number: flatNumber,
      });

      const paymentRes = await api.get('/payments', { params: { year } });
      setPayments(paymentRes.data);
    } catch {
      alert('Failed to update payment status.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin - Update Payment Status</h2>

      <div className="mb-4">
        <label className="mr-2 text-lg font-medium">Select Year:</label>
        <select
          className="border rounded px-2 py-1"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left">Flat</th>
              <th className="border px-4 py-2 text-left">Name</th>
              {months.map((m) => (
                <th key={m} className="border px-2 py-2 text-center">{m.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.flat_number}</td>
                <td className="border px-4 py-2">{user.name}</td>
                {months.map((month) => {
                  const payment = findPayment(user.id, month);
                  const paid = payment?.paid ?? false;
                  return (
                    <td key={month} className="border px-2 py-2 text-center">
                      <button
                        onClick={() => togglePayment(user.id, month, user.flat_number)}
                        className={`text-sm font-medium px-2 py-1 rounded ${
                          paid
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {paid ? '✅ Paid' : '❌ Not Paid'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
