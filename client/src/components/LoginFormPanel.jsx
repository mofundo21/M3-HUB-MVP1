import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

export default function LoginFormPanel({ onAuth }) {
  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = mode === 'login'
        ? { email, password }
        : { email, username, password };
      const res = await axios.post(`${API}/api/auth/${mode}`, payload);
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
        {/* Top accent */}
        <div className="lfp-accent-top" />

        {/* Header */}
        <div className="lfp-header">
          <div className="lfp-title"><span className="lfp-arrow">&gt;</span> ENTER M3</div>
          <div className="lfp-subtitle">MULTIPLAYER METAVERSE HUB</div>
        </div>

        {/* Mode tabs */}
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

        {/* Fields */}
        {mode === 'register' && (
          <div className="lfp-field">
            <label className="lfp-label">👤 USERNAME</label>
            <input
              className="lfp-input"
              type="text"
              placeholder="choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyPress={onKey}
              disabled={loading}
            />
          </div>
        )}

        <div className="lfp-field">
          <label className="lfp-label">📧 EMAIL</label>
          <input
            className="lfp-input"
            type="text"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={onKey}
            disabled={loading}
          />
        </div>

        <div className="lfp-field">
          <label className="lfp-label">🔐 PASSWORD</label>
          <input
            className="lfp-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={onKey}
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && <div className="lfp-error">⚠ {error}</div>}

        {/* Primary button */}
        <button onClick={submit} disabled={loading} className="lfp-btn lfp-btn--primary">
          {loading ? '● CONNECTING...' : mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
        </button>

        {/* Guest button */}
        <button onClick={guest} disabled={loading} className="lfp-btn lfp-btn--ghost">
          {loading ? '⏳ LOADING...' : '👻 EXPLORE AS GUEST'}
        </button>

        {/* Bottom accent */}
        <div className="lfp-accent-bottom" />
      </div>
    </div>
  );
}
