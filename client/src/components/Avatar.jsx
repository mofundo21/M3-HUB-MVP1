import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function Avatar({ position, rotY = 0, username, pkg, isLocal }) {
  const groupRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(rotY);

  // Smooth interpolation for remote players
  useFrame(() => {
    if (!groupRef.current) return;
    targetPos.current.set(...position);
    targetRot.current = rotY;

    if (isLocal) {
      // Local player follows exact position set by controller
      groupRef.current.position.set(...position);
      groupRef.current.rotation.y = rotY;
    } else {
      // Remote players lerp smoothly
      groupRef.current.position.lerp(targetPos.current, 0.2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRot.current,
        0.2
      );
    }
  });

  const bodyColor = isLocal ? '#00ffff' : '#0088aa';
  const headColor = isLocal ? '#ff00ff' : '#aa0088';
  const labelColor = isLocal ? '#ffffff' : '#aaaaaa';

  return (
    <group ref={groupRef} position={position}>
      {/* Body - capsule */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={isLocal ? 0.4 : 0.2}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Head - sphere */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial
          color={headColor}
          emissive={headColor}
          emissiveIntensity={isLocal ? 0.6 : 0.3}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Glow ring for local player */}
      {isLocal && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.4} side={2} />
        </mesh>
      )}

      {/* Username label */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.25}
        color={labelColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        renderOrder={1}
        depthOffset={-1}
      >
        {username}
      </Text>

      {/* PKG label */}
      <Text
        position={[0, 2.0, 0]}
        fontSize={0.16}
        color={isLocal ? '#ff00ff' : '#880044'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
        renderOrder={1}
        depthOffset={-1}
      >
        {pkg}
      </Text>
    </group>
  );
}
