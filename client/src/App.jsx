import React, { useState, useEffect } from 'react';
import Hub3D from './components/Hub3D';
import CinematicLoginScene from './components/CinematicLoginScene';
import AvatarCustomizer from './components/AvatarCustomizer';
import { DeviceProvider } from './context/DeviceContext';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsCustomization, setNeedsCustomization] = useState(false);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('m3_token');
    if (token) {
      const user = localStorage.getItem('m3_user');
      if (user) {
        try {
          setAuthUser(JSON.parse(user));
        } catch {
          localStorage.removeItem('m3_token');
          localStorage.removeItem('m3_user');
        }
      }
    }
    setLoading(false);
  }, []);

  const handleAuth = (token, user, isNewUser = false) => {
    localStorage.setItem('m3_token', token);
    localStorage.setItem('m3_user', JSON.stringify(user));
    setAuthUser(user);
    if (isNewUser) {
      setNeedsCustomization(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('m3_token');
    localStorage.removeItem('m3_user');
    setAuthUser(null);
  };

  if (loading) return null;

  let inner;
  if (!authUser) {
    inner = <CinematicLoginScene onAuth={handleAuth} />;
  } else if (needsCustomization) {
    inner = <AvatarCustomizer user={authUser} onComplete={() => setNeedsCustomization(false)} />;
  } else {
    inner = <Hub3D authUser={authUser} onZoneEnter={() => {}} onLogout={handleLogout} />;
  }

  return <DeviceProvider>{inner}</DeviceProvider>;
}
