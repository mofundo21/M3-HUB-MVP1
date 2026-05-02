import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://m3-hub-mvp1-production.up.railway.app';

export default function LoginPopup({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email: username, username, password });
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { username, password });
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
    console.log('[LoginPopup] Attempting guest login to:', `${API_BASE_URL}/api/auth/guest`);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/guest`);
      console.log('[LoginPopup] GUEST LOGIN SUCCESS', res.status, res.data);
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      console.error('[LoginPopup] GUEST LOGIN FAILED', err.response?.status, err.response?.data || err.message);
      setError(`Guest login failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  };

  const boxStyle = {
    background: '#1a1a2e', border: '1px solid #444', borderRadius: 12,
    padding: 32, width: '100%', maxWidth: 400, color: '#fff', fontFamily: 'sans-serif',
    boxSizing: 'border-box', margin: '0 16px',
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', margin: '6px 0 14px',
    background: '#0f0f1a', border: '1px solid #555', borderRadius: 6,
    color: '#fff', fontSize: 16, boxSizing: 'border-box', // 16px prevents iOS auto-zoom
  };

  const btnStyle = (color) => ({
    width: '100%', padding: '11px 0', marginTop: 8, borderRadius: 6,
    border: 'none', background: color, color: '#fff', fontSize: 15,
    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
  });

  return (
    <div style={overlayStyle}>
      <div style={boxStyle}>
        <h2 style={{ margin: '0 0 20px', textAlign: 'center' }}>M3 Hub</h2>

        <div style={{ display: 'flex', marginBottom: 20 }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                background: mode === m ? '#4a4aff' : '#2a2a4a',
                color: '#fff', borderRadius: m === 'login' ? '6px 0 0 6px' : '0 6px 6px 0',
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 13, color: '#aaa' }}>Username</label>
        <input
          style={inputStyle}
          type="text"
          autoComplete={mode === 'login' ? 'username' : 'username'}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && (mode === 'login' ? handleLogin() : handleRegister())}
          placeholder="Enter username"
          disabled={loading}
        />

        <label style={{ fontSize: 13, color: '#aaa' }}>Password</label>
        <input
          style={inputStyle}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && (mode === 'login' ? handleLogin() : handleRegister())}
          placeholder="Enter password"
          disabled={loading}
        />

        {error && (
          <div style={{ color: '#ff4444', fontSize: 13, margin: '0 0 10px', padding: '8px 10px', background: '#2a0000', borderRadius: 4 }}>
            {error}
          </div>
        )}

        <button
          style={btnStyle('#4a4aff')}
          onClick={mode === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? '⏳ CONNECTING...' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
        </button>

        <button
          style={{ ...btnStyle('#2a2a2a'), marginTop: 10, border: '1px solid #555' }}
          onClick={handleGuest}
          disabled={loading}
        >
          {loading ? '⏳ CONNECTING...' : 'ENTER AS GUEST'}
        </button>
      </div>
    </div>
  );
}
