import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Client } from 'colyseus.js';
import * as THREE from 'three';
import Avatar from './Avatar';
import Zone from './Zone';
import SpeechBubble from './SpeechBubble';
import Chatbox from './UI/Chatbox';
import MobileControls from './MobileControls';
import ProfilePanel from './ProfilePanel';
import Store from './UI/Store';
import Gallery from './UI/Gallery';

const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL || 'wss://m3-hub-mvp1-production.up.railway.app';
const MOVE_SPEED = 0.08;
const UPDATE_RATE = 50;
const SAVE_RATE = 500;
const POS_KEY = 'm3_player_pos';

function loadSavedPos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) {
      const { x, y, z, rotY } = JSON.parse(raw);
      return { pos: new THREE.Vector3(x ?? 0, y ?? 0, z ?? 0), rotY: rotY ?? 0 };
    }
  } catch {}
  return { pos: new THREE.Vector3(0, 0, 0), rotY: 0 };
}

function PlayerController({ sessionId, players, onMove }) {
  const keys = useRef({});
  const saved = useRef(loadSavedPos());
  const posRef = useRef(saved.current.pos);
  const rotRef = useRef(saved.current.rotY);
  const lastSentRef = useRef(0);
  const lastSavedRef = useRef(0);
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

      if (dir.length() > 0) {
        rotRef.current = Math.atan2(dir.x, dir.z);
      }
    }

    const target = posRef.current;
    camera.position.lerp(
      new THREE.Vector3(target.x, target.y + 10, target.z + 8),
      0.1
    );
    camera.lookAt(target.x, target.y + 1, target.z);

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

    if (now - lastSavedRef.current > SAVE_RATE) {
      lastSavedRef.current = now;
      localStorage.setItem(POS_KEY, JSON.stringify({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotY: rotRef.current,
      }));
    }
  });

  return null;
}

