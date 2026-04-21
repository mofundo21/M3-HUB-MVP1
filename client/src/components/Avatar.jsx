import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function Avatar({ position, rotY = 0, username, pkg, isLocal }) {
  const groupRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(rotY);
  const [avatar, setAvatar] = useState({
    model: 'geometric_1',
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    accentColor: '#ffff00',
  });

  useEffect(() => {
    if (isLocal) {
      const saved = localStorage.getItem('m3_avatar');
      if (saved) setAvatar(JSON.parse(saved));
    }
  }, [isLocal]);

  useFrame(() => {
    if (!groupRef.current) return;
    targetPos.current.set(...position);
    targetRot.current = rotY;

    if (isLocal) {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.y = rotY;
    } else {
      groupRef.current.position.lerp(targetPos.current, 0.2);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRot.current,
        0.2
      );
    }
  });

  const primaryColor = isLocal ? avatar.primaryColor : '#0088aa';
  const secondaryColor = isLocal ? avatar.secondaryColor : '#aa0088';
  const accentColor = isLocal ? avatar.accentColor : '#888800';
  const labelColor = isLocal ? '#ffffff' : '#aaaaaa';

  const renderAvatarModel = () => {
    switch (avatar.model) {
      case 'geometric_1': // CUBE
        return (
          <>
            <mesh position={[0, 0.8, 0]} castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 1.65, 0]} castShadow>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.5} />
            </mesh>
          </>
        );
      case 'geometric_2': // SPHERE
        return (
          <>
            <mesh position={[0, 0.75, 0]} castShadow>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.5} />
            </mesh>
          </>
        );
      case 'geometric_3': // PYRAMID
        return (
          <>
            <mesh position={[0, 0.7, 0]} castShadow>
              <tetrahedronGeometry args={[0.6]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 1.6, 0]} castShadow>
              <coneGeometry args={[0.35, 0.6, 8]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.5} />
            </mesh>
          </>
        );
      case 'geometric_4': // CRYSTAL
        return (
          <>
            <mesh position={[0, 0.8, 0]} castShadow>
              <octahedronGeometry args={[0.5]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0, 1.65, 0]} castShadow>
              <dodecahedronGeometry args={[0.25]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
            </mesh>
          </>
        );
      case 'geometric_5': // HELIX
        return (
          <>
            <mesh position={[0, 0.9, 0]} castShadow>
              <torusGeometry args={[0.4, 0.15, 8, 16]} />
              <meshStandardMaterial color={primaryColor} emissive={primaryColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, 0.9, 0]} rotation={[Math.PI / 3, 0, 0]} castShadow>
              <torusGeometry args={[0.3, 0.1, 8, 16]} />
              <meshStandardMaterial color={secondaryColor} emissive={secondaryColor} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 1.7, 0]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
            </mesh>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <group ref={groupRef} position={position}>
      {renderAvatarModel()}

      {/* Glow ring for local player */}
      {isLocal && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.65, 16]} />
          <meshBasicMaterial color={avatar.primaryColor} transparent opacity={0.3} side={2} />
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
        color={isLocal ? avatar.secondaryColor : '#880044'}
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
