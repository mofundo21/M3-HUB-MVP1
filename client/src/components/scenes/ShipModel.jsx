import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ShipModel({ scrollProgress }) {
  const shipRef = useRef();
  const smokeRef = useRef();
  const smokeDataRef = useRef({
    particles: [],
    nextSpawn: 0,
  });

  // Ship path along journey
  const path = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 8, 25),  // Scene 0
      new THREE.Vector3(1, 7, 18),  // Scene 1
      new THREE.Vector3(-1, 6, 12), // Scene 2
      new THREE.Vector3(0.5, 4, 5), // Scene 3
      new THREE.Vector3(0, 0, 0),   // Scene 4 (landing)
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Calculate ship position and rotation
  const shipProgress = scrollProgress / 100;
  const shipPos = path.getPoint(Math.min(shipProgress, 1));
  const shipRotation = {
    x: shipProgress * 0.5,
    y: shipProgress * 0.3,
    z: scrollProgress > 60 ? (scrollProgress - 60) * 0.02 : 0,
  };

  // Smoke particle system
  useFrame(({ clock }) => {
    if (shipRef.current) {
      shipRef.current.position.copy(shipPos);
      shipRef.current.rotation.x = shipRotation.x;
      shipRef.current.rotation.y = shipRotation.y;
      shipRef.current.rotation.z = shipRotation.z;

      const scale = 0.5 + (scrollProgress / 100) * 0.8;
      shipRef.current.scale.set(scale, scale, scale);
    }

    if (smokeRef.current) {
      const smokeData = smokeDataRef.current;
      const spawnRate = 3 + Math.floor(scrollProgress / 20) * 2;

      // Spawn new particles
      if (smokeData.nextSpawn <= 0) {
        for (let i = 0; i < spawnRate; i++) {
          if (smokeData.particles.length < 300) {
            smokeData.particles.push({
              pos: new THREE.Vector3(
                shipPos.x + (Math.random() - 0.5) * 0.5,
                shipPos.y - 0.5,
                shipPos.z + (Math.random() - 0.5) * 0.5
              ),
              vel: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                -Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
              ),
              life: 1.5 + Math.random() * 0.5,
              maxLife: 1.5 + Math.random() * 0.5,
            });
          }
        }
        smokeData.nextSpawn = 0.016 / (spawnRate / 60);
      }
      smokeData.nextSpawn -= 0.016;

      // Update particles
      const positions = smokeRef.current.geometry.attributes.position.array;
      const colors = smokeRef.current.geometry.attributes.color.array;

      smokeData.particles = smokeData.particles.filter(p => p.life > 0);
      smokeData.particles.forEach((p, i) => {
        p.pos.add(p.vel);
        p.vel.y -= 0.01;
        p.life -= 0.016;

        const idx = i * 3;
        positions[idx] = p.pos.x;
        positions[idx + 1] = p.pos.y;
        positions[idx + 2] = p.pos.z;

        const alpha = (p.life / p.maxLife) * 0.8;
        const colorIdx = i * 3;
        colors[colorIdx] = 0;
        colors[colorIdx + 1] = 1;
        colors[colorIdx + 2] = 1;
      });

      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      smokeRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  const smokePositions = useMemo(() => new Float32Array(300 * 3), []);
  const smokeColors = useMemo(() => new Float32Array(300 * 3), []);

  return (
    <group>
      {/* Smoke trail */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={smokePositions} count={300} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={smokeColors} count={300} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </points>

      {/* Ship body */}
      <group ref={shipRef}>
        {/* Main hull - cone */}
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.3, 1, 8]} />
          <meshStandardMaterial emissive="#00FFFF" emissiveIntensity={0.8} />
        </mesh>

        {/* Cockpit - sphere */}
        <mesh position={[0, 0.3, -0.2]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial emissive="#FF00FF" emissiveIntensity={0.9} />
        </mesh>

        {/* Engine - cylinder */}
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.4, 6]} />
          <meshStandardMaterial emissive="#FFD700" emissiveIntensity={0.7} />
        </mesh>

        {/* Engine glow */}
        <pointLight position={[0, -0.6, 0]} intensity={1} color="#FFD700" distance={5} />

        {/* Wings - boxes */}
        <mesh position={[0.4, -0.1, -0.1]} scale={[0.15, 0.1, 0.3]}>
          <boxGeometry />
          <meshStandardMaterial emissive="#00FFFF" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.4, -0.1, -0.1]} scale={[0.15, 0.1, 0.3]}>
          <boxGeometry />
          <meshStandardMaterial emissive="#00FFFF" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  );
}
