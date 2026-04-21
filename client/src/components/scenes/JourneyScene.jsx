import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ShipModel from './ShipModel';

export default function JourneyScene({ scrollProgress }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const particlesRef = useRef();
  const sceneStateRef = useRef({ crystals: [] });

  // Camera keyframes [scene, position, lookAt]
  const keyframes = [
    { pos: [0, 5, 25], look: [0, 2, 0], scene: 0 },
    { pos: [0, 8, 20], look: [0, 3, 5], scene: 1 },
    { pos: [0, 6, 18], look: [0, 4, 8], scene: 2 },
    { pos: [0, 4, 12], look: [0, 2, 10], scene: 3 },
    { pos: [0, 2, 8], look: [0, 0, 15], scene: 4 },
  ];

  // Interpolate camera
  useEffect(() => {
    const idx = Math.min(Math.floor(scrollProgress / 20), 4);
    const nextIdx = Math.min(idx + 1, 4);
    const t = (scrollProgress % 20) / 20;
    const curr = keyframes[idx];
    const next = keyframes[nextIdx];

    const pos = new THREE.Vector3(
      curr.pos[0] + (next.pos[0] - curr.pos[0]) * t,
      curr.pos[1] + (next.pos[1] - curr.pos[1]) * t,
      curr.pos[2] + (next.pos[2] - curr.pos[2]) * t
    );
    camera.position.lerp(pos, 0.1);
    camera.lookAt(0, 2, 10);
  }, [scrollProgress]);

  useFrame(() => {
    if (groupRef.current) {
      const scene = Math.floor(scrollProgress / 20);

      // Update lighting based on scene
      const lights = groupRef.current.children.filter(c => c.isLight);
      lights.forEach(light => {
        if (light.userData.type === 'key') {
          if (scene >= 3) {
            light.color.lerp(new THREE.Color('#FFD700'), 0.05);
          } else {
            light.color.lerp(new THREE.Color('#00FFFF'), 0.05);
          }
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#00FFFF" userData={{ type: 'key' }} />
      <pointLight position={[-8, 5, -10]} intensity={0.5} color="#FF00FF" />

      {/* Stars background */}
      <Stars scrollProgress={scrollProgress} />

      {/* Planets */}
      <Planet position={[20, 10, -50]} size={8} color="#6600CC" scrollProgress={scrollProgress} />
      <Planet position={[-15, 5, -40]} size={5} color="#00CCFF" scrollProgress={scrollProgress} />

      {/* Portal (Scene 1-3) */}
      <Portal scrollProgress={scrollProgress} visible={scrollProgress < 60} />

      {/* Crystal field (Scene 2-3) */}
      <CrystalField scrollProgress={scrollProgress} />

      {/* Atmosphere haze (Scene 3-5) */}
      <AtmosphereHaze scrollProgress={scrollProgress} />

      {/* Ship with smoke trail */}
      <ShipModel scrollProgress={scrollProgress} />

      {/* Landing particles (Scene 5) */}
      <LandingParticles scrollProgress={scrollProgress} />
    </group>
  );
}

function Stars({ scrollProgress }) {
  const stars = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 500; i++) {
      positions.push(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        -Math.random() * 100 - 20
      );
    }
    return new Float32Array(positions);
  }, []);

  const starRef = useRef();
  useFrame(() => {
    if (starRef.current) {
      starRef.current.rotation.z += 0.0001;
    }
  });

  return (
    <points ref={starRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={stars} count={stars.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.3} sizeAttenuation color="#FFFFFF" />
    </points>
  );
}

function Planet({ position, size, color, scrollProgress }) {
  const mesh = useRef();
  useFrame(() => {
    if (mesh.current) mesh.current.rotation.y += 0.0002;
  });

  const opacity = Math.max(0, 1 - (scrollProgress / 100) * 0.5);
  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial emissive={color} emissiveIntensity={opacity * 0.4} color={color} />
    </mesh>
  );
}

function Portal({ scrollProgress, visible }) {
  const group = useRef();
  const opacity = visible ? Math.min(scrollProgress / 20, 1, 1 - (scrollProgress - 40) / 20) : 0;

  useFrame(() => {
    if (group.current) {
      group.current.children.forEach((ring, i) => {
        ring.rotation.z += 0.01 * (i + 1);
        const pulse = 1 + Math.sin(Date.now() * 0.001 + i) * 0.1;
        ring.scale.set(pulse, pulse, pulse);
      });
    }
  });

  return (
    <group ref={group} position={[0, 5, 5]}>
      {[1, 1.5, 2].map((scale, i) => (
        <mesh key={i} scale={scale} position={[0, 0, 0]}>
          <torusGeometry args={[2, 0.2, 16, 32]} />
          <meshStandardMaterial
            emissive={i % 2 === 0 ? '#00FFFF' : '#FF00FF'}
            emissiveIntensity={opacity * 0.8}
            transparent
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function CrystalField({ scrollProgress }) {
  const group = useRef();
  const crystals = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        pos: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -10 - Math.random() * 15],
        rot: [Math.random(), Math.random(), Math.random()],
        scale: 0.5 + Math.random() * 1,
      });
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.children.forEach((child, i) => {
        child.rotation.x = crystals[i].rot[0] + clock.elapsedTime * 0.3;
        child.rotation.y = crystals[i].rot[1] + clock.elapsedTime * 0.2;
        const depth = scrollProgress > 40 ? -10 - (scrollProgress - 40) * 0.3 : -10;
        child.position.z = crystals[i].pos[2] + depth;
      });
    }
  });

  const opacity = Math.min(Math.max((scrollProgress - 30) / 15, 0), 1 - (scrollProgress - 55) / 5);

  return (
    <group ref={group}>
      {crystals.map((crystal, i) => (
        <mesh key={i} position={crystal.pos} rotation={crystal.rot} scale={crystal.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            emissive="#00FFFF"
            emissiveIntensity={opacity * 0.6}
            transparent
            opacity={Math.max(opacity, 0.2)}
            wireframe={scrollProgress > 45 && scrollProgress < 55}
          />
        </mesh>
      ))}
    </group>
  );
}

function AtmosphereHaze({ scrollProgress }) {
  const mesh = useRef();
  const atmosphereStart = 60;
  const intensity = Math.max(0, Math.min((scrollProgress - atmosphereStart) / 20, 1));

  useFrame(() => {
    if (mesh.current) {
      mesh.current.material.emissiveIntensity = intensity * 0.8;
    }
  });

  return (
    <mesh ref={mesh} position={[0, -5, 20]} scale={[40, 20, 10]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial
        emissive="#FFD700"
        emissiveIntensity={0}
        transparent
        opacity={intensity * 0.3}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function LandingParticles({ scrollProgress }) {
  const points = useRef();
  const particleData = useMemo(() => {
    const positions = new Float32Array(150 * 3);
    const velocities = new Float32Array(150 * 3);
    const lifetimes = new Float32Array(150);
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      positions[i * 3] = Math.cos(angle) * speed * 0.1;
      positions[i * 3 + 1] = Math.random() * 5;
      positions[i * 3 + 2] = Math.sin(angle) * speed * 0.1;
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = 2 + Math.random() * 3;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
      lifetimes[i] = 1.5;
    }
    return { positions, velocities, lifetimes };
  }, []);

  const landingStart = 80;
  const landingProgress = Math.max(0, (scrollProgress - landingStart) / 20);
  const shouldSpawn = landingProgress > 0 && landingProgress < 1;

  useFrame(() => {
    if (points.current && shouldSpawn) {
      const pos = points.current.geometry.attributes.position.array;
      const vel = particleData.velocities;
      const life = particleData.lifetimes;

      for (let i = 0; i < 150; i++) {
        if (life[i] > 0 && landingProgress > 0) {
          pos[i * 3] += vel[i * 3] * 0.016;
          pos[i * 3 + 1] += (vel[i * 3 + 1] - 0.5) * 0.016;
          pos[i * 3 + 2] += vel[i * 3 + 2] * 0.016;
          life[i] -= 0.016;
        }
      }
      points.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={points} position={[0, 0, 10]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={particleData.positions} count={150} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        sizeAttenuation
        color="#FFD700"
        emissive="#FF6600"
        opacity={Math.max(0, 1 - landingProgress * 0.5)}
        transparent
      />
    </points>
  );
}
