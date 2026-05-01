import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Client } from 'colyseus.js';
import * as THREE from 'three';
import Avatar from './Avatar';
import Zone from './Zone';
import PortalGate from './PortalGate';
import SpeechBubble from './SpeechBubble';
import GalleryRoom from './GalleryRoom';
import Chatbox from './UI/Chatbox';
import MobileControls from './MobileControls';
import ProfilePanel from './ProfilePanel';
import PlayerCard from './PlayerCard';
import TopBar from './UI/TopBar';
import BottomBar from './UI/BottomBar';
import ZoneMenu from './UI/ZoneMenu';
import PlayerList from './UI/PlayerList';
import { useDevice } from '../context/DeviceContext';
import {
  savePlayerPos, savePlayerRot, saveCameraPos,
  getPlayerPos, getPlayerRot, getCameraPos,
  saveZone, saveAudioMuted, saveChatOpen,
  getZone, getAudioMuted, getChatOpen,
  clearSession,
} from '../hooks/usePersistence';

const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL || 'wss://m3-hub-mvp1-production.up.railway.app';
const MOVE_SPEED = 0.08;
const UPDATE_RATE = 50; // ms between server position updates
const SAVE_RATE = 500;  // ms between position saves to localStorage

// ─── Player Controller ───────────────────────────────────────────────────────
function PlayerController({ sessionId, players, onMove }) {
  const keys = useRef({});
  const savedPos = getPlayerPos();
  const savedRot = getPlayerRot();
  const posRef = useRef(new THREE.Vector3(savedPos.x, savedPos.y, savedPos.z));
  const rotRef = useRef(savedRot.y);
  const lastSentRef = useRef(0);
  const lastSavedRef = useRef(0);
  const { camera } = useThree();

  // Restore camera position on first mount
  useEffect(() => {
    const cam = getCameraPos();
    if (cam) {
      camera.position.set(cam.x, cam.y, cam.z);
    }
  }, []);

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

    const now = Date.now();

    // Throttle server updates
    if (now - lastSentRef.current > UPDATE_RATE) {
      lastSentRef.current = now;
      onMove({
        x: posRef.current.x,
        y: posRef.current.y,
        z: posRef.current.z,
        rotY: rotRef.current,
      });
    }

    // Throttle localStorage saves
    if (now - lastSavedRef.current > SAVE_RATE) {
      lastSavedRef.current = now;
      savePlayerPos(posRef.current.x, posRef.current.y, posRef.current.z);
      savePlayerRot(rotRef.current);
      saveCameraPos(camera.position.x, camera.position.y, camera.position.z);
    }
  });

  return null;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function HubScene({ players, mySessionId, onMove, onZoneEnter, speechBubbles, isMobile, onPlayerClick }) {
  const gridDivisions = isMobile ? 25 : 50;
  return (
    <>
      {/* Lighting — fewer lights on mobile */}
      <ambientLight intensity={isMobile ? 0.5 : 0.3} color="#0a0a2e" />
      <pointLight position={[0, 8, 0]} intensity={1.5} color="#00ffff" distance={30} />
      {!isMobile && <pointLight position={[15, 6, 0]} intensity={1} color="#00ff00" distance={20} />}
      {!isMobile && <pointLight position={[-15, 6, 0]} intensity={1} color="#ffff00" distance={20} />}
      <pointLight position={[0, 6, 0]} intensity={0.8} color="#ff00ff" distance={20} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0a0a0f" metalness={0.4} roughness={0.8} />
      </mesh>

      {/* Grid overlay — half density on mobile */}
      <gridHelper args={[100, gridDivisions, '#111133', '#0d0d2e']} position={[0, 0, 0]} />

      {/* Zones */}
      <Zone name="portal" position={[0, 0, 0]} color="#ff00ff" label="PORTAL" onEnter={onZoneEnter} />
      <Zone name="store" position={[15, 0, 0]} color="#00ff00" label="STORE" onEnter={onZoneEnter} />

      {/* Gallery Portal Gate */}
      <PortalGate position={[-15, 0, 0]} />

      {/* Gallery Room */}
      <GalleryRoom position={[-15, 0, 0]} />

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
          avatarJson={player.avatar}
          onClick={sessionId !== mySessionId ? () => onPlayerClick(player) : undefined}
        />
      ))}

      {/* Speech bubbles */}
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

