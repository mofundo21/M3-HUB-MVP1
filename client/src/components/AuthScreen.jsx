import React, { useState, useEffect } from 'react';

// ─── Shared ───────────────────────────────────────────────────────────────────
const BG = {
  width: '100vw',
  height: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #07000f 0%, #140a2e 100%)',
  color: '#fff',
  fontFamily: '"Courier New", monospace',
  overflow: 'hidden',
  position: 'relative',
};

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  marginBottom: '12px',
  background: 'rgba(0,10,20,0.95)',
  border: '1px solid rgba(0,255,255,0.3)',
  color: '#00ffff',
  fontSize: '16px',
  borderRadius: '6px',
  fontFamily: '"Courier New", monospace',
  boxSizing: 'border-box',
  outline: 'none',
};

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      color: '#ff5555',
      background: 'rgba(255,50,50,0.08)',
      border: '1px solid rgba(255,50,50,0.3)',
      borderRadius: '6px',
      padding: '10px 12px',
      marginBottom: '14px',
      fontSize: '12px',
      lineHeight: 1.5,
    }}>
      ⚠ {msg}
    </div>
  );
}

const CSS = `
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes pulse {
    0%,100% { opacity:.6; transform:scale(1); }
    50%      { opacity:1;  transform:scale(1.08); }
  }
  @keyframes spin {
    to { transform:rotate(360deg); }
  }
  @keyframes popIn {
    from { opacity:0; transform:scale(.7); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes barFill {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes gridDrift {
    from { background-position:0 0; }
    to   { background-position:0 44px; }
  }
  input:focus {
    border-color: rgba(0,255,255,.7) !important;
    box-shadow: 0 0 0 2px rgba(0,255,255,.1);
  }
`;

