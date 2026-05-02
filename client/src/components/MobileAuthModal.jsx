import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001'
    : 'https://m3-hub-mvp1-production.up.railway.app';

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  page: {
    fontFamily: 'monospace',
    background: '#07000f',
    color: '#00ffff',
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  inner: {
    width: '100%',
    maxWidth: '340px',
    position: 'relative',
    zIndex: 2,
  },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '4px',
    color: 'rgba(0,255,255,0.5)',
    textAlign: 'center',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  heading: {
    fontSize: '22px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textAlign: 'center',
    marginBottom: '32px',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '13px 14px',
    marginBottom: '12px',
    background: 'rgba(0,20,40,0.95)',
    border: '1px solid rgba(0,255,255,0.35)',
    color: '#00ffff',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    outline: 'none',
  },
  error: {
    color: '#ff4d4d',
    background: 'rgba(255,60,60,0.08)',
    border: '1px solid rgba(255,60,60,0.3)',
    borderRadius: '6px',
    padding: '10px 12px',
    marginBottom: '14px',
    fontSize: '12px',
    lineHeight: 1.5,
  },
};

function btn(accent = '#00ffff', disabled = false) {
  const rgb = accent === '#00ffff' ? '0,255,255'
    : accent === '#ff00ff' ? '255,0,255'
    : accent === '#ffaa00' ? '255,170,0'
    : '120,120,120';
  return {
    width: '100%',
    padding: '14px',
    marginBottom: '10px',
    background: `rgba(${rgb},0.08)`,
    border: `1px solid ${accent}`,
    color: accent,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    transition: 'background 0.2s, box-shadow 0.2s',
  };
}

// ─── Animated background grid ─────────────────────────────────────────────────
function BgGrid() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(0,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '44px 44px',
      animation: 'gridDrift 25s linear infinite',
    }} />
  );
}

// ─── Scene: Landing ───────────────────────────────────────────────────────────
function SceneLanding({ onGuest, onLogin, onRegister }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const guest = async () => {
    setBusy(true);
    setErr('');
    try {
      const res = await axios.post(`${API}/api/auth/guest`);
      onGuest(res.data.token, res.data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Guest failed. Try again.');
      setBusy(false);
    }
  };

  return (
    <div style={S.page}>
      <BgGrid />
      {/* Glow orb */}
      <div style={{
        position: 'absolute', width: '280px', height: '280px',
        background: 'radial-gradient(circle, rgba(0,255,255,0.12) 0%, transparent 70%)',
        borderRadius: '50%', top: '-80px', right: '-80px', zIndex: 1,
        animation: 'pulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '220px', height: '220px',
        background: 'radial-gradient(circle, rgba(255,0,255,0.08) 0%, transparent 70%)',
        borderRadius: '50%', bottom: '-60px', left: '-60px', zIndex: 1,
        animation: 'pulse 8s ease-in-out infinite reverse',
      }} />

      <div style={{ ...S.inner, animation: 'fadeUp 0.5s ease-out' }}>
        <div style={S.eyebrow}>M3 HUB</div>
        <div style={{ ...S.heading, color: '#00ffff', textShadow: '0 0 20px rgba(0,255,255,0.4)' }}>
          ENTER THE HUB
        </div>

        {err && <div style={S.error}>⚠ {err}</div>}

        <button style={btn('#00ffff', busy)} onClick={guest} disabled={busy}>
          {busy ? '⏳ CONNECTING...' : '👻 GUEST EXPLORE'}
        </button>
        <button style={btn('#ff00ff', busy)} onClick={onLogin} disabled={busy}>
          🔓 LOGIN
        </button>
        <button style={btn('#ffaa00', busy)} onClick={onRegister} disabled={busy}>
          ✦ CREATE ACCOUNT
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: 'rgba(0,255,255,0.3)', letterSpacing: '1px' }}>
          MULTIPLAYER METAVERSE HUB
        </div>
      </div>
    </div>
  );
}

