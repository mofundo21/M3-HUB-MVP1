import { useState, useCallback } from 'react';
import axios from 'axios';

const API =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://m3-hub-mvp1-production.up.railway.app';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const _persist = (token, user) => {
    localStorage.setItem('m3_token', token);
    localStorage.setItem('m3_user', JSON.stringify(user));
    setUser(user);
    setIsAuthenticated(true);
  };

  // identifier = username or email — sent as both so server finds it either way
  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email: identifier,
        username: identifier,
        password,
      });
      _persist(res.data.token, res.data.user);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.error || 'Login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // identifier used as both username and email so server validates correctly
  const register = useCallback(async (identifier, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        username: identifier,
        email: identifier.includes('@') ? identifier : undefined,
        password,
      });
      _persist(res.data.token, res.data.user);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.error || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsGuest = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/api/auth/guest`);
      _persist(res.data.token, res.data.user);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.error || 'Guest login failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('m3_token');
    localStorage.removeItem('m3_user');
    localStorage.removeItem('m3_player_pos');
    setUser(null);
    setIsAuthenticated(false);
    setError('');
  }, []);

  const restoreAuth = useCallback(() => {
    const token = localStorage.getItem('m3_token');
    const raw = localStorage.getItem('m3_user');
    if (token && raw) {
      try {
        const stored = JSON.parse(raw);
        setUser(stored);
        setIsAuthenticated(true);
      } catch {
        logout();
      }
    }
  }, [logout]);

  return {
    user,
    loading,
    error,
    setError,
    isAuthenticated,
    login,
    register,
    loginAsGuest,
    logout,
    restoreAuth,
  };
}
