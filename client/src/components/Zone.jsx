import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export default function Zone({ name, position, color, label, onEnter }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Pulsing outer ring
    if (outerRef.current) {
      const scale = 1 + Math.sin(t * 2) * 0.05;
      outerRef.current.scale.set(scale, 1, scale);
      outerRef.current.rotation.y = t * 0.3;
    }

    // Inner cylinder spin
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.5;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onEnter(name);
  };

  const opacity = hovered ? 0.6 : 0.3;
  const emissiveIntensity = hovered ? 1 : 0.5;

  return (
    <group position={position}>
      {/* Ground circle marker */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[2.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>

      {/* Outer pulsing ring */}
      <mesh
        ref={outerRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <ringGeometry args={[2.2, 2.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} side={2} />
      </mesh>

      {/* Inner wireframe cylinder */}
      <mesh ref={innerRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 3, 12, 1, true]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>

      {/* Solid clickable cylinder (invisible, for hit area) */}
      <mesh
        position={[0, 1.5, 0]}
        onClick={handleClick}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <cylinderGeometry args={[1.2, 1.2, 3, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>

      {/* Emissive top cap */}
      <mesh position={[0, 3.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {label}
      </Text>

      {/* Hover prompt */}
      {hovered && (
        <Text
          position={[0, 3.35, 0]}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          [CLICK TO ENTER]
        </Text>
      )}

      {/* Point light inside zone (enhanced glow) */}
      <pointLight position={[0, 2, 0]} color={color} intensity={hovered ? 2 : 0.8} distance={12} decay={2} />
    </group>
  );
}
