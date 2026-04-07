import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const LETTER_COLORS = ['#00ffff', '#A78BFA', '#ff00ff', '#A78BFA', '#00ffff', '#ff00ff'];

function M3Title() {
  const letters = ['M', '3', '\u00A0', 'H', 'U', 'B'];
  const containerRef = useRef(null);
  const offsets = useRef(letters.map(() => ({ x: 0, y: 0 })));
  const animFrameRef = useRef(null);
  const [, forceUpdate] = useState(0);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spans = containerRef.current.querySelectorAll('span[data-letter]');

    spans.forEach((span, i) => {
      const sr = span.getBoundingClientRect();
      const cx = sr.left + sr.width / 2;
      const cy = sr.top + sr.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 60;

      if (dist < radius) {
        const force = (1 - dist / radius) * 18;
        offsets.current[i] = {
          x: -(dx / dist) * force,
          y: -(dy / dist) * force,
        };
      } else {
        offsets.current[i] = {
          x: offsets.current[i].x * 0.85,
          y: offsets.current[i].y * 0.85,
        };
      }
    });

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => forceUpdate(n => n + 1));
  }, []);

  const handleMouseLeave = useCallback(() => {
    const decay = () => {
      let moving = false;
      offsets.current = offsets.current.map(o => {
        const nx = o.x * 0.8;
        const ny = o.y * 0.8;
        if (Math.abs(nx) > 0.1 || Math.abs(ny) > 0.1) moving = true;
        return { x: nx, y: ny };
      });
      forceUpdate(n => n + 1);
      if (moving) animFrameRef.current = requestAnimationFrame(decay);
    };
    animFrameRef.current = requestAnimationFrame(decay);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex', cursor: 'default', userSelect: 'none' }}
    >
      {letters.map((l, i) => (
        <span
          key={i}
          data-letter="true"
          style={{
            display: 'inline-block',
            fontFamily: "'Righteous', sans-serif",
            fontSize: 36,
            color: LETTER_COLORS[i],
            textShadow: `0 0 12px ${LETTER_COLORS[i]}88`,
            transform: `translate(${offsets.current[i].x}px, ${offsets.current[i].y}px)`,
            transition: 'text-shadow 0.2s',
            willChange: 'transform',
          }}
        >
          {l}
        </span>
      ))}
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://m3-hub-mvp1-production.up.railway.app';

const STYLES = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes glow { 0%, 100% { box-shadow: 0 0 20px #7C3AED44; } 50% { box-shadow: 0 0 40px #7C3AED88; } }

  .m3-popup-card { animation: fadeIn 0.3s ease, glow 3s ease infinite; }

  .m3-input:focus {
    outline: none;
    border-color: #00ffff !important;
    box-shadow: 0 0 0 2px #00ffff22, 0 0 12px #00ffff33;
  }

  .m3-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #8B5CF6, #7C3AED) !important;
    box-shadow: 0 0 24px #7C3AED99 !important;
    transform: translateY(-1px);
  }

  .m3-btn-guest:hover:not(:disabled) {
    background: rgba(255,255,255,0.06) !important;
    border-color: #A78BFA !important;
    color: #A78BFA !important;
  }

  .m3-btn-primary, .m3-btn-guest {
    transition: all 0.2s ease;
  }

  .m3-tab:hover { color: #E2E8F0 !important; }
`;

function Spinner() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}
    >
      <circle cx="9" cy="9" r="7" stroke="#ffffff44" strokeWidth="2" />
      <path d="M9 2a7 7 0 0 1 7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPopup({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [mode]);

  const validate = () => {
    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (mode === 'register') {
      if (username.length < 3 || username.length > 20) {
        setError('Username must be 3–20 characters.');
        return false;
      }
      if (/\s/.test(username)) {
        setError('Username cannot contain spaces.');
        return false;
      }
    }
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      mode === 'login' ? handleLogin() : handleRegister();
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, username, password });
      onAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
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
      setError(`Guest login failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* Overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'radial-gradient(ellipse at center, #0f0f2388 0%, #000000cc 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}>
        {/* Card */}
        <div className="m3-popup-card" style={{
          background: 'linear-gradient(160deg, #13132a 0%, #0f0f1e 100%)',
          border: '1px solid #7C3AED55',
          borderRadius: 16,
          padding: '36px 32px',
          width: 360,
          maxWidth: '92vw',
          boxShadow: '0 0 60px #7C3AED22, 0 24px 60px #00000088',
          fontFamily: "'Poppins', sans-serif",
          color: '#E2E8F0',
        }}>

          {/* Logo / Title */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <M3Title />
            <div style={{ fontSize: 11, color: '#A78BFA99', letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' }}>
              Virtual Space
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex', background: '#ffffff08', borderRadius: 10,
            padding: 3, marginBottom: 24, gap: 3,
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                className="m3-tab"
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                  borderRadius: 8, fontSize: 13, fontWeight: 500,
                  fontFamily: "'Poppins', sans-serif",
                  letterSpacing: 1, textTransform: 'uppercase', transition: 'all 0.2s ease',
                  background: mode === m ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'transparent',
                  color: mode === m ? '#fff' : '#ffffff55',
                  boxShadow: mode === m ? '0 0 16px #7C3AED55' : 'none',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

            {/* Email — always shown */}
            <label style={{ fontSize: 11, color: '#A78BFA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
              Email
            </label>
            <input
              ref={firstInputRef}
              className="m3-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
              style={{
                background: '#0a0a1a', border: '1px solid #ffffff18',
                borderRadius: 8, padding: '11px 14px', color: '#E2E8F0',
                fontSize: 14, fontFamily: "'Poppins', sans-serif",
                marginBottom: 14, transition: 'border-color 0.2s, box-shadow 0.2s',
                opacity: loading ? 0.6 : 1,
              }}
            />

            {/* Username — register only */}
            {mode === 'register' && (
              <>
                <label style={{ fontSize: 11, color: '#A78BFA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
                  Username
                </label>
                <input
                  className="m3-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="YourHandle"
                  disabled={loading}
                  autoComplete="username"
                  style={{
                    background: '#0a0a1a', border: '1px solid #ffffff18',
                    borderRadius: 8, padding: '11px 14px', color: '#E2E8F0',
                    fontSize: 14, fontFamily: "'Poppins', sans-serif",
                    marginBottom: 14, transition: 'border-color 0.2s, box-shadow 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                />
              </>
            )}

            {/* Password */}
            <label style={{ fontSize: 11, color: '#A78BFA', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
              Password
            </label>
            <input
              className="m3-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              style={{
                background: '#0a0a1a', border: '1px solid #ffffff18',
                borderRadius: 8, padding: '11px 14px', color: '#E2E8F0',
                fontSize: 14, fontFamily: "'Poppins', sans-serif",
                marginBottom: 4, transition: 'border-color 0.2s, box-shadow 0.2s',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              margin: '14px 0 0',
              padding: '10px 14px',
              background: '#F43F5E11',
              border: '1px solid #F43F5E44',
              borderLeft: '3px solid #F43F5E',
              borderRadius: 8,
              fontSize: 13,
              color: '#FDA4AF',
              fontFamily: "'Poppins', sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* Primary CTA */}
          <button
            className="m3-btn-primary"
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            style={{
              width: '100%', marginTop: 20, padding: '13px 0',
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontSize: 14, fontWeight: 600, letterSpacing: 2,
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Poppins', sans-serif",
              boxShadow: '0 0 20px #7C3AED66',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? <><Spinner /> Connecting...</> : mode === 'login' ? 'Enter Hub' : 'Create Account'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '18px 0 14px', color: '#ffffff22', fontSize: 11,
          }}>
            <div style={{ flex: 1, height: 1, background: '#ffffff11' }} />
            <span style={{ color: '#ffffff33', letterSpacing: 2 }}>OR</span>
            <div style={{ flex: 1, height: 1, background: '#ffffff11' }} />
          </div>

          {/* Guest */}
          <button
            className="m3-btn-guest"
            onClick={handleGuest}
            disabled={loading}
            style={{
              width: '100%', padding: '11px 0',
              background: 'transparent',
              border: '1px solid #ffffff22', borderRadius: 10,
              color: '#ffffff66', fontSize: 13, fontWeight: 500,
              letterSpacing: 1, textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Poppins', sans-serif",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? <><Spinner /> Connecting...</> : 'Enter as Guest'}
          </button>

        </div>
      </div>
    </>
  );
}
