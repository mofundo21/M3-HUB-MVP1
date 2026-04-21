import React, { useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GalleryRoom({ position = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/gallery_room.glb');
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Clone the scene to avoid reusing the same instance
  const clonedScene = React.useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone();
    clone.traverse((node) => {
      if (node.geometry) node.geometry = node.geometry.clone();
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material = node.material.map((m) => m.clone());
        } else {
          node.material = node.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (groupRef.current && hovered) {
      const t = clock.getElapsedTime();
      // Subtle lighting pulse on hover
      const lights = [];
      groupRef.current.traverse((node) => {
        if (node.isLight) lights.push(node);
      });
      lights.forEach((light) => {
        light.intensity = 1 + Math.sin(t * 2) * 0.3;
      });
    }
  });

  if (!clonedScene) return null;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/gallery_room.glb');
