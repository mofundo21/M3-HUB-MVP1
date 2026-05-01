import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import LoginFormPanel from './LoginFormPanel';
import '../styles/cinematic-login.css';

// ─── Scene Labels ─────────────────────────────────────────────────────────────
const SCENES = [
  { title: 'THE ARRIVAL',   text: 'A digital realm where art, music, and consciousness converge.' },
  { title: 'THE PORTAL',    text: 'GEN · KAL · PSY — three entities shaping the M3 universe.' },
  { title: 'LATENT SPACE',  text: 'A dimension of pure creative potential. All possibilities exist here.' },
  { title: 'DESCENT',       text: 'A ritual disguised as media. A living, breathing universe.' },
  { title: 'WELCOME HOME',  text: 'Enter the M3 Hub. Create, explore, recode.' },
];

// ─── Camera Path ──────────────────────────────────────────────────────────────
const CAM_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,  5,  28),
  new THREE.Vector3(0,  4,  18),
  new THREE.Vector3(0,  2,  10),
  new THREE.Vector3(0,  0,   2),
  new THREE.Vector3(0, -1,  -6),
]);

// ─── CameraRig ────────────────────────────────────────────────────────────────
function CameraRig({ progressRef, shakeRef }) {
  const { camera } = useThree();

  useFrame(() => {
    const p = progressRef.current / 100;
    const target = CAM_PATH.getPoint(Math.min(p, 1));
    camera.position.lerp(target, 0.06);
    camera.lookAt(0, -1, -20);

    // Shake
    if (shakeRef.current > 0) {
      const s = shakeRef.current * 0.18;
      camera.position.x += (Math.random() - 0.5) * s;
      camera.position.y += (Math.random() - 0.5) * s;
      shakeRef.current = Math.max(0, shakeRef.current - 0.02);
    }
  });

  return null;
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(1200 * 3);
    for (let i = 0; i < 1200; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 400;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 400;
      arr[i * 3 + 2] = -Math.random() * 200 - 5;
    }
    return arr;
  }, []);

  useFrame(() => { if (ref.current) ref.current.rotation.z += 0.00004; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={1200} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.25} sizeAttenuation color="#ffffff" />
    </points>
  );
}

// ─── Nebula bg blobs ──────────────────────────────────────────────────────────
function Nebula() {
  const r1 = useRef(); const r2 = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (r1.current) r1.current.rotation.z = t * 0.03;
    if (r2.current) r2.current.rotation.z = -t * 0.02;
  });
  return (
    <>
      <mesh ref={r1} position={[30, 15, -80]}>
        <sphereGeometry args={[18, 16, 16]} />
        <meshBasicMaterial color="#220044" transparent opacity={0.18} />
      </mesh>
      <mesh ref={r2} position={[-25, -10, -70]}>
        <sphereGeometry args={[14, 16, 16]} />
        <meshBasicMaterial color="#001133" transparent opacity={0.22} />
      </mesh>
    </>
  );
}

