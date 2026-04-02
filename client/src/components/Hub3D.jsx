import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Client } from 'colyseus.js';
import * as THREE from 'three';
import Avatar from './Avatar';
import Zone from './Zone';

const COLYSEUS_URL = 'https://bejewelled-quokka-402582.netlify.app';
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
      <pointLight position={[15, 6, 0]} inten