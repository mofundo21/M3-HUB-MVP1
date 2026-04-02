import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// ─── Portal (stargate) ────────────────────────────────────────────────────────
function PortalZone({ position, onEnter }) {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const core = useRef();
  const outerGlow = useRef();
  const particleRefs = useRef([]);
  const [hovered, setHovered] = useState(false);

  const PARTICLE_COUNT = 10;
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => i);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speed = hovered ? 1.6 : 1;

    if (ring1.current) ring1.current.rotation.z = t * 0.8 * speed;
    if (ring2.current) ring2.current.rotation.x = t * -0.6 * speed;
    if (ring3.current) {
      ring3.current.rotation.y = t * 1.1 * speed;
      ring3.current.rotation.z = t * 0.3 * speed;
    }

    if (core.current) {
      const pulse = 1 + Math.sin(t * 3) * 0.08;
      core.current.scale.setScalar(pulse);
      core.current.material.emissiveIntensity = hovered
        ? 1.2 + Math.sin(t * 4) * 0.4
        : 0.7 + Math.sin(t * 2) * 0.2;
    }

    if (outerGlow.current) {
      outerGlow.current.rotation.y = t * 0.2;
      const s = 1 + Math.sin(t * 1.5) * 0.04;
      outerGlow.current.scale.setScalar(s);
    }

    // Orbit particles
    particleRefs.current.forEach((p, i) => {
      if (!p) return;
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + t * (0.5 + i * 0.05) * speed;
      const radius = 1.8 + Math.sin(t * 2 + i) * 0.2;
      const yOff = Math.sin(t * 1.2 + i * 0.7) * 0.5;
      p.position.set(Math.cos(angle) * radius, 1.5 + yOff, Math.sin(angle) * radius);
    });
  });

  const handleClick = (e) => { e.stopPropagation(); onEnter('portal'); };
  const pointerOver = () => { setHovered(true); document.body.style.cursor = 'pointer'; };
  const pointerOut = () => { setHovered(false); document.body.style.cursor = 'default'; };

  return (
    <group position={position}>
      {/* Ground glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={hovered ? 0.12 : 0.06} />
      </mesh>

      {/* Outer ground ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[2.6, 3.0, 64]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={hovered ? 0.5 : 0.25} side={2} />
      </mesh>

      {/* Stargate rings */}
      <mesh ref={ring1} position={[0, 1.5, 0]}>
        <torusGeometry args={[1.6, 0.07, 12, 64]} />
        <meshStandardMaterial
          color="#ff00ff" emissive="#ff00ff"
          emissiveIntensity={hovered ? 2 : 1}
          metalness={0.8} roughness={0.1}
        />
      </mesh>

      <mesh ref={ring2} position={[0, 1.5, 0]}>
        <torusGeometry args={[1.6, 0.05, 12, 64]} />
        <meshStandardMaterial
          color="#00ffff" emissive="#00ffff"
          emissiveIntensity={hovered ? 2 : 1}
          metalness={0.8} roughness={0.1}
        />
      </mesh>

      <mesh ref={ring3} position={[0, 1.5, 0]}>
        <torusGeometry args={[1.4, 0.04, 12, 48]} />
        <meshStandardMaterial
          color="#A78BFA" emissive="#A78BFA"
          emissiveIntensity={hovered ? 2.5 : 1.2}
          metalness={0.9} roughness={0.05}
        />
      </mesh>

      {/* Energy core */}
      <mesh
        ref={core}
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#1a0033"
          emissive="#7C3AED"
          emissiveIntensity={0.8}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Outer glow sphere (large, very transparent) */}
      <mesh ref={outerGlow} position={[0, 1.5, 0]}>
        <sphereGeometry args={[1.55, 16, 16]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.04} side={2} />
      </mesh>

      {/* Orbiting particles */}
      {particles.map((i) => (
        <mesh
          key={i}
          ref={(el) => (particleRefs.current[i] = el)}
          position={[0, 1.5, 0]}
        >
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#00ffff' : '#ff00ff'} />
        </mesh>
      ))}

      {/* Click hit area (invisible) */}
      <mesh
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={pointerOver}
        onPointerOut={pointerOut}
      >
        <cylinderGeometry args={[2, 2, 3.5, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Lights */}
      <pointLight position={[0, 1.5, 0]} color="#ff00ff" intensity={hovered ? 4 : 2} distance={10} />
      <pointLight position={[0, 1.5, 0]} color="#00ffff" intensity={hovered ? 2 : 1} distance={8} />

      {/* Label */}
      <Text position={[0, 4, 0]} fontSize={0.55} color="#ff00ff"
        anchorX="center" anchorY="middle"
        outlineWidth={0.04} outlineColor="#000000"
        font="https://fonts.gstatic.com/s/righteous/v17/1cXxaUPXBpj2rGoU7C9WiHGF.woff"
      >
        PORTAL
      </Text>

      {hovered && (
        <Text position={[0, 3.25, 0]} fontSize={0.28} color="#ffffff"
          anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#000"
        >
          [CLICK TO ENTER]
        </Text>
      )}
    </group>
  );
}

// ─── Standard zone (store / gallery) ─────────────────────────────────────────
function StandardZone({ name, position, color, label, onEnter }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.scale.set(1 + Math.sin(t * 2) * 0.05, 1, 1 + Math.sin(t * 2) * 0.05);
      outerRef.current.rotation.y = t * 0.3;
    }
    if (innerRef.current) innerRef.current.rotation.y = -t * 0.5;
  });

  const handleClick = (e) => { e.stopPropagation(); onEnter(name); };
  const pointerOver = () => { setHovered(true); document.body.style.cursor = 'pointer'; };
  const pointerOut = () => { setHovered(false); document.body.style.cursor = 'default'; };

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>

      <mesh ref={outerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}
        onClick={handleClick} onPointerOver={pointerOver} onPointerOut={pointerOut}>
        <ringGeometry args={[2.2, 2.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.6 : 0.3} side={2} />
      </mesh>

      <mesh ref={innerRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 12, 1, true]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>

      <mesh position={[0, 1.5, 0]} onClick={handleClick} onPointerOver={pointerOver} onPointerOut={pointerOut}>
        <cylinderGeometry args={[1.2, 1.2, 3, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>

      <mesh position={[0, 3.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      <Text position={[0, 4, 0]} fontSize={0.5} color={color}
        anchorX="center" anchorY="middle"
        outlineWidth={0.03} outlineColor="#000000"
      >
        {label}
      </Text>

      {hovered && (
        <Text position={[0, 3.35, 0]} fontSize={0.28} color="#ffffff"
          anchorX="center" anchorY="middle"
          outlineWidth={0.02} outlineColor="#000000"
        >
          [CLICK TO ENTER]
        </Text>
      )}

      <pointLight position={[0, 2, 0]} color={color} intensity={hovered ? 1.5 : 0.6} distance={8} />
    </group>
  );
}

// ─── Exported Zone ────────────────────────────────────────────────────────────
export default function Zone({ name, position, color, label, onEnter }) {
  if (name === 'portal') {
    return <PortalZone position={position} onEnter={onEnter} />;
  }
  return <StandardZone name={name} position={position} color={color} label={label} onEnter={onEnter} />;
}
