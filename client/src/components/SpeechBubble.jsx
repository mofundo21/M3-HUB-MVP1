import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

export default function SpeechBubble({
  position = [0, 2.5, 0],
  text = '',
  duration = 4000,
  fadeOutDuration = 800,
  onComplete = () => {},
}) {
  const groupRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [opacity, setOpacity] = useState(0);

  const totalTime = duration + fadeOutDuration;
  const fadeInTime = 300;

  useFrame(() => {
    if (!groupRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const progress = elapsed / totalTime;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Fade in (first 300ms)
    if (elapsed < fadeInTime) {
      setOpacity(elapsed / fadeInTime);
    }
    // Hold (300ms to duration)
    else if (elapsed < duration) {
      setOpacity(1);
    }
    // Fade out (duration to duration + fadeOutDuration)
    else {
      const fadeOutElapsed = elapsed - duration;
      setOpacity(1 - fadeOutElapsed / fadeOutDuration);
    }

    // Float upward during fade out
    if (elapsed >= duration) {
      const floatAmount = ((elapsed - duration) / fadeOutDuration) * 2;
      groupRef.current.position.y = position[1] + floatAmount;
    }
  });

  // Wrap text if too long
  const wrappedText = text.length > 30
    ? text.split(' ').reduce((acc, word) => {
        const lastLine = acc[acc.length - 1];
        if ((lastLine + word).length <= 30) {
          acc[acc.length - 1] = lastLine + (lastLine ? ' ' : '') + word;
        } else {
          acc.push(word);
        }
        return acc;
      }, [''])
    : [text];

  return (
    <group ref={groupRef} position={position}>
      {/* Background bubble (using simple plane) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[text.length * 0.12 + 0.3, wrappedText.length * 0.35 + 0.4]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={opacity * 0.6}
          depthWrite={false}
        />
      </mesh>

      {/* Text with opacity */}
      <group opacity={opacity}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          textAlign="center"
          renderOrder={1}
          depthOffset={-1}
        >
          {text}
        </Text>
      </group>
    </group>
  );
}