// ─── Hub3D ────────────────────────────────────────────────────────────────────
export default function Hub3D({ authUser, onZoneEnter, onLogout }) {
  const [players, setPlayers] = useState(new Map());
  const [mySessionId, setMySessionId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [speechBubbles, setSpeechBubbles] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());
  const [showProfile, setShowProfile] = useState(false);
  const [showChat, setShowChat] = useState(() => getChatOpen());
  const [showZoneMenu, setShowZoneMenu] = useState(false);
  const [currentZone, setCurrentZone] = useState(() => getZone());
  const [muted, setMuted] = useState(() => getAudioMuted());
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const roomRef = useRef(null);
  const bubbleIdRef = useRef(0);
  const { isMobile } = useDevice();

  // Connect to Colyseus
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
        console.log('[Colyseus] Joined hub, sessionId:', room.sessionId);

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

        // Chat message listener
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
            // Auto-remove bubble after animation
            setTimeout(() => {
              setSpeechBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
            }, 5100); // 300ms fade in + 4000ms hold + 800ms fade out
          }
        });

        // Initial state
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

  const handlePlayerClick = useCallback((player) => {
    setSelectedPlayer(player);
  }, []);

  const handleZoneEnter = useCallback((zoneName) => {
    setCurrentZone(zoneName);
    saveZone(zoneName);
    if (roomRef.current) {
      roomRef.current.send('zone', { zone: zoneName });
    }
    onZoneEnter(zoneName);
  }, [onZoneEnter]);

  const handleChatToggle = useCallback(() => {
    setShowChat(v => {
      const next = !v;
      saveChatOpen(next);
      return next;
    });
  }, []);

  const handleAudioToggle = useCallback(() => {
    setMuted(v => {
      const next = !v;
      saveAudioMuted(next);
      return next;
    });
  }, []);

  const avatarColor = (() => {
    try {
      const raw = localStorage.getItem('m3_avatar');
      if (raw) return JSON.parse(raw)?.color || '#00ffff';
    } catch {}
    return '#00ffff';
  })();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Top bar */}
      <TopBar
        username={authUser?.username}
        zone={currentZone.toUpperCase()}
        playerCount={players.size}
        avatarColor={avatarColor}
        onProfile={() => setShowProfile(true)}
      />

      {/* 3D canvas — inset to leave room for top/bottom bars */}
      <div style={{ position: 'absolute', top: 44, bottom: 52, left: 0, right: 0 }}>
        <Canvas
          camera={{ position: [0, 10, 8], fov: 60 }}
          gl={{ antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' }}
          style={{ background: '#0a0a0f', touchAction: 'none', width: '100%', height: '100%' }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
        >
          <HubScene
            players={players}
            mySessionId={mySessionId}
            onMove={handleMove}
            onZoneEnter={handleZoneEnter}
            speechBubbles={speechBubbles}
            isMobile={isMobile}
            onPlayerClick={handlePlayerClick}
          />
        </Canvas>

        {/* Mobile controls */}
        {isMobile && <MobileControls />}

        {/* Player list (top-right of canvas area) */}
        {connected && (
          <PlayerList players={players} mySessionId={mySessionId} />
        )}

        {/* Chatbox */}
        {connected && showChat && (
          <Chatbox roomRef={roomRef} typingUsers={typingUsers} />
        )}
      </div>

      {/* Bottom bar */}
      <BottomBar
        showChat={showChat}
        onChatToggle={handleChatToggle}
        muted={muted}
        onAudioToggle={handleAudioToggle}
        onZoneMenu={() => setShowZoneMenu(v => !v)}
        onLogout={onLogout}
        connected={connected}
      />

      {/* Zone menu */}
      <ZoneMenu
        show={showZoneMenu}
        currentZone={currentZone}
        onZoneSelect={handleZoneEnter}
        onClose={() => setShowZoneMenu(false)}
      />

      {/* Profile Panel */}
      {showProfile && <ProfilePanel user={authUser} onClose={() => setShowProfile(false)} />}

      {/* Player Card */}
      {selectedPlayer && (
        <PlayerCard player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}