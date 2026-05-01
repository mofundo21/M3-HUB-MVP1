import React, { useRef, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    if (crashed) shakeRef.current = 1;
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

      <NebulaBackground scrollProgress={scrollProgress} />
      <Stars scrollProgress={scrollProgress} />
      <ShootingStars scrollProgress={scrollProgress} />
      <BackgroundPlanets scrollProgress={scrollProgress} />
      <Portal scrollProgress={scrollProgress} />
      <EnergyWaves scrollProgress={scrollProgress} />
      <CrystalField scrollProgress={scrollProgress} />
      <AtmosphereHaze scrollProgress={scrollProgress} />
      <AtmosphericParticles scrollProgress={scrollProgress} />
      <EarthPlanet scrollProgress={scrollProgress} />
      <ShipModel scrollProgress={scrollProgress} />
      <CrashShockwave scrollProgress={scrollProgress} />
      <ExplosionParticles scrollProgress={scrollProgress} />
      <CraterMesh scrollProgress={scrollProgress} />
    </group>
  );
}

// ─── Nebula Background ────────────────────────────────────────────────────────
function NebulaBackground({ scrollProgress }) {
  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  const opacity = Math.max(0, 1 - scrollProgress / 60);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.05;
    if (ref1.current) ref1.current.rotation.y = t;
    if (ref2.current) ref2.current.rotation.y = -t * 0.7;
    if (ref3.current) ref3.current.rotation.z = t * 0.4;
  });

  if (opacity <= 0) return null;

  return (
    <group>
      <mesh ref={ref1}>
        <sphereGeometry args={[200, 16, 16]} />
        <meshBasicMaterial color="#001133" side={THREE.BackSide} transparent opacity={opacity} />
      </mesh>
      <mesh ref={ref2}>
        <sphereGeometry args={[180, 16, 16]} />
        <meshBasicMaterial color="#110022" side={THREE.BackSide} transparent opacity={opacity * 0.6} />
      </mesh>
      <mesh ref={ref3}>
        <sphereGeometry args={[160, 12, 12]} />
        <meshBasicMaterial color="#002211" side={THREE.BackSide} transparent opacity={opacity * 0.4} />
      </mesh>
      {/* Nebula glow clouds */}
      {[
        { pos: [80, 30, -120], col: '#003366', r: 55 },
        { pos: [-90, -20, -100], col: '#330033', r: 48 },
        { pos: [10, 60, -140], col: '#002233', r: 40 },
      ].map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.r, 8, 8]} />
          <meshBasicMaterial color={n.col} transparent opacity={opacity * 0.25} side={THREE.FrontSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ scrollProgress }) {
  const stars = useMemo(() => {
    const pos = [];
    for (let i = 0; i < 1200; i++) {
      pos.push((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, -Math.random() * 150 - 10);
    }
    return new Float32Array(pos);
  }, []);

  const ref = useRef();
  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.00005;
  });

  const size = 0.18 + (scrollProgress / 100) * 0.35;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={stars} count={stars.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={size} sizeAttenuation color="#FFFFFF" />
    </points>
  );
}

