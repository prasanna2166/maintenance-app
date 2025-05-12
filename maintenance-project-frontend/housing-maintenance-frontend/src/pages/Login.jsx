import { useState } from 'react';
import api from '../api';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Submitting login request:', { username, password });

      const response = await api.post('/auth/login', { username, password });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        onLogin(response.data.token, response.data.role);
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-96">
        <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block text-gray-600 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
            Login
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
