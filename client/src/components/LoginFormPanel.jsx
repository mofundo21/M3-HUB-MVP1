import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

export default function LoginFormPanel({ onAuth }) {
  const [mode, setMode] = useState('login'); // login | register
  const [identifier, setIdentifier] = useState(''); // username or email for login
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        const isEmail = identifier.includes('@');
        res = await axios.post(`${API}/api/auth/login`, {
          [isEmail ? 'email' : 'username']: identifier,
          password,
        });
      } else {
        res = await axios.post(`${API}/api/auth/register`, { email, username, password });
      }
      onAuth(res.data.token, res.data.user, mode === 'register');
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

  const onKey = (e) => { if (e.key === 'Enter' && !loading) submit(); };

  return (
    <div className="lfp-wrap">
      <div className="lfp-panel">
        <div className="lfp-accent-top" />

        <div className="lfp-header">
          <div className="lfp-title"><span className="lfp-arrow">&gt;</span> ENTER M3</div>
          <div className="lfp-subtitle">MULTIPLAYER METAVERSE HUB</div>
        </div>

        <div className="lfp-tabs">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              disabled={loading}
              className={`lfp-tab ${mode === m ? 'lfp-tab--active' : ''}`}
            >
              {m === 'login' ? '⚡ LOGIN' : '✦ CREATE'}
            </button>
          ))}
        </div>

        {mode === 'login' ? (
          <div className="lfp-field">
            <label className="lfp-label">👤 USERNAME OR EMAIL</label>
            <input
              className="lfp-input"
              type="text"
              placeholder="MOFUNDO0002 or your@email.com"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyPress={onKey}
              disabled={loading}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
        ) : (
          <>
            <div className="lfp-field">
              <label className="lfp-label">👤 USERNAME</label>
              <input
                className="lfp-input"
                type="text"
                placeholder="3-20 chars, letters/numbers/_"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyPress={onKey}
                disabled={loading}
                autoCapitalize="none"
              />
            </div>
            <div className="lfp-field">
              <label className="lfp-label">📧 EMAIL</label>
              <input
                className="lfp-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyPress={onKey}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div className="lfp-field">
          <label className="lfp-label">🔐 PASSWORD</label>
          <input
            className="lfp-input"
            type="password"
            placeholder={mode === 'register' ? '8+ characters' : '••••••••'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={onKey}
            disabled={loading}
          />
        </div>

        {error && <div className="lfp-error">⚠ {error}</div>}

        <button onClick={submit} disabled={loading} className="lfp-btn lfp-btn--primary">
          {loading ? '● CONNECTING...' : mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
        </button>

        <button onClick={guest} disabled={loading} className="lfp-btn lfp-btn--ghost">
          {loading ? '⏳ LOADING...' : '👻 EXPLORE AS GUEST'}
        </button>

        <div className="lfp-accent-bottom" />
      </div>
    </div>
  );
}
