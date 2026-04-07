import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Client } from 'colyseus.js';
import * as THREE from 'three';
import Avatar from './Avatar';
import Zone from './Zone';

const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL ||
  (window.location.hostname === 'localhost'
    ? 'ws://localhost:3001'
    : 'wss://m3-hub-mvp1-production.up.railway.app');
const MOVE_SPEED = 0.08;
const UPDATE_RATE = 50; // ms between server position updates

// ─── Player Controller ───────────────────────────────────────────────────────
function PlayerController({ sessionId, players, onMove }) {
  const keys = useRef({});
  const posRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotRef = useRef(0);
  const lastSentRef = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    const onKeyDown = (e) => { keys.current[e.code] = true; };
    const onKeyUp = (e) => { keys.current[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const k = keys.current;
    const moved =
      k['KeyW'] || k['ArrowUp'] ||
      k['KeyS'] || k['ArrowDown'] ||
      k['KeyA'] || k['ArrowLeft'] ||
      k['KeyD'] || k['ArrowRight'];

    if (moved) {
      const dir = new THREE.Vector3();
      if (k['KeyW'] || k['ArrowUp'])    dir.z -= 1;
      if (k['KeyS'] || k['ArrowDown'])  dir.z += 1;
      if (k['KeyA'] || k['ArrowLeft'])  dir.x -= 1;
      if (k['KeyD'] || k['ArrowRight']) dir.x += 1;
      dir.normalize().multiplyScalar(MOVE_SPEED);
      posRef.current.add(dir);

      // Face direction of travel
      if (dir.length() > 0) {
        rotRef.current = Math.atan2(dir.x, dir.z);
      }
    }

    // Smooth camera follow
    const target = posRef.current;
    camera.position.lerp(
      new THREE.Vector3(target.x, target.y + 10, target.z + 8),
      0.1
    );
    camera.lookAt(target.x, target.y + 1, target.z);

    // Throttle server updates
    const now = Date.now();
    if (now - lastSentRef.current > UPDATE_RATE) {
      lastSentRef.current = now;
      onMove({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotY: rotRef.current,
      });
    }
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function HubScene({ players, mySessionId, onMove, onZoneEnter }) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#0a0a2e" />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#00ffff" distance={30} />
      <pointLight position={[8, 6, 0]} intensity={1} color="#00ff00" distance={16} />
      <pointLight position={[-8, 6, 0]} intensity={1} color="#ffff00" distance={16} />
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#ff00ff" distance={20} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.4} roughness={0.8} />
      </mesh>

      {/* Grid overlay */}
      <gridHelper args={[100, 50, '#111133', '#0d0d2e']} position={[0, 0, 0]} />

      {/* Zones */}
      <Zone name="portal" position={[0, 0, 0]} color="#ff00ff" label="PORTAL" onEnter={onZoneEnter} />
      <Zone name="store" position={[8, 0, 0]} color="#00ff00" label="STORE" onEnter={onZoneEnter} />
      <Zone name="gallery" position={[-8, 0, 0]} color="#ffff00" label="GALLERY" onEnter={onZoneEnter} />

      {/* Player controller (local) */}
      <PlayerController sessionId={mySessionId} players={players} onMove={onMove} />

      {/* All players */}
      {Array.from(players.entries()).map(([sessionId, player]) => (
        <Avatar
          key={sessionId}
          position={[player.x, player.y, player.z]}
          rotY={player.rotY}
          username={player.username}
          pkg={player.pkg}
          isLocal={sessionId === mySessionId}
        />
      ))}
    </>
  );
}

// ─── Hub3D ────────────────────────────────────────────────────────────────────
export default function Hub3D({ authUser, onZoneEnter }) {
  const [players, setPlayers] = useState(new Map());
  const [mySessionId, setMySessionId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [connError, setConnError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const roomRef = useRef(null);

  // Connect to Colyseus
  useEffect(() => {
    if (!authUser) return;

    const token = localStorage.getItem('m3_token');
    if (!token) return;

    setConnError(null);
    const client = new Client(COLYSEUS_URL);

    client.joinOrCreate('hub', { token })
      .then((room) => {
        roomRef.current = room;
        setMySessionId(room.sessionId);
        console.log('[Colyseus] joinOrCreate callback fired');
        setConnected(true);
        console.log('[Colyseus] Connected:', true);
        setConnError(null);
        console.log('[Colyseus] Joined hub, sessionId:', room.sessionId);

        const updatePlayers = () => {
          const map = new Map();
          room.state.players.forEach((player, sessionId) => {
            map.set(sessionId, {
              x: player.x,
              y: player.y,
              z: player.z,
              rotY: player.rotY,
              username: player.username,
              pkg: player.pkg,
              zone: player.zone,
            });
          });
          setPlayers(new Map(map));
        };

        room.state.players.onAdd((player, sessionId) => {
          player.onChange(() => updatePlayers());
          updatePlayers();
        });

        room.state.players.onRemove((_player, sessionId) => {
          updatePlayers();
        });

        room.onLeave((code) => {
          setConnected(false);
          setConnError(`Disconnected (code ${code}). Server may be restarting.`);
        });

        room.onError((code, message) => {
          setConnected(false);
          setConnError(`Connection error: ${message || code}`);
        });

        // Initial state
        updatePlayers();
      })
      .catch((err) => {
        console.error('[Colyseus] Failed to join:', err);
        setConnected(false);
        const msg = err?.message || String(err);
        if (msg.includes('token') || msg.includes('auth') || msg.includes('jwt')) {
          setConnError('Auth failed — try logging out and back in.');
        } else {
          setConnError('Could not reach server. Is it running?');
        }
      });

    return () => {
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
    };
  }, [authUser, retryCount]);

  const handleMove = useCallback((data) => {
    if (roomRef.current) {
      roomRef.current.send('move', data);
    }
  }, []);

  const handleZoneEnter = useCallback((zoneName) => {
    if (roomRef.current) {
      roomRef.current.send('zone', { zone: zoneName });
    }
    onZoneEnter(zoneName);
  }, [onZoneEnter]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Connection status */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        zIndex: 10,
      }}>
        <div style={{
          background: connected ? 'rgba(0,255,0,0.15)' : connError ? 'rgba(255,0,0,0.2)' : 'rgba(255,165,0,0.15)',
          border: `1px solid ${connected ? '#00ff00' : connError ? '#ff4444' : '#ff9900'}`,
          color: connected ? '#00ff00' : connError ? '#ff4444' : '#ff9900',
          padding: '4px 14px',
          borderRadius: 20,
          fontSize: 11,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}>
          {connected ? '● ONLINE' : connError ? '● DISCONNECTED' : '○ CONNECTING...'}
        </div>
        {connError && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: '#ff6666', background: 'rgba(0,0,0,0.7)', padding: '3px 10px', borderRadius: 4, maxWidth: 260, textAlign: 'center' }}>
              {connError}
            </div>
            <button
              onClick={() => setRetryCount(n => n + 1)}
              style={{
                background: 'rgba(255,0,0,0.15)', border: '1px solid #ff4444',
                color: '#ff4444', cursor: 'pointer', padding: '4px 14px',
                borderRadius: 12, fontSize: 10, fontFamily: 'inherit', letterSpacing: 1,
              }}
            >
              ↺ RETRY
            </button>
          </div>
        )}
      </div>

      {console.log('[Colyseus] Canvas should render now, connected:', connected)}
      <Canvas
        camera={{ position: [0, 10, 8], fov: 60 }}
        gl={{ antialias: true }}
        style={{ background: '#0a0a0f' }}
      >
        <HubScene
          players={players}
          mySessionId={mySessionId}
          onMove={handleMove}
          onZoneEnter={handleZoneEnter}
        />
      </Canvas>
    </div>
  );
}