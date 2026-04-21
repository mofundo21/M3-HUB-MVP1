import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function PortalGate({ position = [0, 0, 0] }) {
  const groupRef = useRef();
  const frameRef = useRef();
  const oracleRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Frame rotation
    if (frameRef.current) {
      frameRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
      frameRef.current.rotation.x = Math.cos(t * 0.2) * 0.08;
    }

    // Oracle sphere pulsing and rotating
    if (oracleRef.current) {
      oracleRef.current.rotation.x += 0.01;
      oracleRef.current.rotation.y += 0.02;
      const pulse = 1 + Math.sin(t * 2) * 0.2;
      oracleRef.current.scale.set(pulse, pulse, pulse);
    }

    // Light intensity pulsing
    if (groupRef.current) {
      const lights = groupRef.current.children.filter((c) => c.isLight);
      lights.forEach((light) => {
        light.intensity = hovered ? 3 + Math.sin(t * 3) * 0.5 : 2 + Math.sin(t * 2) * 0.3;
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Outer frame/ring */}
      <group ref={frameRef}>
        <mesh
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'default';
          }}
        >
          <torusGeometry args={[3, 0.4, 12, 64]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={hovered ? 1.5 : 1}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Inner accent ring */}
        <mesh position={[0, 0, 0.3]}>
          <torusGeometry args={[2.8, 0.2, 12, 64]} />
          <meshStandardMaterial
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={hovered ? 1.2 : 0.8}
            metalness={0.8}
            roughness={0.15}
          />
        </mesh>
      </group>

      {/* Portal surface - shimmering plane */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[2.8, 32]} />
        <meshStandardMaterial
          color="#0a00ff"
          emissive="#4400ff"
          emissiveIntensity={hovered ? 0.8 : 0.4}
          metalness={0.6}
          roughness={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Rotating oracle sphere in center */}
      <mesh ref={oracleRef} position={[0, 0, 0.5]}>
        <icosahedronGeometry args={[0.6, 5]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={hovered ? 1 : 0.6}
          metalness={0.7}
          roughness={0.2}
          wireframe={true}
        />
      </mesh>

      {/* Glowing core */}
      <mesh position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={hovered ? 1.5 : 1}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Main light (magenta) */}
      <pointLight color="#ff00ff" intensity={2} distance={12} decay={2} />

      {/* Secondary light (cyan) */}
      <pointLight position={[0, 2, 0]} color="#00ffff" intensity={1.5} distance={10} decay={2} />

      {/* Spotlights on frame */}
      <pointLight position={[3, 0, 0]} color="#ffff00" intensity={0.8} distance={8} decay={2} />
      <pointLight position={[-3, 0, 0]} color="#ffff00" intensity={0.8} distance={8} decay={2} />

      {/* Invisible clickable area */}
      <mesh
        position={[0, 0, 0]}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[3.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Glow halo */}
      <mesh position={[0, 0, -0.5]}>
        <ringGeometry args={[3.2, 4.2, 32]} />
        <meshBasicMaterial
          color="#ff00ff"
          transparent
          opacity={hovered ? 0.3 : 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
