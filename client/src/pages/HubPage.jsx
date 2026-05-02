import React from 'react';
import Hub3D from '../components/Hub3D';

export default function HubPage({ authUser, onLogout }) {
  return (
    <Hub3D
      authUser={authUser}
      onZoneEnter={() => {}}
      onLogout={onLogout}
    />
  );
}
