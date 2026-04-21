import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

export default function LoginFormOverlay({ onAuth }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);

  const submit = async (fn) => {
    setErr('');
    setLoad(true);
    try {
      const res = await axios.post(`${API}/api/auth/${fn}`, { username: user, password: pass });
      onAuth(res.data.token, res.data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed');
    } finally {
      setLoad(false);
    }
  };

  const guest = async () => {
    setErr('');
    setLoad(true);
    try {
      const res = await axios.post(`${API}/api/auth/guest`);
      onAuth(res.data.token, res.data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Guest failed');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="form-overlay" style={{ animation: 'fadeIn 0.8s ease-out' }}>
      <div className="form-box">
        <div className="form-title">ENTER THE UNIVERSE</div>
        <div className="form-tabs">
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              disabled={load}
              className={`form-tab ${mode === m ? 'active' : ''}`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          disabled={load}
          className="form-input"
        />
        <input
          type="password"
          placeholder="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          disabled={load}
          className="form-input"
        />

        {err && <div className="form-error">{err}</div>}

        <button
          onClick={() => submit(mode)}
          disabled={load}
          className="form-button primary"
        >
          {load ? '⏳ CONNECTING...' : mode === 'login' ? 'ENTER M3' : 'CREATE PROFILE'}
        </button>

        <button
          onClick={guest}
          disabled={load}
          className="form-button secondary"
        >
          {load ? '⏳ CONNECTING...' : 'EXPLORE AS GUEST'}
        </button>
      </div>
    </div>
  );
}
