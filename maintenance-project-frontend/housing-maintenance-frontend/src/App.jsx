import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Residents from './pages/Residents';
import Summary from './pages/Summary';
import Login from './pages/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-emerald-100 to-yellow-100 text-gray-800">
        <header className="bg-blue-600 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">🏠 Housing Dashboard</h1>
            {isAuthenticated && (
              <nav className="space-x-4">
                <Link className="hover:underline" to="/">Residents</Link>
                <Link className="hover:underline" to="/summary">Monthly Summary</Link>
                <button onClick={handleLogout} className="ml-4 underline text-white">Logout</button>
              </nav>
            )}
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8 mt-6 bg-white rounded-xl shadow-lg">
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated
                  ? <Navigate to="/" />
                  : <Login onLogin={(t, r) => { setToken(t); setRole(r); }} />
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated
                  ? <Residents />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/summary"
              element={
                isAuthenticated
                  ? <Summary isAdmin={isAdmin} />
                  : <Navigate to="/login" />
              }
            />
            {/* catch-all */}
            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
