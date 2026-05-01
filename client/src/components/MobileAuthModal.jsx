import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

export default function MobileAuthModal({ onAuth }) {
  const [screen, setScreen] = useState('choose'); // choose | login | register
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = screen === 'login'
        ? { email, password }
        : { email, username, password };
      const res = await axios.post(`${API}/api/auth/${screen}`, payload);
      onAuth(res.data.token, res.data.user, screen === 'register');
    } catch (e) {
      setError(e.response?.data?.error || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/guest`);
      onAuth(res.data.token, res.data.user);
    } catch (e) {
      setError(e.response?.data?.error || 'Guest failed');
    } finally {
      setLoading(false);
    }
  };

  const baseStyle = {
    position: 'fixed', inset: 0,
    background: 'linear-gradient(160deg, #0a0a1a 0%, #0d001f 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 24, zIndex: 9999, fontFamily: 'monospace',
  };

  const panelStyle = {
    width: '100%', maxWidth: 340,
    background: 'rgba(0,255,255,0.04)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: 12, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 16,
  };

  const inputStyle = {
    width: '100%', background: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(0,255,255,0.4)',
    color: '#00ffff', padding: '12px 14px',
    borderRadius: 6, fontSize: 14, fontFamily: 'monospace',
    outline: 'none', boxSizing: 'border-box',
  };

  const btnPrimary = {
    width: '100%', padding: '14px 0',
    background: 'rgba(0,255,255,0.15)',
    border: '1px solid #00ffff', color: '#00ffff',
    borderRadius: 6, fontSize: 13, fontFamily: 'monospace',
    fontWeight: 'bold', cursor: 'pointer', letterSpacing: 1,
  };

  const btnSecondary = {
    width: '100%', padding: '12px 0',
    background: 'transparent',
    border: '1px solid rgba(0,255,255,0.3)', color: 'rgba(0,255,255,0.6)',
    borderRadius: 6, fontSize: 12, fontFamily: 'monospace',
    cursor: 'pointer',
  };

  const btnGhost = {
    width: '100%', padding: '12px 0',
    background: 'rgba(255,0,255,0.08)',
    border: '1px solid rgba(255,0,255,0.4)', color: '#ff00ff',
    borderRadius: 6, fontSize: 12, fontFamily: 'monospace',
    cursor: 'pointer',
  };

  if (screen === 'choose') {
    return (
      <div style={baseStyle}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: '#00ffff', fontSize: 22, fontWeight: 'bold', letterSpacing: 3 }}>M3 HUB</div>
          <div style={{ color: 'rgba(0,255,255,0.5)', fontSize: 11, marginTop: 4 }}>MULTIPLAYER METAVERSE</div>
        </div>
        <div style={panelStyle}>
          <button style={btnPrimary} onClick={() => setScreen('login')} disabled={loading}>
            ⚡ LOGIN
          </button>
          <button style={btnSecondary} onClick={() => setScreen('register')} disabled={loading}>
            ✦ CREATE ACCOUNT
          </button>
          <button style={btnGhost} onClick={guest} disabled={loading}>
            {loading ? '⏳ LOADING...' : '👻 EXPLORE AS GUEST'}
          </button>
          {error && <div style={{ color: '#ff4444', fontSize: 12, textAlign: 'center' }}>⚠ {error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={baseStyle}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ color: '#00ffff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 }}>
          {screen === 'login' ? '⚡ LOGIN' : '✦ CREATE ACCOUNT'}
        </div>
      </div>
      <div style={panelStyle}>
        {screen === 'register' && (
          <input
            style={inputStyle}
            type="text"
            placeholder="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
        )}
        <input
          style={inputStyle}
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && !loading && submit()}
          disabled={loading}
        />
        {error && <div style={{ color: '#ff4444', fontSize: 12 }}>⚠ {error}</div>}
        <button style={btnPrimary} onClick={submit} disabled={loading}>
          {loading ? '● CONNECTING...' : screen === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
        </button>
        <button style={btnSecondary} onClick={() => { setScreen('choose'); setError(''); }}>
          ← BACK
        </button>
      </div>
    </div>
  );
}