// ─── Scene: Login / Register form ─────────────────────────────────────────────
function SceneForm({ mode, onBack, onLoading, onSuccess, initialError = '' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(initialError);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setErr('Username and password required.');
      return;
    }
    setErr('');
    onLoading();
    try {
      const endpoint = mode === 'login' ? 'login' : 'register';
      const payload = mode === 'login'
        ? { email: username, username, password }
        : { username, password };
      const res = await axios.post(`${API}/api/auth/${endpoint}`, payload);
      onSuccess(res.data.token, res.data.user);
    } catch (e) {
      const msg = e.response?.data?.error || (mode === 'login' ? 'Login failed.' : 'Registration failed.');
      setErr(msg);
      onBack(msg); // return to form scene with error
    }
  };

  const onKey = (e) => e.key === 'Enter' && submit();

  return (
    <div style={S.page}>
      <BgGrid />

      <div style={{ ...S.inner, animation: 'fadeUp 0.4s ease-out' }}>
        <div style={S.eyebrow}>M3 HUB</div>
        <div style={{ ...S.heading, color: mode === 'login' ? '#ff00ff' : '#ffaa00' }}>
          {mode === 'login' ? '🔓 LOGIN' : '✦ CREATE ACCOUNT'}
        </div>

        {err && <div style={S.error}>⚠ {err}</div>}

        <label style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
          USERNAME {mode === 'login' && '/ EMAIL'}
        </label>
        <input
          style={S.input}
          type="text"
          placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
          autoComplete="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={onKey}
          autoFocus
        />

        <label style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,0.6)', display: 'block', marginBottom: '6px' }}>
          PASSWORD
        </label>
        <input
          style={S.input}
          type="password"
          placeholder="••••••••"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={onKey}
        />

        <div style={{ height: '8px' }} />

        <button style={btn(mode === 'login' ? '#ff00ff' : '#ffaa00')} onClick={submit}>
          {mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
        </button>
        <button
          style={{ ...btn('#444444'), border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.45)' }}
          onClick={() => onBack('')}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
}

// ─── Scene: Loading ───────────────────────────────────────────────────────────
function SceneLoading() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ ...S.page, gap: '20px' }}>
      <BgGrid />
      <div style={{ zIndex: 2, textAlign: 'center', animation: 'fadeUp 0.3s ease-out' }}>
        <div style={{
          width: '56px', height: '56px', margin: '0 auto 24px',
          border: '3px solid rgba(0,255,255,0.15)',
          borderTop: '3px solid #00ffff',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,0.5)', marginBottom: '10px' }}>
          M3 HUB
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: '#00ffff' }}>
          ENTERING M3{dots}
        </div>
      </div>
    </div>
  );
}

// ─── Scene: Success ───────────────────────────────────────────────────────────
function SceneSuccess({ user, onComplete }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => onComplete(), 1800);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  const name = user?.username || user?.pkg || 'TRAVELER';

  return (
    <div style={{ ...S.page, gap: '12px' }}>
      <BgGrid />
      <div style={{ zIndex: 2, textAlign: 'center', animation: 'fadeUp 0.4s ease-out' }}>
        <div style={{
          fontSize: '48px', marginBottom: '16px',
          animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          ✦
        </div>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,0.5)', marginBottom: '8px' }}>
          WELCOME BACK
        </div>
        <div style={{
          fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px',
          color: '#00ffff', textShadow: '0 0 20px rgba(0,255,255,0.6)',
          marginBottom: '24px',
        }}>
          {name.toUpperCase()}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(0,255,255,0.4)', letterSpacing: '2px' }}>
          INITIALIZING HUB...
        </div>
        <div style={{
          width: '120px', height: '2px', margin: '16px auto 0',
          background: 'rgba(0,255,255,0.15)', borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', background: '#00ffff',
            animation: 'progress 1.6s ease-out forwards',
          }} />
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function MobileAuthModal({ onAuth }) {
  const [scene, setScene] = useState('landing'); // landing | login | register | loading | success
  const [formMode, setFormMode] = useState('login');
  const [formError, setFormError] = useState('');
  const pendingRef = useRef(null); // { token, user }

  const goLogin = () => { setFormMode('login'); setFormError(''); setScene('login'); };
  const goRegister = () => { setFormMode('register'); setFormError(''); setScene('register'); };
  const goBack = (err) => { setFormError(err || ''); setScene(formMode); };

  const handleGuestAuth = (token, user) => {
    pendingRef.current = { token, user };
    setScene('success');
  };

  const handleLoading = () => setScene('loading');

  const handleSuccess = (token, user) => {
    pendingRef.current = { token, user };
    setScene('success');
  };

  const handleComplete = () => {
    const { token, user } = pendingRef.current;
    onAuth(token, user);
  };

  return (
    <>
      <style>{`
        @keyframes gridDrift {
          from { background-position: 0 0; }
          to { background-position: 0 44px; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        input:focus {
          border-color: rgba(0,255,255,0.7) !important;
          box-shadow: 0 0 0 2px rgba(0,255,255,0.12);
        }
        @media (max-width: 360px) {
          input { font-size: 16px !important; }
        }
      `}</style>

      {scene === 'landing' && (
        <SceneLanding onGuest={handleGuestAuth} onLogin={goLogin} onRegister={goRegister} />
      )}
      {(scene === 'login' || scene === 'register') && (
        <SceneForm
          mode={formMode}
          onBack={goBack}
          onLoading={handleLoading}
          onSuccess={handleSuccess}
          initialError={formError}
        />
      )}
      {scene === 'loading' && <SceneLoading />}
      {scene === 'success' && <SceneSuccess user={pendingRef.current?.user} onComplete={handleComplete} />}
    </>
  );
}
