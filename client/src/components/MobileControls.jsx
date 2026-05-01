import React, { useRef, useEffect, useCallback } from 'react';

const RING_RADIUS = 50; // outer ring radius in px (100px diameter / 2)
const DEADZONE = 15;

function fireKey(type, code, key) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key, bubbles: true }));
}

export default function MobileControls() {
  const thumbRef = useRef(null);
  const originRef = useRef(null);
  const activeKeysRef = useRef(new Set());

  const releaseAll = useCallback(() => {
    activeKeysRef.current.forEach(({ code, key }) => fireKey('keyup', code, key));
    activeKeysRef.current.clear();
    if (thumbRef.current) {
      thumbRef.current.style.transform = 'translate(-50%, -50%)';
    }
  }, []);

  const setKey = useCallback((code, key, active) => {
    const existing = [...activeKeysRef.current].find(k => k.code === code);
    if (active && !existing) {
      fireKey('keydown', code, key);
      activeKeysRef.current.add({ code, key });
    } else if (!active && existing) {
      fireKey('keyup', code, key);
      activeKeysRef.current.delete(existing);
    }
  }, []);

  useEffect(() => {
    const ring = document.getElementById('m3-joystick-ring');
    if (!ring) return;

    const onTouchStart = (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const rect = ring.getBoundingClientRect();
      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (!originRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - originRef.current.x;
      const dy = touch.clientY - originRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.min(dist, RING_RADIUS);
      const angle = Math.atan2(dy, dx);
      const clampedX = Math.cos(angle) * clampedDist;
      const clampedY = Math.sin(angle) * clampedDist;

      if (thumbRef.current) {
        thumbRef.current.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
      }

      if (dist < DEADZONE) {
        setKey('KeyW', 'w', false);
        setKey('KeyS', 's', false);
        setKey('KeyA', 'a', false);
        setKey('KeyD', 'd', false);
        return;
      }

      setKey('KeyW', 'w', dy < -DEADZONE);
      setKey('KeyS', 's', dy > DEADZONE);
      setKey('KeyA', 'a', dx < -DEADZONE);
      setKey('KeyD', 'd', dx > DEADZONE);
    };

    const onTouchEnd = (e) => {
      e.preventDefault();
      originRef.current = null;
      releaseAll();
    };

    ring.addEventListener('touchstart', onTouchStart, { passive: false });
    ring.addEventListener('touchmove', onTouchMove, { passive: false });
    ring.addEventListener('touchend', onTouchEnd, { passive: false });
    ring.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      ring.removeEventListener('touchstart', onTouchStart);
      ring.removeEventListener('touchmove', onTouchMove);
      ring.removeEventListener('touchend', onTouchEnd);
      ring.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [setKey, releaseAll]);

  return (
    <div
      id="m3-joystick-ring"
      style={{
        position: 'fixed',
        bottom: 80,
        left: 30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.5)',
        border: '1.5px solid #00FFFF',
        zIndex: 9999,
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Thumb */}
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(0,255,255,0.25)',
          border: '1.5px solid #CC00FF',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
