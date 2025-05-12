import { useEffect, useState } from 'react';
import api from '../api';

function Residents() {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [year, setYear] = useState('2025'); // Default year

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

        console.log('API Response - Users:', userRes.data);
        console.log('API Response - Payments:', paymentRes.data);

        setUsers(userRes.data);
        setPayments(paymentRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch residents data. Check console logs.');
      }
    };

    fetchData();
  }, [year]);

  const isPaid = (userId, month) => {
    return payments.some((p) => p.user_id === userId && p.month.startsWith(month) && p.paid);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Residents Maintenance Status
        </h2>

        {/* Year Selector */}
        <div className="mb-6">
          <label className="mr-2 text-lg font-medium">Select Year: </label>
          <select
            className="border border-gray-300 rounded-md px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden shadow-lg rounded-xl bg-white">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Flat</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              {months.map((m) => (
                <th key={m} className="px-4 py-3 text-center font-semibold">{m.slice(5)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100 transition-colors">
                <td className="border px-4 py-3 font-semibold text-gray-700 bg-blue-50 hover:bg-blue-100">
                  <span className="font-bold">{user.flat_number}</span>
                </td>
                <td className="border px-4 py-3 font-medium text-blue-600 hover:text-blue-800">
                  <span className="font-bold">{user.name}</span>
                </td>
                {months.map((month) => (
                  <td key={month} className="border px-4 py-3 text-center">
                    <span
                      className={`inline-block w-6 h-6 rounded-full ${
                        isPaid(user.id, month)
                          ? 'bg-green-400 text-white'
                          : 'bg-red-400 text-white'
                      }`}
                    >
                      {isPaid(user.id, month) ? '✔' : '✘'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Residents;
