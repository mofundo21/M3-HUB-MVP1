import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

export default function LoginFormOverlay({ onAuth, compact = false }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);

  const submit = async (fn) => {
    setErr('');
    setLoad(true);
    try {
      const payload = mode === 'login'
        ? { email: user, password: pass }
        : { email: user, username: user, password: pass };
      const res = await axios.post(`${API}/api/auth/${fn}`, payload);
      onAuth(res.data.token, res.data.user, mode === 'register');
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

  const containerStyle = compact
    ? { position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }
    : styles.container;

  return (
    <div style={containerStyle}>
      {!compact && <div style={styles.gridBg} />}
      {!compact && <div style={styles.glowOrb1} />}
      {!compact && <div style={styles.glowOrb2} />}

      {/* Main form */}
      <div style={styles.formBox}>
        {/* Top accent line */}
        <div style={styles.accentLine} />

        {/* Title section */}
        <div style={styles.titleSection}>
          <div style={styles.title}>
            <span style={styles.titlePrefix}>&gt;</span> ENTER M3
          </div>
          <div style={styles.subtitle}>MULTIPLAYER METAVERSE HUB</div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['login', 'register'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(''); }}
              disabled={load}
              style={{
                ...styles.tab,
                ...(mode === m ? styles.tabActive : styles.tabInactive),
                opacity: load ? 0.6 : 1,
                cursor: load ? 'not-allowed' : 'pointer',
              }}
            >
              {m === 'login' ? '⚡ LOGIN' : '✦ CREATE'}
            </button>
          ))}
        </div>

        {/* Form inputs */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            {mode === 'login' ? '📧 EMAIL' : '👤 USERNAME'}
          </label>
          <input
            type="text"
            placeholder={mode === 'login' ? 'your@email.com' : 'choose a username'}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !load && submit(mode)}
            disabled={load}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>🔐 PASSWORD</label>
          <input
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !load && submit(mode)}
            disabled={load}
            style={styles.input}
          />
        </div>

        {/* Error message */}
        {err && (
          <div style={styles.error}>
            <span style={{ marginRight: '8px' }}>⚠️</span>
            {err}
          </div>
        )}

        {/* Primary action button */}
        <button
          onClick={() => submit(mode)}
          disabled={load}
          style={{
            ...styles.buttonPrimary,
            opacity: load ? 0.7 : 1,
            cursor: load ? 'not-allowed' : 'pointer',
            boxShadow: load ? 'none' : '0 0 20px rgba(0,255,255,0.4), 0 0 40px rgba(255,0,255,0.2)',
          }}
        >
          {load ? (
            <>
              <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> CONNECTING...
            </>
          ) : (
            <>
              {mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
            </>
          )}
        </button>

        {/* Guest button */}
        <button
          onClick={guest}
          disabled={load}
          style={{
            ...styles.buttonSecondary,
            opacity: load ? 0.6 : 1,
            cursor: load ? 'not-allowed' : 'pointer',
          }}
        >
          {load ? '⏳ LOADING...' : '👻 GUEST EXPLORE'}
        </button>

        {/* Bottom accent */}
        <div style={styles.accentLineBottom} />
      </div>

      {/* Floating particles */}
      <Particles />

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-20px) translateX(-5px); }
          75% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes gridScroll {
          0% { transform: translateY(0px); }
          100% { transform: translateY(20px); }
        }
        @keyframes glow1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate(30px, -50px) scale(1.2); opacity: 0.2; }
        }
        @keyframes glow2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          50% { transform: translate(-40px, 40px) scale(1.1); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

function Particles() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: '2px',
            height: '2px',
            background: '#00ffff',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + i}s infinite ease-in-out`,
            opacity: 0.3 + Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1000,
  },
  gridBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: '50px 50px',
    animation: 'gridScroll 20s linear infinite',
    zIndex: 0,
  },
  glowOrb1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(0,255,255,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    top: '-100px',
    right: '-100px',
    animation: 'glow1 8s ease-in-out infinite',
    zIndex: 1,
  },
  glowOrb2: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    background: 'radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
    bottom: '-50px',
    left: '-50px',
    animation: 'glow2 10s ease-in-out infinite',
    zIndex: 1,
  },
  formBox: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(10, 0, 21, 0.9)',
    backdropFilter: 'blur(20px)',
    border: '2px solid #00ffff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 0 50px rgba(0,255,255,0.3), inset 0 0 50px rgba(0,255,255,0.05)',
    zIndex: 100,
    animation: 'fadeIn 0.8s ease-out',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
    boxShadow: '0 0 20px #00ffff',
  },
  accentLineBottom: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #ff00ff, transparent)',
    marginTop: '20px',
    boxShadow: '0 0 15px #ff00ff',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    color: '#00ffff',
    textShadow: '0 0 20px rgba(0,255,255,0.5)',
    fontFamily: 'monospace',
    marginBottom: '8px',
  },
  titlePrefix: {
    color: '#ff00ff',
    marginRight: '8px',
  },
  subtitle: {
    fontSize: '11px',
    letterSpacing: '2px',
    color: 'rgba(0,255,255,0.6)',
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
  },
  tab: {
    flex: 1,
    padding: '12px',
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.3)',
    color: '#00ffff',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #00ffff, #00cc99)',
    color: '#000',
    border: '1px solid #00ffff',
    boxShadow: '0 0 20px rgba(0,255,255,0.5)',
  },
  tabInactive: {
    background: 'rgba(0,255,255,0.05)',
    color: '#00ffff',
    border: '1px solid rgba(0,255,255,0.2)',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '10px',
    letterSpacing: '2px',
    color: '#00ffff',
    marginBottom: '8px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(0, 26, 51, 0.9)',
    border: '1px solid rgba(0,255,255,0.3)',
    color: '#00ffff',
    fontSize: '13px',
    borderRadius: '6px',
    fontFamily: 'monospace',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 10px rgba(0,255,255,0.1)',
    boxSizing: 'border-box',
  },
  error: {
    padding: '12px',
    background: 'rgba(255, 68, 68, 0.15)',
    border: '1px solid rgba(255, 68, 68, 0.4)',
    borderRadius: '6px',
    color: '#ff6b6b',
    fontSize: '11px',
    fontFamily: 'monospace',
    marginBottom: '20px',
    boxShadow: '0 0 10px rgba(255,68,68,0.2)',
  },
  buttonPrimary: {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    background: 'linear-gradient(135deg, #00ffff, #00ff88)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    textShadow: '0 0 10px rgba(0,0,0,0.3)',
  },
  buttonSecondary: {
    width: '100%',
    padding: '12px',
    background: 'rgba(0,255,255,0.1)',
    border: '1px solid #ff00ff',
    color: '#ff00ff',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
};
