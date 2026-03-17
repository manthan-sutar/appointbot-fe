import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setLogoutHandler } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [owner, setOwner] = useState(() => {
    try { return JSON.parse(localStorage.getItem('owner')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('owner');
    setOwner(null);
  }, []);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOwner(null);
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(({ data }) => {
        setOwner(data.owner);
        localStorage.setItem('owner', JSON.stringify(data.owner));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('owner');
        setOwner(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, ownerData) {
    localStorage.setItem('token', token);
    localStorage.setItem('owner', JSON.stringify(ownerData));
    setOwner(ownerData);
  }

  return (
    <AuthContext.Provider value={{ owner, setOwner, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
