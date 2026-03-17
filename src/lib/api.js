import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
