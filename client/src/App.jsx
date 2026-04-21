import React, { useState, useEffect } from 'react';
import Hub3D from './components/Hub3D';

export default function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('m3_token', 'guest-token');
    setAuthUser({ id: 'guest', username: 'Guest' });
  }, []);

  if (!authUser) return null;

  return <Hub3D authUser={authUser} onZoneEnter={() => {}} />;
}