// ─── Floating Crystals (scenes 1-2) ───────────────────────────────────────────
function Crystals({ progressRef }) {
  const group = useRef();
  const data = useMemo(() => Array.from({ length: 30 }, () => ({
    pos: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, -5 - Math.random() * 20],
    rot: [Math.random(), Math.random(), Math.random()],
    s:   0.3 + Math.random() * 0.9,
  })), []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = progressRef.current;
    const opacity = Math.max(0, Math.min(p / 18, 1) * Math.max(1 - (p - 38) / 10, 0));
    group.current.children.forEach((m, i) => {
      m.rotation.x = data[i].rot[0] + clock.elapsedTime * 0.2;
      m.rotation.y = data[i].rot[1] + clock.elapsedTime * 0.15;
      m.material.opacity = opacity * 0.8;
      m.material.emissiveIntensity = opacity * 0.7;
    });
  });

  return (
    <group ref={group}>
      {data.map((d, i) => (
        <mesh key={i} position={d.pos} scale={d.s}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Portal rings (scene 0-1) ─────────────────────────────────────────────────
function Portal({ progressRef }) {
  const group = useRef();
  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = progressRef.current;
    const opacity = Math.max(0, Math.min(p / 12, 1) * Math.max(1 - (p - 28) / 12, 0));
    group.current.children.forEach((m, i) => {
      m.rotation.z += 0.007 * (i % 2 === 0 ? 1 : -1);
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.2 + i) * 0.07;
      m.scale.set(pulse, pulse, pulse);
      m.material.opacity = opacity;
    });
  });

  return (
    <group ref={group} position={[0, 1, 10]}>
      {[1, 1.5, 2.1].map((s, i) => (
        <mesh key={i} scale={s}>
          <torusGeometry args={[2.8, 0.14, 16, 64]} />
          <meshStandardMaterial
            emissive={i % 2 === 0 ? '#00ffff' : '#ff00ff'}
            emissiveIntensity={1.2} transparent opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Destination Planet ────────────────────────────────────────────────────────
function Planet({ progressRef }) {
  const core = useRef(); const atm = useRef(); const grid = useRef();

  useFrame(() => {
    const p = progressRef.current;
    const t = Math.max(0, (p - 20) / 80);
    const scale = 1 + t * 18;

    if (core.current) {
      core.current.rotation.y += 0.0003;
      core.current.scale.setScalar(scale);
      core.current.material.emissiveIntensity = 0.1 + t * 0.5;
    }
    if (grid.current) {
      grid.current.scale.setScalar(scale * 1.008);
      grid.current.material.opacity = t * 0.3;
    }
    if (atm.current) {
      atm.current.scale.setScalar(scale * 1.08);
      atm.current.material.opacity = Math.min(t * 0.5, 0.5);
    }
  });

  return (
    <group position={[0, -12, -40]}>
      <mesh ref={core}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial color="#060d1a" emissive="#1a3f7a" emissiveIntensity={0.1} />
      </mesh>
      <mesh ref={grid}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.3} transparent opacity={0} wireframe />
      </mesh>
      <mesh ref={atm}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial emissive="#0055ff" emissiveIntensity={1.2} transparent opacity={0} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Ship ─────────────────────────────────────────────────────────────────────
const SHIP_PATH = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 0,  6, 25),
  new THREE.Vector3( 1,  5, 15),
  new THREE.Vector3(-1,  3,  7),
  new THREE.Vector3( 0,  1,  0),
  new THREE.Vector3( 0, -1, -8),
]);

function Ship({ progressRef }) {
  const group = useRef();
  const trailRef = useRef();
  const trailData = useRef({ positions: new Float32Array(300 * 3), colors: new Float32Array(300 * 3), particles: [] });

  useFrame(() => {
    const p = progressRef.current / 100;
    const pos = SHIP_PATH.getPoint(Math.min(p, 1));
    const heat = Math.min(Math.max((progressRef.current - 55) / 40, 0), 1);

    if (group.current) {
      group.current.position.lerp(pos, 0.08);
      group.current.rotation.z = (p * 0.4) % (Math.PI * 2);
      group.current.rotation.x = p * 0.3;
      const s = 0.4 + p * 0.8;
      group.current.scale.setScalar(s);
    }

    // Trail
    if (trailRef.current) {
      const td = trailData.current;
      if (td.particles.length < 250) {
        td.particles.push({
          x: pos.x + (Math.random() - 0.5) * 0.3,
          y: pos.y - 0.4,
          z: pos.z + (Math.random() - 0.5) * 0.3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.2,
          vz: (Math.random() - 0.5) * 0.3,
          life: 1 + Math.random() * 0.5,
          maxLife: 1 + Math.random() * 0.5,
        });
      }
      td.particles = td.particles.filter(pt => pt.life > 0);
      td.particles.forEach((pt, i) => {
        pt.x += pt.vx; pt.y += pt.vy; pt.z += pt.vz;
        pt.life -= 0.016;
        const idx = i * 3;
        td.positions[idx] = pt.x; td.positions[idx+1] = pt.y; td.positions[idx+2] = pt.z;
        // cyan → orange → white with heat
        td.colors[idx]   = heat;
        td.colors[idx+1] = heat < 0.5 ? 1 - heat * 0.5 : (1 - heat) * 0.5;
        td.colors[idx+2] = 1 - heat;
      });
      trailRef.current.geometry.attributes.position.needsUpdate = true;
      trailRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Trail */}
      <points ref={trailRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={trailData.current.positions} count={300} itemSize={3} />
          <bufferAttribute attach="attributes-color"    array={trailData.current.colors}    count={300} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.18} sizeAttenuation vertexColors transparent opacity={0.7} depthWrite={false} />
      </points>

      {/* Body */}
      <group ref={group} position={[0, 6, 25]}>
        <mesh>
          <coneGeometry args={[0.28, 1.2, 8]} />
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.22, 0.3, 0.35, 6]} />
          <meshStandardMaterial emissive="#ff00ff" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.35, -0.15, -0.1]} scale={[0.12, 0.08, 0.28]}>
          <boxGeometry />
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[-0.35, -0.15, -0.1]} scale={[0.12, 0.08, 0.28]}>
          <boxGeometry />
          <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.6} />
        </mesh>
        <pointLight position={[0, -0.7, 0]} intensity={1.5} color="#ffaa00" distance={4} />
      </group>
    </group>
  );
}

