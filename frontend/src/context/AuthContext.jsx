import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('church_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem('church_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setAdmin(data.admin);
      localStorage.setItem('church_admin', JSON.stringify(data.admin));
    } catch {
      localStorage.removeItem('church_admin_token');
      localStorage.removeItem('church_admin');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('church_admin_token', data.token);
    localStorage.setItem('church_admin', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore network errors on logout */
    }
    localStorage.removeItem('church_admin_token');
    localStorage.removeItem('church_admin');
    setAdmin(null);
  };

  const isSuperAdmin = admin?.role === 'super_admin';
  const isContentAdmin = admin?.role === 'content_admin';
  const isSundaySchoolAdmin = admin?.role === 'sunday_school_admin';

  return (
    <AuthContext.Provider
      value={{ admin, loading, login, logout, isSuperAdmin, isContentAdmin, isSundaySchoolAdmin, isAuthenticated: !!admin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
