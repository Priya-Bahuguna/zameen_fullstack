import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('zameen_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('zameen_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    localStorage.setItem('zameen_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { user, token } = res.data;
    localStorage.setItem('zameen_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('zameen_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const saveProperty = async (propertyId) => {
    if (!user) return false;
    const res = await api.post(`/auth/save-property/${propertyId}`);
    setUser(prev => ({ ...prev, savedProperties: res.data.savedProperties }));
    return res.data.saved;
  };

  const isPropertySaved = (propertyId) => {
    return user?.savedProperties?.includes(propertyId);
  };

  const updateUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveProperty, isPropertySaved, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