// ─── Atmosphere haze ──────────────────────────────────────────────────────────
function Atmosphere({ progressRef }) {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const t = Math.max(0, Math.min((progressRef.current - 58) / 30, 1));
    ref.current.material.opacity = t * 0.38;
  });
  return (
    <mesh ref={ref} position={[0, -8, 10]} scale={[60, 30, 20]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#ff7700" transparent opacity={0} side={THREE.BackSide} />
    </mesh>
  );
}

// ─── Crash Shockwave ──────────────────────────────────────────────────────────
function Shockwave({ progressRef }) {
  const refs = [useRef(), useRef(), useRef()];

  useFrame(() => {
    const p = progressRef.current;
    const crashT = Math.max(0, (p - 87) / 13);
    if (crashT <= 0) { refs.forEach(r => { if (r.current) r.current.visible = false; }); return; }

    const delays = [0, 0.12, 0.26];
    refs.forEach((r, i) => {
      if (!r.current) return;
      const t = Math.max(0, crashT - delays[i]);
      const s = t * 10;
      r.current.visible = t > 0;
      r.current.scale.set(s, s, s);
      r.current.material.opacity = Math.max(0, (1 - t) * 0.95);
    });
  });

  const colors = ['#ff6600', '#ffcc00', '#ffffff'];
  return (
    <group position={[0, 0, -2]}>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} rotation={[Math.PI / 2, 0, 0]} visible={false}>
          <torusGeometry args={[1, 0.08 - i * 0.02, 8, 64]} />
          <meshStandardMaterial emissive={colors[i]} emissiveIntensity={3} transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Explosion Particles ───────────────────────────────────────────────────────
function Explosion({ progressRef }) {
  const ref = useRef();
  const spawned = useRef(false);
  const data = useMemo(() => {
    const N = 250;
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const spd = 4 + Math.random() * 10;
      vel.push(Math.sin(phi) * Math.cos(theta) * spd, Math.abs(Math.cos(phi)) * spd + 1, Math.sin(phi) * Math.sin(theta) * spd);
    }
    return { pos, vel, age: new Float32Array(N).fill(-1) };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const p = progressRef.current;
    const crashT = Math.max(0, (p - 87) / 13);

    if (crashT > 0.08 && !spawned.current) {
      spawned.current = true;
      data.age.fill(0);
      for (let i = 0; i < 250; i++) { data.pos[i*3]=0; data.pos[i*3+1]=0; data.pos[i*3+2]=-2; }
    }
    if (!spawned.current) return;

    const posArr = ref.current.geometry.attributes.position.array;
    let alive = 0;
    for (let i = 0; i < 250; i++) {
      if (data.age[i] < 0) continue;
      data.age[i] += 0.016;
      const t = data.age[i];
      if (t > 2.8) { data.age[i] = -1; continue; }
      alive++;
      posArr[i*3]   = data.pos[i*3]   + data.vel[i*3]   * t;
      posArr[i*3+1] = data.pos[i*3+1] + data.vel[i*3+1] * t - 5 * t * t;
      posArr[i*3+2] = data.pos[i*3+2] + data.vel[i*3+2] * t;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.material.opacity = alive > 0 ? 0.9 : 0;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={data.pos} count={250} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.28} sizeAttenuation color="#ff8800" transparent opacity={0} depthWrite={false} />
    </points>
  );
}

// ─── Scene Lighting ───────────────────────────────────────────────────────────
function Lights({ progressRef }) {
  const keyRef = useRef();
  useFrame(() => {
    if (!keyRef.current) return;
    const p = progressRef.current;
    const target = p > 60 ? new THREE.Color('#ff8800') : new THREE.Color('#00ccff');
    keyRef.current.color.lerp(target, 0.02);
    keyRef.current.intensity = 0.8 + (p / 100) * 0.8;
  });
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight ref={keyRef} position={[10, 10, 5]} intensity={0.8} color="#00ccff" />
      <pointLight position={[-8, 5, -5]} intensity={0.5} color="#ff00ff" />
    </>
  );
}