// ─── Shooting Stars ───────────────────────────────────────────────────────────
function ShootingStars({ scrollProgress }) {
  const opacity = Math.max(0, 1 - scrollProgress / 40);
  const ref = useRef();

  const starData = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    x: (Math.random() - 0.5) * 180,
    y: 10 + Math.random() * 80,
    z: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 1.5 - 0.3,
    vy: -(3 + Math.random() * 5),
    trailLen: 4 + Math.random() * 6,
    phase: Math.random() * 12,
    period: 4 + Math.random() * 6,
  })), []);

  // 2 points per star: head + tail → lineSegments
  const positions = useMemo(() => new Float32Array(14 * 2 * 3), []);

  useFrame(({ clock }) => {
    if (!ref.current || opacity <= 0) return;
    const t = clock.elapsedTime;
    starData.forEach((s, i) => {
      const progress = ((t + s.phase) % s.period) / s.period;
      const hx = s.x + s.vx * progress * 60;
      const hy = s.y + s.vy * progress * 60;
      const tx = hx - s.vx * s.trailLen;
      const ty = hy - s.vy * s.trailLen;
      const base = i * 6;
      positions[base]     = hx;
      positions[base + 1] = hy;
      positions[base + 2] = s.z;
      positions[base + 3] = tx;
      positions[base + 4] = ty;
      positions[base + 5] = s.z;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (opacity <= 0) return null;

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={14 * 2} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={opacity * 0.85} />
    </lineSegments>
  );
}

// ─── Background Planets ───────────────────────────────────────────────────────
function BackgroundPlanets({ scrollProgress }) {
  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  useFrame(() => {
    if (ref1.current) ref1.current.rotation.y += 0.0002;
    if (ref2.current) ref2.current.rotation.y += 0.0001;
    if (ref3.current) ref3.current.rotation.y += 0.00015;
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
      <mesh ref={ref3} position={[35, -5, -90]}>
        <sphereGeometry args={[11, 24, 24]} />
        <meshStandardMaterial emissive="#FF6600" emissiveIntensity={opacity * 0.3} color="#331100" transparent opacity={opacity * 0.7} />
      </mesh>
    </>
  );
}

// ─── Portal ───────────────────────────────────────────────────────────────────
function Portal({ scrollProgress }) {
  const group = useRef();
  const opacity = Math.min(scrollProgress / 15, 1) * Math.max(1 - (scrollProgress - 40) / 15, 0);
  // Grows slightly as player scrolls toward it
  const growScale = 1 + Math.min(scrollProgress / 50, 1) * 0.4;

  useFrame(() => {
    if (!group.current) return;
    group.current.children.forEach((ring, i) => {
      ring.rotation.z += 0.008 * (i % 2 === 0 ? 1 : -1);
      const pulse = 1 + Math.sin(Date.now() * 0.001 + i * 1.2) * 0.08;
      ring.scale.set(pulse * growScale, pulse * growScale, 1);
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
      {/* Lens flare effect — central glow */}
      <mesh>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={opacity * 0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Energy Waves ─────────────────────────────────────────────────────────────
function EnergyWaves({ scrollProgress }) {
  const ref = useRef();
  const waveData = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ phase: i / 6 })), []);
  const opacity = Math.min(scrollProgress / 20, 1) * Math.max(1 - (scrollProgress - 45) / 15, 0);
  const positions = useMemo(() => new Float32Array(6 * 2 * 3), []);

  useFrame(({ clock }) => {
    if (!ref.current || opacity <= 0) return;
    const t = clock.elapsedTime;
    waveData.forEach((w, i) => {
      const progress = ((t * 0.5 + w.phase) % 1);
      const r = progress * 8;
      const base = i * 6;
      // Two points at opposite sides of expanding ring (approximate with moving outward dots)
      positions[base]     = r;
      positions[base + 1] = 3;
      positions[base + 2] = 8;
      positions[base + 3] = -r;
      positions[base + 4] = 3;
      positions[base + 5] = 8;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.material.opacity = opacity * 0.5;
  });

  if (opacity <= 0) return null;

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={6 * 2} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#00FFFF" transparent opacity={0} />
    </lineSegments>
  );
}

// ─── Crystal Field ────────────────────────────────────────────────────────────
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

// ─── Atmosphere Haze ──────────────────────────────────────────────────────────
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

// ─── Atmospheric Particles ────────────────────────────────────────────────────
function AtmosphericParticles({ scrollProgress }) {
  const ref = useRef();
  const N = 300;
  const data = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const velocities = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 0.08,
      y: (Math.random() - 0.5) * 0.04 - 0.03,
      z: (Math.random() - 0.5) * 0.08,
    }));
    const origins = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10 + 8,
    }));
    for (let i = 0; i < N; i++) {
      positions[i * 3]     = origins[i].x;
      positions[i * 3 + 1] = origins[i].y;
      positions[i * 3 + 2] = origins[i].z;
    }
    return { positions, velocities, origins };
  }, []);

  const intensity = Math.max(0, Math.min((scrollProgress - 55) / 20, 1)) *
                    Math.max(0, 1 - (scrollProgress - 85) / 10);

  useFrame(() => {
    if (!ref.current || intensity <= 0) return;
    const pos = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < N; i++) {
      pos[i * 3]     += data.velocities[i].x;
      pos[i * 3 + 1] += data.velocities[i].y;
      pos[i * 3 + 2] += data.velocities[i].z;
      // Reset particle if too far from origin
      const dx = pos[i * 3] - data.origins[i].x;
      const dy = pos[i * 3 + 1] - data.origins[i].y;
      if (Math.abs(dx) > 12 || Math.abs(dy) > 8) {
        pos[i * 3]     = data.origins[i].x;
        pos[i * 3 + 1] = data.origins[i].y;
        pos[i * 3 + 2] = data.origins[i].z;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.material.opacity = intensity * 0.6;
  });

  if (intensity <= 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.positions} count={N} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#FF8844" transparent opacity={0} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Earth Planet ─────────────────────────────────────────────────────────────
function EarthPlanet({ scrollProgress }) {
  const coreRef = useRef();
  const atmRef = useRef();
  const cloudRef = useRef();

  const t = Math.max(0, (scrollProgress - 35) / 65);
  const scale = 1 + t * 14;

  useFrame(({ clock }) => {
    if (coreRef.current) coreRef.current.rotation.y += 0.0003;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.0006;
    if (atmRef.current) atmRef.current.material.opacity = Math.min(t * 0.55, 0.45);
    if (cloudRef.current) cloudRef.current.material.opacity = Math.min(t * 0.4, 0.3);
  });

  return (
    <group position={[0, -10, -35]}>
      {/* Core */}
      <mesh ref={coreRef} scale={scale}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial color="#081828" emissive="#1a3a6a" emissiveIntensity={0.15 + t * 0.4} />
      </mesh>
      {/* Continent grid overlay */}
      <mesh scale={scale * 1.005}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial
          emissive="#00ffff" emissiveIntensity={0.25}
          transparent opacity={t * 0.35} wireframe
        />
      </mesh>
      {/* Cloud layer */}
      <mesh ref={cloudRef} scale={scale * 1.025}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color="#aaddff" transparent opacity={0}
          depthWrite={false}
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

// ─── Crash Shockwave (5 rings) ────────────────────────────────────────────────
function CrashShockwave({ scrollProgress }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef()];
  const crashT = Math.max(0, (scrollProgress - 85) / 15);

  const ringConfig = [
    { emissive: '#ff6600', intensity: 3, tubeR: 0.10, delay: 0.00 },
    { emissive: '#ffcc00', intensity: 3, tubeR: 0.07, delay: 0.10 },
    { emissive: '#ffffff', intensity: 4, tubeR: 0.05, delay: 0.22 },
    { emissive: '#ff3300', intensity: 2, tubeR: 0.08, delay: 0.35 },
    { emissive: '#ff9900', intensity: 2, tubeR: 0.04, delay: 0.48 },
  ];

  useFrame(() => {
    ringConfig.forEach((cfg, i) => {
      if (!refs[i].current) return;
      const t = Math.max(0, crashT - cfg.delay);
      const maxT = 1 - cfg.delay;
      const s = t * (10 - i * 1.5);
      refs[i].current.scale.set(s, s, s);
      refs[i].current.material.opacity = maxT > 0
        ? Math.max(0, (1 - t / maxT) * (0.95 - i * 0.1))
        : 0;
    });
  });

  return (
    <group position={[0, 0, 2]}>
      {ringConfig.map((cfg, i) => (
        <mesh key={i} ref={refs[i]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1, cfg.tubeR, 8, 64]} />
          <meshStandardMaterial
            emissive={cfg.emissive}
            emissiveIntensity={cfg.intensity}
            transparent opacity={0} depthWrite={false}
          />
        </mesh>
      ))}
      {crashT > 0 && crashT < 0.4 && (
        <pointLight intensity={8 * (1 - crashT / 0.4)} color="#ff5500" distance={30} />
      )}
    </group>
  );
}

// ─── Explosion Particles (500, 3 colors) ──────────────────────────────────────
function ExplosionParticles({ scrollProgress }) {
  const N = 500;
  const colorGroups = [
    { color: '#ff8800', count: 200 }, // orange
    { color: '#ff2200', count: 180 }, // red
    { color: '#ffee44', count: 120 }, // yellow-white
  ];

  const refs = [useRef(), useRef(), useRef()];

  const datasets = useMemo(() => {
    let offset = 0;
    return colorGroups.map(({ count }) => {
      const positions = new Float32Array(count * 3);
      const velocities = [];
      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 2 + Math.random() * 10;
        velocities.push(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.cos(phi)) * speed * 0.8 + 1,
          Math.sin(phi) * Math.sin(theta) * speed,
        );
      }
      const age = new Float32Array(count).fill(-1);
      offset += count;
      return { positions, velocities, age };
    });
  }, []);

  const spawnedRef = useRef(false);

  useFrame(() => {
    const crashT = Math.max(0, (scrollProgress - 85) / 15);

    if (crashT > 0.05 && !spawnedRef.current) {
      spawnedRef.current = true;
      datasets.forEach(d => {
        d.age.fill(0);
        for (let i = 0; i < d.age.length; i++) {
          d.positions[i * 3]     = 0;
          d.positions[i * 3 + 1] = 0;
          d.positions[i * 3 + 2] = 2;
        }
      });
    }

    if (!spawnedRef.current) return;

    const dt = 0.016;
    datasets.forEach((d, gi) => {
      if (!refs[gi].current) return;
      const pos = refs[gi].current.geometry.attributes.position.array;
      for (let i = 0; i < d.age.length; i++) {
        if (d.age[i] < 0) continue;
        d.age[i] += dt;
        const t = d.age[i];
        if (t > 3.0) { d.age[i] = -1; continue; }
        pos[i * 3]     = d.positions[i * 3]     + d.velocities[i * 3]     * t;
        pos[i * 3 + 1] = d.positions[i * 3 + 1] + d.velocities[i * 3 + 1] * t - 4.5 * t * t;
        pos[i * 3 + 2] = d.positions[i * 3 + 2] + d.velocities[i * 3 + 2] * t;
      }
      refs[gi].current.geometry.attributes.position.needsUpdate = true;
      const alive = Array.from(d.age).filter(a => a >= 0).length;
      refs[gi].current.material.opacity = alive > 0 ? Math.min(alive / d.age.length, 1) * 0.9 : 0;
    });
  });

  return (
    <>
      {colorGroups.map(({ color, count }, gi) => (
        <points key={gi} ref={refs[gi]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={datasets[gi].positions}
              count={count}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={gi === 2 ? 0.18 : 0.22}
            sizeAttenuation
            color={color}
            transparent opacity={0} depthWrite={false}
          />
        </points>
      ))}
    </>
  );
}

// ─── Crater Mesh ──────────────────────────────────────────────────────────────
function CraterMesh({ scrollProgress }) {
  const ref = useRef();
  const t = Math.max(0, (scrollProgress - 88) / 12);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.material.opacity = Math.min(t * 2, 0.85);
    const s = Math.min(t * 3, 1);
    ref.current.scale.set(s, 1, s);
  });

  if (t <= 0) return null;

  return (
    <group position={[0, 0.01, 2]}>
      {/* Outer crater ring */}
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.35, 8, 48]} />
        <meshStandardMaterial emissive="#ff4400" emissiveIntensity={1.5} transparent opacity={0} depthWrite={false} />
      </mesh>
      {/* Inner scorch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[Math.min(t * 3, 1), Math.min(t * 3, 1), 1]}>
        <circleGeometry args={[2.2, 32]} />
        <meshBasicMaterial color="#220800" transparent opacity={Math.min(t * 2, 0.7)} depthWrite={false} />
      </mesh>
    </group>
  );
}
