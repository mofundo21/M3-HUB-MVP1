import React, { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthScreen from './components/AuthScreen';
import Hub3D from './components/Hub3D';
import CommandStation from './pages/CommandStation';
import RoadmapBuilder from './pages/RoadmapBuilder';
import OrchestratorDashboard from './pages/OrchestratorDashboard';
import './styles/app-shell.css';

export default function App() {
  const auth = useAuth();
  const [view, setView] = useState('station');

  useEffect(() => {
    auth.restoreAuth();
  }, []);

  if (!auth.isAuthenticated) {
    return <AuthScreen auth={auth} />;
  }

  const authUser = auth.user;
  const handleLogout = auth.logout;

  return (
    <div className="app-shell">
      <header className="app-shell__topbar">
        <div className="app-shell__brand">
          <span className="app-shell__eyebrow">M3 HUB</span>
          <strong>Operator Console</strong>
        </div>

        <div className="app-shell__nav">
          <button
            className={`app-shell__tab ${view === 'station' ? 'app-shell__tab--active' : ''}`}
            onClick={() => setView('station')}
          >
            Command Station
          </button>
          <button
            className={`app-shell__tab ${view === 'orchestrator' ? 'app-shell__tab--active' : ''}`}
            onClick={() => setView('orchestrator')}
          >
            Orchestrator
          </button>
          <button
            className={`app-shell__tab ${view === 'roadmap' ? 'app-shell__tab--active app-shell__tab--pink' : ''}`}
            onClick={() => setView('roadmap')}
          >
            Roadmap
          </button>
          <button
            className={`app-shell__tab ${view === 'hub' ? 'app-shell__tab--active' : ''}`}
            onClick={() => setView('hub')}
          >
            Hub
          </button>
        </div>

        <div className="app-shell__user">
          <span>{authUser?.username || authUser?.email || authUser?.pkg || 'Guest'}</span>
          <button className="app-shell__logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {view === 'station' && <CommandStation authUser={authUser} />}
      {view === 'orchestrator' && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <OrchestratorDashboard />
        </div>
      )}
      {view === 'roadmap' && <RoadmapBuilder />}
      {view === 'hub' && <Hub3D authUser={authUser} onZoneEnter={() => {}} onLogout={handleLogout} />}
    </div>
  );
}
