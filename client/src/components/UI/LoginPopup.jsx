import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://m3-hub-mvp1-production.up.railway.app';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: '#111',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle = (color) => ({
  width: '100%',
  padding: '11px',
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  fontFamily: 'Courier New, monospace',
  letterSpacing: 1,
  transition: 'background 0.2s',
});

export default function LoginPopup({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/guest`);
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#0d0d14',
        border: '1px solid #ff00ff',
        borderRadius: 10,
        padding: '36px 32px',
        width: 360,
        boxShadow: '0 0 40px rgba(255,0,255,0.2)',
      }}>
        {/* Logo / Title */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff00ff', letterSpacing: 4 }}>
            M3 HUB
          </div>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 2, marginTop: 4 }}>
            MULTIPLAYER EXPERIENCE
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', marginBottom: 24, gap: 8 }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px',
                background: mode === m ? '#ff00ff22' : 'transparent',
                border: `1px solid ${mode === m ? '#ff00ff' : '#333'}`,
                color: mode === m ? '#ff00ff' : '#555',
                borderRadius: 4, cursor: 'pointer',
                fontFamily: 'Courier New, monospace', fontSize: 12,
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={update('firstName')}
                  required
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={update('lastName')}
                  required
                />
              </div>
            )}

            <input
              style={inputStyle}
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={update('email')}
              required
            />

            <input
              style={inputStyle}
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={update('password')}
              required
            />

            {error && (
              <div style={{ color: '#ff4444', fontSize: 12, textAlign: 'center' }}>{error}</div>
            )}

            {mode === 'register' && (
              <div style={{ fontSize: 11, color: '#555', textAlign: 'center' }}>
                Your PKG identifier will be auto-generated from your name
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={btnStyle('#00ffff')}
              onMouseOver={(e) => e.target.style.background = '#00ffff22'}
              onMouseOut={(e) => e.target.style.background = 'transparent'}
            >
              {loading ? '...' : mode === 'login' ? 'ENTER HUB' : 'CREATE ACCOUNT'}
            </button>
          </div>
        </form>

        <div style={{ textAlign: 'center', margin: '16px 0', color: '#333', fontSize: 11 }}>─── OR ───</div>

        <button
          onClick={handleGuest}
          disabled={loading}
          style={btnStyle('#555')}
          onMouseOver={(e) => e.target.style.background = '#ffffff11'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          {loading ? '...' : 'ENTER AS GUEST'}
        </button>
      </div>
    </div>
  );
}