function AtmosphericParticles({ count = 120 }) {
  const ref = useRef();
  const positions = useRef(
    Float32Array.from({ length: count * 3 }, (_, i) =>
      i % 3 === 1 ? Math.random() * 12 + 1 : (Math.random() - 0.5) * 60
    )
  );
  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += delta * 0.4;
      if (pos[i * 3 + 1] > 14) pos[i * 3 + 1] = 0.5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#00ffff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function ZonePortal({ position, color, label, zoneName, onEnter }) {
  const ringRef = useRef();
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.elapsedTime * 1.2;
    }
  });
  return (
    <group position={position} onClick={() => onEnter(zoneName)}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={ringRef} position={[0, 2.5, 0]}>
        <torusGeometry args={[0.7, 0.08, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={1.2} color={color} distance={8} />
    </group>
  );
}

function HubScene({ players, mySessionId, onMove, onZoneEnter, speechBubbles, isMobile }) {
  return (
    <>
      <ambientLight intensity={isMobile ? 0.5 : 0.35} color="#080820" />
      <pointLight position={[0, 10, 0]} intensity={2} color="#00ffff" distance={35} />
      {!isMobile && <pointLight position={[20, 6, 0]} intensity={1.2} color="#00ff88" distance={22} />}
      {!isMobile && <pointLight position={[-20, 6, 0]} intensity={1.2} color="#ff00ff" distance={22} />}
      <pointLight position={[0, 4, 15]} intensity={0.8} color="#ffff00" distance={18} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#06060f" metalness={0.5} roughness={0.7} />
      </mesh>

      <gridHelper args={[120, isMobile ? 20 : 40, '#0a0a33', '#080820']} position={[0, 0.01, 0]} />

      {!isMobile && <AtmosphericParticles count={100} />}

      <ZonePortal position={[0, 0, -18]}  color="#ff00ff" label="PORTAL"  zoneName="portal"  onEnter={onZoneEnter} />
      <ZonePortal position={[18, 0, 0]}   color="#00ff00" label="STORE"   zoneName="store"   onEnter={onZoneEnter} />
      <ZonePortal position={[-18, 0, 0]}  color="#00ffff" label="GALLERY" zoneName="gallery" onEnter={onZoneEnter} />
      <ZonePortal position={[0, 0, 18]}   color="#ffaa00" label="MUSIC"   zoneName="music"   onEnter={onZoneEnter} />

      <Zone name="store" position={[15, 0, 0]} color="#00ff00" label="STORE" onEnter={onZoneEnter} />
      <Zone name="gallery" position={[-15, 0, 0]} color="#ffff00" label="GALLERY" onEnter={onZoneEnter} />

      <PlayerController sessionId={mySessionId} players={players} onMove={onMove} />

      {Array.from(players.entries()).map(([sessionId, player]) => (
        <Avatar
          key={sessionId}
          position={[player.x, player.y, player.z]}
          rotY={player.rotY}
          username={player.username}
          pkg={player.pkg}
          isLocal={sessionId === mySessionId}
          avatarJson={player.avatar}
        />
      ))}

      {speechBubbles.map((bubble) => (
        <SpeechBubble
          key={bubble.id}
          position={bubble.position}
          text={bubble.text}
          duration={4000}
          fadeOutDuration={800}
          onComplete={() => {}}
        />
      ))}
    </>
  );
}

export default function Hub3D({ authUser, onZoneEnter, onLogout }) {
  const [players, setPlayers] = useState(new Map());
  const [mySessionId, setMySessionId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [speechBubbles, setSpeechBubbles] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [showProfile, setShowProfile] = useState(false);
  const [currentZone, setCurrentZone] = useState(null);
  const [isMobile] = useState(() => window.innerWidth < 600);
  const roomRef = useRef(null);
  const bubbleIdRef = useRef(0);

  useEffect(() => {
    if (!authUser) return;

    const token = localStorage.getItem('m3_token');
    if (!token) return;

    const client = new Client(COLYSEUS_URL);
    const avatarJson = localStorage.getItem('m3_avatar') || '';

    client.joinOrCreate('hub', { token, avatar: avatarJson })
      .then((room) => {
        roomRef.current = room;
        setMySessionId(room.sessionId);
        setConnected(true);

        const updatePlayers = () => {
          const map = new Map();
          const typing = new Map();
          room.state.players.forEach((player, sessionId) => {
            map.set(sessionId, {
              x: player.x,
              y: player.y,
              z: player.z,
              rotY: player.rotY,
              username: player.username,
              pkg: player.pkg,
              zone: player.zone,
              isTyping: player.isTyping,
              avatar: player.avatar,
            });
            typing.set(sessionId, player.isTyping);
          });
          setPlayers(new Map(map));
          setTypingUsers(new Map(typing));
        };

        room.state.players.onAdd((player, sessionId) => {
          player.onChange(() => {
            updatePlayers();
            setTypingUsers((prev) => new Map(prev).set(sessionId, player.isTyping));
          });
          updatePlayers();
        });

        room.state.players.onRemove((_player, sessionId) => {
          updatePlayers();
        });

        room.onMessage('chatMessage', (data) => {
          const senderPlayer = room.state.players.get(data.sessionId);
          if (senderPlayer) {
            const bubbleId = bubbleIdRef.current++;
            setSpeechBubbles((prev) => [
              ...prev,
              {
                id: bubbleId,
                text: data.text,
                position: [senderPlayer.x, senderPlayer.y + 2.5, senderPlayer.z],
              },
            ]);
            setTimeout(() => {
              setSpeechBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
            }, 5100);
          }
        });

        updatePlayers();
      })
      .catch((err) => {
        console.error('[Colyseus] Failed to join:', err);
      });

    return () => {
      if (roomRef.current) {
        roomRef.current.leave();
        roomRef.current = null;
      }
    };
  }, [authUser]);

  const handleMove = useCallback((data) => {
    if (roomRef.current) {
      roomRef.current.send('move', data);
    }
  }, []);

  const handleZoneEnter = useCallback((zoneName) => {
    setCurrentZone(zoneName);
    if (roomRef.current) {
      roomRef.current.send('zone', { zone: zoneName });
    }
    onZoneEnter(zoneName);
  }, [onZoneEnter]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Connection status */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        background: connected ? 'rgba(0,255,0,0.15)' : 'rgba(255,0,0,0.15)',
        border: `1px solid ${connected ? '#00ff00' : '#ff0000'}`,
        color: connected ? '#00ff00' : '#ff4444',
        padding: '4px 14px', borderRadius: 20, fontSize: 11,
        userSelect: 'none', zIndex: 10,
      }}>
        {connected ? '● ONLINE' : '○ CONNECTING...'}
      </div>

      {/* Profile button */}
      <button
        onClick={() => setShowProfile(true)}
        style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,255,255,0.15)', border: '1px solid #00ffff',
          color: '#00ffff', padding: '8px 14px', borderRadius: 8,
          fontSize: 11, cursor: 'pointer', fontFamily: 'monospace',
          fontWeight: 'bold', userSelect: 'none', zIndex: 10,
        }}
      >
        👤 {authUser?.username}
      </button>

      {/* Logout */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: 'rgba(0,0,0,0.6)', border: '1px solid #00ffff',
        color: '#00ffff', padding: '8px 14px', borderRadius: 8,
        fontSize: 11, userSelect: 'none', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button
          onClick={onLogout}
          style={{
            background: 'rgba(255,0,0,0.2)', border: '1px solid #ff4444',
            color: '#ff4444', padding: '4px 10px', borderRadius: 4,
            fontSize: 10, cursor: 'pointer', fontWeight: 'bold', fontFamily: 'monospace',
          }}
        >
          LOGOUT
        </button>
      </div>

      <Canvas
        camera={(() => {
          try {
            const raw = localStorage.getItem(POS_KEY);
            if (raw) {
              const { x = 0, z = 0 } = JSON.parse(raw);
              return { position: [x, 10, z + 8], fov: 60 };
            }
          } catch {}
          return { position: [0, 10, 8], fov: 60 };
        })()}
        gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
        style={{ background: '#0a0a0f', touchAction: 'none' }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
      >
        <HubScene
          players={players}
          mySessionId={mySessionId}
          onMove={handleMove}
          onZoneEnter={handleZoneEnter}
          speechBubbles={speechBubbles}
          isMobile={isMobile}
        />
      </Canvas>

      {isMobile && <MobileControls />}

      {connected && <Chatbox roomRef={roomRef} typingUsers={typingUsers} />}

      {showProfile && <ProfilePanel user={authUser} onClose={() => setShowProfile(false)} />}

      {currentZone === 'store' && <Store onClose={() => setCurrentZone(null)} />}
      {currentZone === 'gallery' && <Gallery onClose={() => setCurrentZone(null)} />}
    </div>
  );
}
