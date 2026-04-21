import React, { useState, useEffect } from 'react';
import Hub3D from './components/Hub3D';

export default function App() {
  const [authUser, setAuthUser] = useState({ id: 'guest', username: 'Guest' });

  return <Hub3D authUser={authUser} onZoneEnter={() => {}} />;
}
