import axios from 'axios';

// Ensure baseURL matches the backend's route structure
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjusted to align with backend routes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to every request except login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.url.includes('/auth/login')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
