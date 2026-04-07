import React, { useState, useEffect } from 'react';
import LoginPopup from './components/UI/LoginPopup';
import Hub3D from './components/Hub3D';
import Store from './components/UI/Store';
import Gallery from './components/UI/Gallery';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [activeZone, setActiveZone] = useState(null); // 'store' | 'gallery' | null

  // Check for existing token on load
  useEffect(() => {
    const token = localStorage.getItem('m3_token');
    const userData = localStorage.getItem('m3_user');
    if (token && userData) {
      try {
        setAuthUser(JSON.parse(userData));
      } catch (_) {
        localStorage.removeItem('m3_token');
        localStorage.removeItem('m3_user');
      }
    }
  }, []);

  const handleAuth = (token, user) => {
    localStorage.setItem('m3_token', token);
    localStorage.setItem('m3_user', JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('m3_token');
    localStorage.removeItem('m3_user');
    setAuthUser(null);
    setActiveZone(null);
  };

  const handleZoneEnter = (zoneName) => {
    if (zoneName === 'store') setActiveZone('store');
    else if (zoneName === 'gallery') setActiveZone('gallery');
    // portal zone stays in hub
  };

  const handleZoneClose = () => setActiveZone(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0a0f' }}>
      {!authUser && <LoginPopup onAuth={handleAuth} />}

      {authUser && (
        <>
          <Hub3D
            authUser={authUser}
            onZoneEnter={handleZoneEnter}
          />

          {/* HUD */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: 'rgba(0,0,0,0.7)',
            border: '1px solid #00ffff',
            borderRadius: 6,
            padding: '8px 14px',
            fontSize: 13,
            color: '#00ffff',
            userSelect: 'none',
          }}>
            <div style={{ fontWeight: 'bold', fontSize: 15 }}>{authUser.username}</div>
            <div style={{ color: '#ff00ff', fontSize: 11 }}>PKG: {authUser.pkg}</div>
            {authUser.isGuest && <div style={{ color: '#888', fontSize: 10 }}>Guest Mode</div>}
          </div>

          {/* Controls hint */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid #333',
            borderRadius: 6,
            padding: '6px 12px',
            fontSize: 11,
            color: '#666',
            userSelect: 'none',
          }}>
            WASD to move · Click zones to interact
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid #ff00ff',
              color: '#ff00ff',
              padding: '6px 14px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Logout
          </button>

          {/* Zone panels */}
          {activeZone === 'store' && <Store onClose={handleZoneClose} />}
          {activeZone === 'gallery' && <Gallery onClose={handleZoneClose} />}
        </>
      )}
    </div>
  );
}
