import React, { useState, useEffect } from 'react';
import Hub3D from './components/Hub3D';
import LoginFormOverlay from './components/LoginFormOverlay';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleAuth = (token, user) => {
    localStorage.setItem('m3_token', token);
    localStorage.setItem('m3_user', JSON.stringify(user));
    setAuthUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('m3_token');
    localStorage.removeItem('m3_user');
    setAuthUser(null);
  };

  if (loading) return null;

  if (!authUser) {
    return <LoginFormOverlay onAuth={handleAuth} />;
  }

  return <Hub3D authUser={authUser} onZoneEnter={() => {}} onLogout={handleLogout} />;
}