// ─── HUD Overlay (DOM) ────────────────────────────────────────────────────────
function SceneHUD({ progress, currentScene, showForm }) {
  const scene = SCENES[Math.min(currentScene, 4)];
  const local = progress % 20;
  const fadeIn  = Math.min(local / 5, 1);
  const fadeOut = local > 13 ? Math.max(1 - (local - 13) / 7, 0) : 1;
  const textOp  = showForm ? 0 : fadeIn * fadeOut;
  const showHint = currentScene === 0 && progress < 7;

  return (
    <div className="cl-hud">
      {/* Lore text */}
      <div className="cl-lore" style={{ opacity: textOp }}>
        <div className="cl-lore-title">{scene?.title}</div>
        <div className="cl-lore-text">{scene?.text}</div>
      </div>

      {/* Scroll hint */}
      {showHint && (
        <div className="cl-scroll-hint">
          <span>↓</span>
          <span>SCROLL TO ENTER</span>
          <span>↓</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="cl-progress-track">
        <div className="cl-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

// ─── Flash overlay ────────────────────────────────────────────────────────────
function CrashFlash({ crashed }) {
  if (!crashed) return null;
  return <div className="cl-crash-flash" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CinematicLoginScene({ onAuth }) {
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const progressRef = useRef(0);
  const shakeRef = useRef(0);
  const crashFiredRef = useRef(false);

  const handleWheel = useCallback((e) => {
    progressRef.current = Math.min(Math.max(progressRef.current + e.deltaY * 0.06, 0), 100);
    setProgress(Math.round(progressRef.current * 10) / 10);

    if (progressRef.current >= 87 && !crashFiredRef.current) {
      crashFiredRef.current = true;
      setCrashed(true);
      shakeRef.current = 1;
      setTimeout(() => setCrashed(false), 700);
    }
    if (progressRef.current >= 93) setShowForm(true);
  }, []);

  // Touch support
  const touchRef = useRef(null);
  const handleTouchStart = useCallback((e) => { touchRef.current = e.touches[0].clientY; }, []);
  const handleTouchMove  = useCallback((e) => {
    if (touchRef.current === null) return;
    const dy = touchRef.current - e.touches[0].clientY;
    touchRef.current = e.touches[0].clientY;
    progressRef.current = Math.min(Math.max(progressRef.current + dy * 0.15, 0), 100);
    setProgress(Math.round(progressRef.current * 10) / 10);
    if (progressRef.current >= 87 && !crashFiredRef.current) {
      crashFiredRef.current = true;
      setCrashed(true);
      shakeRef.current = 1;
      setTimeout(() => setCrashed(false), 700);
    }
    if (progressRef.current >= 93) setShowForm(true);
  }, []);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove',  handleTouchMove,  { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove',  handleTouchMove);
    };
  }, [handleWheel, handleTouchStart, handleTouchMove]);

  const currentScene = Math.min(Math.floor(progress / 20), 4);

  return (
    <div className="cl-root">
      {/* 3D Canvas */}
      <Canvas
        className="cl-canvas"
        camera={{ position: [0, 5, 28], fov: 72 }}
        dpr={Math.min(window.devicePixelRatio, 2)}
        gl={{ antialias: true }}
      >
        <CameraRig progressRef={progressRef} shakeRef={shakeRef} />
        <Lights progressRef={progressRef} />
        <Stars />
        <Nebula />
        <Portal progressRef={progressRef} />
        <Crystals progressRef={progressRef} />
        <Planet progressRef={progressRef} />
        <Atmosphere progressRef={progressRef} />
        <Ship progressRef={progressRef} />
        <Shockwave progressRef={progressRef} />
        <Explosion progressRef={progressRef} />
      </Canvas>

      {/* DOM overlays */}
      <SceneHUD progress={progress} currentScene={currentScene} showForm={showForm} />
      <CrashFlash crashed={crashed} />

      {/* Login panel */}
      {showForm && <LoginFormPanel onAuth={onAuth} />}
    </div>
  );
}
