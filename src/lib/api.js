import axios from 'axios';

// In production (FE on Vercel, BE on Railway) set VITE_API_URL to your backend
// e.g. https://your-api.up.railway.app
// In dev the Vite proxy forwards /api → localhost:3000, so no env var needed.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let _logout = null;
export function setLogoutHandler(fn) {
  _logout = fn;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('owner');
      if (_logout) {
        _logout();
      } else {
        window.location.href = '/dashboard/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
