import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import ShipModel from './ShipModel';

export default function JourneyScene({ scrollProgress, crashed }) {
  const groupRef = useRef();
  const { camera } = useThree();
  const shakeRef = useRef(0);

  const keyframes = [
    { pos: [0, 5, 25] },
    { pos: [0, 8, 20] },
    { pos: [0, 6, 15] },
    { pos: [0, 3, 10] },
    { pos: [0, 1, 4] },
  ];

  useEffect(() => {
    const idx = Math.min(Math.floor(scrollProgress / 20), 4);
    const nextIdx = Math.min(idx + 1, 4);
    const t = (scrollProgress % 20) / 20;
    const curr = keyframes[idx];
    const next = keyframes[nextIdx];
    const target = new THREE.Vector3(
      curr.pos[0] + (next.pos[0] - curr.pos[0]) * t,
      curr.pos[1] + (next.pos[1] - curr.pos[1]) * t,
      curr.pos[2] + (next.pos[2] - curr.pos[2]) * t,
    );
    camera.position.lerp(target, 0.08);
    camera.lookAt(0, 1, 0);
  }, [scrollProgress]);

  // Screen shake on crash
  useEffect(() => {
    if (crashed) {
      shakeRef.current = 1;
    }
  }, [crashed]);

  useFrame(() => {
    if (shakeRef.current > 0) {
      const s = shakeRef.current * 0.15;
      camera.position.x += (Math.random() - 0.5) * s;
      camera.position.y += (Math.random() - 0.5) * s;
      shakeRef.current = Math.max(0, shakeRef.current - 0.025);
    }

    if (groupRef.current) {
      const scene = Math.floor(scrollProgress / 20);
      groupRef.current.children.forEach(c => {
        if (c.isLight && c.userData.type === 'key') {
          const target = scene >= 3 ? new THREE.Color('#FF8800') : new THREE.Color('#00FFFF');
          c.color.lerp(target, 0.03);
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" userData={{ type: 'key' }} />
      <pointLight position={[-8, 5, -10]} intensity={0.6} color="#FF00FF" />

      <Stars scrollProgress={scrollProgress} />
      <BackgroundPlanets scrollProgress={scrollProgress} />
      <Portal scrollProgress={scrollProgress} />
      <CrystalField scrollProgress={scrollProgress} />
      <AtmosphereHaze scrollProgress={scrollProgress} />
      <EarthPlanet scrollProgress={scrollProgress} />
      <ShipModel scrollProgress={scrollProgress} />
      <CrashShockwave scrollProgress={scrollProgress} />
      <ExplosionParticles scrollProgress={scrollProgress} />
    </group>
  );
}

function Stars({ scrollProgress }) {
  const stars = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 800; i++) {
      pos.push((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, -Math.random() * 150 - 10);
    }
    return new Float32Array(pos);
  }, []);

  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.00005;
  });

  // Stars streak slightly during descent
  const size = 0.2 + (scrollProgress / 100) * 0.3;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={stars} count={stars.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation color="#FFFFFF" />
    </points>
  );
}

function BackgroundPlanets({ scrollProgress }) {
  const ref1 = useRef();
  const ref2 = useRef();
  useFrame(() => {
    if (ref1.current) ref1.current.rotation.y += 0.0002;
    if (ref2.current) ref2.current.rotation.y += 0.0001;
  });
  const opacity = Math.max(0, 1 - scrollProgress / 80);
  return (
    <>
      <mesh ref={ref1} position={[22, 12, -60]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial emissive="#6600CC" emissiveIntensity={opacity * 0.5} color="#220044" transparent opacity={opacity} />
      </mesh>
      <mesh ref={ref2} position={[-18, 6, -50]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial emissive="#00CCFF" emissiveIntensity={opacity * 0.4} color="#002244" transparent opacity={opacity} />
      </mesh>
    </>
  );
}

function Portal({ scrollProgress }) {
  const group = useRef();
  // Visible scenes 0→2, fades out scene 3
  const opacity = Math.min(scrollProgress / 15, 1) * Math.max(1 - (scrollProgress - 40) / 15, 0);

  useFrame(() => {
    if (!group.current) return;
    group.current.children.forEach((ring, i) => {
      ring.rotation.z += 0.008 * (i % 2 === 0 ? 1 : -1);
      const pulse = 1 + Math.sin(Date.now() * 0.001 + i * 1.2) * 0.08;
      ring.scale.set(pulse, pulse, pulse);
    });
  });

  if (opacity <= 0) return null;

  return (
    <group ref={group} position={[0, 3, 8]}>
      {[1, 1.4, 1.9].map((s, i) => (
        <mesh key={i} scale={s}>
          <torusGeometry args={[2.5, 0.15, 16, 64]} />
          <meshStandardMaterial
            emissive={i % 2 === 0 ? '#00FFFF' : '#FF00FF'}
            emissiveIntensity={0.9}
            transparent opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  );
}

function CrystalField({ scrollProgress }) {
  const group = useRef();
  const crystals = useMemo(() => Array.from({ length: 24 }, () => ({
    pos: [(Math.random() - 0.5) * 35, (Math.random() - 0.5) * 25, -12 - Math.random() * 18],
    rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    scale: 0.4 + Math.random() * 1.2,
  })), []);

  const opacity = Math.min(Math.max((scrollProgress - 25) / 12, 0), 1) *
                  Math.max(1 - (scrollProgress - 52) / 8, 0);

  useFrame(({ clock }) => {
    if (!group.current || opacity <= 0) return;
    group.current.children.forEach((child, i) => {
      child.rotation.x = crystals[i].rot[0] + clock.elapsedTime * 0.25;
      child.rotation.y = crystals[i].rot[1] + clock.elapsedTime * 0.18;
    });
  });

  if (opacity <= 0) return null;

  return (
    <group ref={group}>
      {crystals.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            emissive="#00FFFF" emissiveIntensity={0.7}
            transparent opacity={opacity * 0.85}
            wireframe={scrollProgress > 42 && scrollProgress < 52}
          />
        </mesh>
      ))}
    </group>
  );
}

function AtmosphereHaze({ scrollProgress }) {
  const ref = useRef();
  const intensity = Math.max(0, Math.min((scrollProgress - 58) / 22, 1));

  useFrame(() => {
    if (ref.current) ref.current.material.opacity = intensity * 0.35;
  });

  return (
    <mesh ref={ref} position={[0, -6, 15]} scale={[50, 25, 15]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial transparent opacity={0} color="#FF8800" side={THREE.BackSide} />
    </mesh>
  );
}

function EarthPlanet({ scrollProgress }) {
  const coreRef = useRef();
  const atmRef = useRef();

  const t = Math.max(0, (scrollProgress - 35) / 65);
  const scale = 1 + t * 14;

  useFrame(() => {
    if (coreRef.current) coreRef.current.rotation.y += 0.0003;
    if (atmRef.current) atmRef.current.material.opacity = Math.min(t * 0.55, 0.45);
  });

  return (
    <group position={[0, -10, -35]}>
      <mesh ref={coreRef} scale={scale}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial color="#081828" emissive="#1a3a6a" emissiveIntensity={0.15 + t * 0.4} />
      </mesh>
      {/* Grid overlay — continent suggestion */}
      <mesh scale={scale * 1.005}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial
          emissive="#00ffff" emissiveIntensity={0.25}
          transparent opacity={t * 0.35} wireframe
        />
      </mesh>
      {/* Atmosphere glow */}
      <mesh ref={atmRef} scale={scale * 1.07}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          emissive="#0088ff" emissiveIntensity={1}
          transparent opacity={0} side={THREE.BackSide} depthWrite={false}
        />
      </mesh>
      <pointLight intensity={t * 2.5} color="#00ccff" distance={scale * 18} />
    </group>
  );
}

function CrashShockwave({ scrollProgress }) {
  const r1 = useRef();
  const r2 = useRef();
  const r3 = useRef();

  const crashT = Math.max(0, (scrollProgress - 85) / 15);

  useFrame(() => {
    if (!r1.current) return;
    const s1 = crashT * 10;
    const s2 = Math.max(0, crashT - 0.1) * 8;
    const s3 = Math.max(0, crashT - 0.25) * 6;

    r1.current.scale.set(s1, s1, s1);
    r1.current.material.opacity = Math.max(0, (1 - crashT) * 0.95);

    r2.current.scale.set(s2, s2, s2);
    r2.current.material.opacity = Math.max(0, (1 - Math.max(crashT - 0.1, 0) / 0.9) * 0.8);

    r3.current.scale.set(s3, s3, s3);
    r3.current.material.opacity = Math.max(0, (1 - Math.max(crashT - 0.25, 0) / 0.75) * 0.6);
  });

  return (
    <group position={[0, 0, 2]}>
      <mesh ref={r1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.1, 8, 64]} />
        <meshStandardMaterial emissive="#ff6600" emissiveIntensity={3} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={r2} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.07, 8, 64]} />
        <meshStandardMaterial emissive="#ffcc00" emissiveIntensity={3} transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh ref={r3} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.05, 8, 64]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={3} transparent opacity={0} depthWrite={false} />
      </mesh>
      {crashT > 0 && crashT < 0.4 && (
        <pointLight intensity={8 * (1 - crashT / 0.4)} color="#ff5500" distance={30} />
      )}
    </group>
  );
}

function ExplosionParticles({ scrollProgress }) {
  const ref = useRef();
  const data = useMemo(() => {
    const N = 200;
    const positions = new Float32Array(N * 3);
    const velocities = [];
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 3 + Math.random() * 8;
      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.abs(Math.cos(phi)) * speed * 0.8 + 1,
        Math.sin(phi) * Math.sin(theta) * speed,
      );
    }
    return { positions, velocities, age: new Float32Array(N).fill(-1) };
  }, []);

  const spawnedRef = useRef(false);
  const frameCount = useRef(0);

  useFrame(() => {
    if (!ref.current) return;
    const crashT = Math.max(0, (scrollProgress - 85) / 15);

    // Spawn once on crash
    if (crashT > 0.05 && !spawnedRef.current) {
      spawnedRef.current = true;
      data.age.fill(0);
      for (let i = 0; i < 200; i++) {
        data.positions[i * 3] = 0;
        data.positions[i * 3 + 1] = 0;
        data.positions[i * 3 + 2] = 2;
      }
    }

    if (!spawnedRef.current) return;

    const dt = 0.016;
    const pos = ref.current.geometry.attributes.position.array;

    for (let i = 0; i < 200; i++) {
      if (data.age[i] < 0) continue;
      data.age[i] += dt;
      const t = data.age[i];
      if (t > 2.5) { data.age[i] = -1; continue; }
      pos[i * 3]     = data.positions[i * 3]     + data.velocities[i * 3]     * t;
      pos[i * 3 + 1] = data.positions[i * 3 + 1] + data.velocities[i * 3 + 1] * t - 4 * t * t;
      pos[i * 3 + 2] = data.positions[i * 3 + 2] + data.velocities[i * 3 + 2] * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    const alive = Array.from(data.age).filter(a => a >= 0).length;
    ref.current.material.opacity = alive > 0 ? Math.min(alive / 200, 1) * 0.9 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.positions} count={200} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.25} sizeAttenuation color="#ff8800" transparent opacity={0} depthWrite={false} />
    </points>
  );
}
