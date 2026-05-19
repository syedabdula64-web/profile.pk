import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('ppk_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('ppk_user', JSON.stringify(data.user));
      }
    } catch {
      localStorage.removeItem('ppk_token');
      localStorage.removeItem('ppk_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('ppk_token', data.token);
    localStorage.setItem('ppk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, username, email, password) => {
    const { data } = await api.post('/auth/register', { name, username, email, password });
    localStorage.setItem('ppk_token', data.token);
    localStorage.setItem('ppk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('ppk_token');
    localStorage.removeItem('ppk_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    const stored = JSON.parse(localStorage.getItem('ppk_user') || '{}');
    localStorage.setItem('ppk_user', JSON.stringify({ ...stored, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
