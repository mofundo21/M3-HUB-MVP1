import React, { useState, useEffect } from 'react';
import Hub3D from './components/Hub3D';

export default function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    // Auto-login as guest
    const user = { id: 'guest', username: 'Guest', email: 'guest@m3hub.local' };
    localStorage.setItem('m3_token', 'guest-token');
    localStorage.setItem('m3_user', JSON.stringify(user));
    setAuthUser(user);
  }, []);

  if (!authUser) return <div>Loading...</div>;

  return <Hub3D authUser={authUser} onZoneEnter={() => {}} />;
}
