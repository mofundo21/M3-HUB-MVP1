import React, { useRef, useEffect, useState } from 'react';

export default function PointerHands() {
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPointerPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      setIsActive(true);
    };

    const handleMouseUp = () => {
      setIsActive(false);
    };

    // Hide default cursor
    document.body.style.cursor = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      // Restore default cursor
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    >
      {/* Left arrow hand */}
      <div
        style={{
          position: 'fixed',
          left: pointerPos.x - 12,
          top: pointerPos.y - 12,
          width: 24,
          height: 24,
          opacity: isActive ? 0.8 : 0.6,
          transition: 'opacity 0.1s ease',
          pointerEvents: 'none',
          zIndex: 9998,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: isActive ? '#ff00ff' : '#00ffff' }}
        >
          <path d="M3 3l10 10M3 3l7 1M3 3l1 7" />
        </svg>
      </div>

      {/* Glow effect when active */}
      {isActive && (
        <div
          style={{
            position: 'fixed',
            left: pointerPos.x - 20,
            top: pointerPos.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
            pointerEvents: 'none',
            zIndex: 9997,
          }}
        />
      )}
    </div>
  );
}