function BgGrid() {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(0,255,255,.022) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,255,.022) 1px, transparent 1px)
      `,
      backgroundSize: '44px 44px',
      animation: 'gridDrift 28s linear infinite',
      pointerEvents: 'none',
    }} />
  );
}

// ─── Root router ──────────────────────────────────────────────────────────────
export default function AuthScreen({ auth }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      {windowWidth < 768
        ? <MobileAuthFlow auth={auth} />
        : <DesktopAuthForm auth={auth} />}
    </>
  );
}

// ─── MOBILE: 5-scene flow ─────────────────────────────────────────────────────
function MobileAuthFlow({ auth }) {
  const [scene, setScene] = useState('landing');
  const [formMode, setFormMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const runAuth = async (fn) => {
    setScene('loading');
    try {
      await fn();
      setScene('success');
    } catch {
      // auth.error already set by hook
      setScene(formMode === 'login' ? 'login' : 'register');
    }
  };

  const handleLogin = () => runAuth(() => auth.login(identifier, password));
  const handleRegister = () => {
    if (password !== confirmPassword) {
      auth.setError('Passwords do not match');
      return;
    }
    runAuth(() => auth.register(identifier, password));
  };
  const handleGuest = () => runAuth(() => auth.loginAsGuest());

  const goScene = (s, mode) => {
    auth.setError('');
    if (mode) setFormMode(mode);
    setScene(s);
  };

  return (
    <div style={BG}>
      <BgGrid />
      {scene === 'landing' && (
        <MobileLanding
          onLogin={() => goScene('login', 'login')}
          onRegister={() => goScene('register', 'register')}
          onGuest={handleGuest}
          loading={auth.loading}
          error={auth.error}
        />
      )}
      {scene === 'login' && (
        <MobileForm
          mode="login"
          identifier={identifier} setIdentifier={setIdentifier}
          password={password} setPassword={setPassword}
          onSubmit={handleLogin}
          onBack={() => goScene('landing')}
          loading={auth.loading}
          error={auth.error}
        />
      )}
      {scene === 'register' && (
        <MobileForm
          mode="register"
          identifier={identifier} setIdentifier={setIdentifier}
          password={password} setPassword={setPassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          onSubmit={handleRegister}
          onBack={() => goScene('landing')}
          loading={auth.loading}
          error={auth.error}
        />
      )}
      {scene === 'loading' && <MobileLoading />}
      {scene === 'success' && <MobileSuccess user={auth.user} />}
    </div>
  );
}

function MobileLanding({ onLogin, onRegister, onGuest, loading, error }) {
  const btn = (accent) => ({
    width: '100%',
    padding: '14px',
    marginBottom: '10px',
    background: `rgba(${accent === '#00ffff' ? '0,255,255' : accent === '#ff00ff' ? '255,0,255' : '255,170,0'},0.08)`,
    border: `1px solid ${accent}`,
    color: accent,
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
    fontFamily: '"Courier New", monospace',
    textTransform: 'uppercase',
  });

  return (
    <div style={{ zIndex: 2, width: '100%', maxWidth: '320px', padding: '0 20px', animation: 'fadeUp .5s ease-out' }}>
      {/* Glow orbs */}
      <div style={{ position: 'fixed', width: 240, height: 240, background: 'radial-gradient(circle,rgba(0,255,255,.1) 0%,transparent 70%)', borderRadius: '50%', top: -60, right: -60, animation: 'pulse 7s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 200, height: 200, background: 'radial-gradient(circle,rgba(255,0,255,.08) 0%,transparent 70%)', borderRadius: '50%', bottom: -50, left: -50, animation: 'pulse 9s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,.5)', marginBottom: '8px' }}>M3 HUB</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '3px', color: '#00ffff', textShadow: '0 0 20px rgba(0,255,255,.4)' }}>
          ENTER THE HUB
        </div>
      </div>

      <ErrorBox msg={error} />

      <button style={btn('#00ffff')} onClick={onGuest} disabled={loading}>
        {loading ? '⏳ CONNECTING...' : '👻 GUEST EXPLORE'}
      </button>
      <button style={btn('#ff00ff')} onClick={onLogin} disabled={loading}>
        🔓 LOGIN
      </button>
      <button style={btn('#ffaa00')} onClick={onRegister} disabled={loading}>
        ✦ CREATE ACCOUNT
      </button>

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '10px', color: 'rgba(0,255,255,.25)', letterSpacing: '1px' }}>
        MULTIPLAYER METAVERSE HUB
      </div>
    </div>
  );
}

function MobileForm({ mode, identifier, setIdentifier, password, setPassword, confirmPassword, setConfirmPassword, onSubmit, onBack, loading, error }) {
  const accent = mode === 'login' ? '#ff00ff' : '#ffaa00';
  const onKey = (e) => e.key === 'Enter' && !loading && onSubmit();

  return (
    <div style={{ zIndex: 2, width: '100%', maxWidth: '320px', padding: '0 20px', animation: 'fadeUp .4s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,.5)', marginBottom: '8px' }}>M3 HUB</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: accent }}>
          {mode === 'login' ? '🔓 LOGIN' : '✦ CREATE ACCOUNT'}
        </div>
      </div>

      <ErrorBox msg={error} />

      <label style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,.55)', display: 'block', marginBottom: '5px' }}>
        USERNAME {mode === 'login' && '/ EMAIL'}
      </label>
      <input
        style={inputStyle}
        type="text"
        placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
        autoComplete="username"
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
        onKeyDown={onKey}
        autoFocus
      />

      <label style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,.55)', display: 'block', marginBottom: '5px' }}>
        PASSWORD
      </label>
      <input
        style={inputStyle}
        type="password"
        placeholder="••••••••"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        value={password}
        onChange={e => setPassword(e.target.value)}
        onKeyDown={mode === 'login' ? onKey : undefined}
      />

      {mode === 'register' && (
        <>
          <label style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(0,255,255,.55)', display: 'block', marginBottom: '5px' }}>
            CONFIRM PASSWORD
          </label>
          <input
            style={inputStyle}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={onKey}
          />
        </>
      )}

      <div style={{ height: '6px' }} />

      <button
        style={{
          width: '100%', padding: '14px', marginBottom: '10px',
          background: `rgba(${mode === 'login' ? '255,0,255' : '255,170,0'},.1)`,
          border: `1px solid ${accent}`, color: accent,
          borderRadius: '8px', fontSize: '13px', fontWeight: 'bold',
          letterSpacing: '1px', cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1, fontFamily: '"Courier New", monospace',
          textTransform: 'uppercase',
        }}
        onClick={onSubmit}
        disabled={loading}
      >
        {loading ? '⏳ CONNECTING...' : mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
      </button>

      <button
        style={{
          width: '100%', padding: '12px',
          background: 'transparent', border: '1px solid rgba(255,255,255,.15)',
          color: 'rgba(255,255,255,.4)', borderRadius: '8px',
          fontSize: '12px', cursor: 'pointer', fontFamily: '"Courier New", monospace',
          textTransform: 'uppercase', letterSpacing: '1px',
        }}
        onClick={onBack}
        disabled={loading}
      >
        ← BACK
      </button>
    </div>
  );
}

function MobileLoading() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 420);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ zIndex: 2, textAlign: 'center', animation: 'fadeUp .3s ease-out' }}>
      <div style={{
        width: 52, height: 52, margin: '0 auto 24px',
        border: '3px solid rgba(0,255,255,.12)',
        borderTop: '3px solid #00ffff',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
      <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,.45)', marginBottom: '10px' }}>M3 HUB</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px', color: '#00ffff' }}>
        ENTERING M3{dots}
      </div>
    </div>
  );
}

function MobileSuccess({ user }) {
  const name = user?.username || user?.pkg || 'TRAVELER';

  return (
    <div style={{ zIndex: 2, textAlign: 'center', animation: 'fadeUp .4s ease-out' }}>
      <div style={{ fontSize: '44px', marginBottom: '16px', animation: 'popIn .5s cubic-bezier(.34,1.56,.64,1)' }}>✦</div>
      <div style={{ fontSize: '10px', letterSpacing: '4px', color: 'rgba(0,255,255,.45)', marginBottom: '8px' }}>WELCOME BACK</div>
      <div style={{ fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', color: '#00ffff', textShadow: '0 0 20px rgba(0,255,255,.5)', marginBottom: '24px' }}>
        {name.toUpperCase()}
      </div>
      <div style={{ fontSize: '11px', color: 'rgba(0,255,255,.35)', letterSpacing: '2px', marginBottom: '16px' }}>INITIALIZING HUB...</div>
      <div style={{ width: 120, height: 2, margin: '0 auto', background: 'rgba(0,255,255,.15)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#00ffff', animation: 'barFill 1.6s ease-out forwards' }} />
      </div>
    </div>
  );
}

// ─── DESKTOP: classic form ────────────────────────────────────────────────────
function DesktopAuthForm({ auth }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (m) => { setMode(m); auth.setError(''); };

  const handleLogin = async (e) => {
    e?.preventDefault();
    try { await auth.login(identifier, password); } catch {}
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    if (password !== confirmPassword) { auth.setError('Passwords do not match'); return; }
    try { await auth.register(identifier, password); } catch {}
  };

  const handleGuest = async () => {
    try { await auth.loginAsGuest(); } catch {}
  };

  const deskInput = { ...inputStyle, marginBottom: '14px', border: '1px solid #2a2a4a', color: '#fff', background: '#0a0a14' };

  return (
    <div style={BG}>
      <BgGrid />
      <div style={{
        zIndex: 2, width: '100%', maxWidth: '400px', margin: '0 16px',
        padding: '40px', background: 'rgba(10,0,21,.92)',
        border: '2px solid #00ffff', borderRadius: '12px',
        boxShadow: '0 0 50px rgba(0,255,255,.25), inset 0 0 50px rgba(0,255,255,.04)',
        animation: 'fadeUp .5s ease-out',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: 'linear-gradient(90deg,transparent,#00ffff,transparent)', boxShadow: '0 0 20px #00ffff' }} />

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '3px', color: '#00ffff', textShadow: '0 0 20px rgba(0,255,255,.5)', marginBottom: '6px' }}>
            <span style={{ color: '#ff00ff', marginRight: 8 }}>&gt;</span>ENTER M3
          </div>
          <div style={{ fontSize: '11px', letterSpacing: '2px', color: 'rgba(0,255,255,.5)', textTransform: 'uppercase' }}>
            MULTIPLAYER METAVERSE HUB
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '24px' }}>
          {[['login', '⚡ LOGIN'], ['register', '✦ CREATE']].map(([m, label]) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              disabled={auth.loading}
              style={{
                flex: 1, padding: '11px', borderRadius: 6,
                background: mode === m ? 'linear-gradient(135deg,#00ffff,#00cc99)' : 'rgba(0,255,255,.05)',
                border: `1px solid ${mode === m ? '#00ffff' : 'rgba(0,255,255,.2)'}`,
                color: mode === m ? '#000' : '#00ffff',
                fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px',
                cursor: auth.loading ? 'not-allowed' : 'pointer',
                fontFamily: '"Courier New", monospace', textTransform: 'uppercase',
                boxShadow: mode === m ? '0 0 20px rgba(0,255,255,.4)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: '#00ffff', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            👤 USERNAME {mode === 'login' && 'OR EMAIL'}
          </label>
          <input
            style={deskInput}
            type="text"
            placeholder={mode === 'login' ? 'username or email' : 'choose a username'}
            autoComplete="username"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            disabled={auth.loading}
          />

          <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: '#00ffff', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            🔐 PASSWORD
          </label>
          <input
            style={deskInput}
            type="password"
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={auth.loading}
          />

          {mode === 'register' && (
            <>
              <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', color: '#00ffff', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                🔐 CONFIRM PASSWORD
              </label>
              <input
                style={deskInput}
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={auth.loading}
              />
            </>
          )}

          <ErrorBox msg={auth.error} />

          <button
            type="submit"
            disabled={auth.loading}
            style={{
              width: '100%', padding: '14px', marginBottom: '12px',
              background: auth.loading ? 'rgba(0,255,255,.2)' : 'linear-gradient(135deg,#00ffff,#00ff88)',
              border: 'none', color: '#000', borderRadius: 6,
              fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px',
              cursor: auth.loading ? 'not-allowed' : 'pointer',
              fontFamily: '"Courier New", monospace', textTransform: 'uppercase',
              boxShadow: auth.loading ? 'none' : '0 0 20px rgba(0,255,255,.4)',
              opacity: auth.loading ? 0.7 : 1,
            }}
          >
            {auth.loading ? '⏳ CONNECTING...' : mode === 'login' ? '▶ ENTER M3' : '▶ CREATE PROFILE'}
          </button>
        </form>

        <button
          onClick={handleGuest}
          disabled={auth.loading}
          style={{
            width: '100%', padding: '12px',
            background: 'rgba(0,255,255,.08)',
            border: '1px solid #ff00ff', color: '#ff00ff',
            borderRadius: 6, fontSize: '11px', fontWeight: 'bold',
            letterSpacing: '1px', cursor: auth.loading ? 'not-allowed' : 'pointer',
            fontFamily: '"Courier New", monospace', textTransform: 'uppercase',
            opacity: auth.loading ? 0.6 : 1,
          }}
        >
          {auth.loading ? '⏳ LOADING...' : '👻 GUEST EXPLORE'}
        </button>

        {/* Bottom accent */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#ff00ff,transparent)', marginTop: 24, boxShadow: '0 0 15px #ff00ff' }} />
      </div>
    </div>
  );
}
