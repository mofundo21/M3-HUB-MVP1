import React, { useState, useEffect } from 'react';

const PLACEHOLDER_PHOTOS = [
  { id: 1, title: 'NYE 2025 Set', date: 'Dec 31, 2024', color: '#ffff0033' },
  { id: 2, title: 'M3 Jungle Mix', date: 'Jan 12, 2025', color: '#ff00ff22' },
  { id: 3, title: 'MOFUNDO Live', date: 'Feb 8, 2025', color: '#00ffff22' },
  { id: 4, title: 'Studio Session', date: 'Mar 1, 2025', color: '#ff440022' },
  { id: 5, title: 'CRIMENYC Drop', date: 'Mar 15, 2025', color: '#44ff0022' },
  { id: 6, title: 'M3 Universe', date: 'Apr 1, 2025', color: '#ffff0022' },
];

export default function Gallery({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const width = isMobile ? '100%' : 340;
  const top = isMobile ? 'auto' : 0;
  const bottom = isMobile ? 0 : 0;
  const height = isMobile ? '70vh' : 'auto';
  const borderRight = isMobile ? 'none' : '2px solid #ffff00';
  const borderTop = isMobile ? '2px solid #ffff00' : 'none';

  return (
    <div style={{
      position: 'fixed', left: 0, top,
      width,
      height,
      bottom,
      background: '#0d0d14',
      borderRight,
      borderTop,
      boxShadow: isMobile ? '0 -10px 40px rgba(255,255,0,0.15)' : '10px 0 40px rgba(255,255,0,0.15)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      animation: isMobile ? 'slideInUp 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid #ffff0033',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#ffff00', fontWeight: 'bold', fontSize: 18, letterSpacing: 3 }}>
            M3 GALLERY
          </div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>Photo Archive</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #333',
            color: '#555', cursor: 'pointer', padding: '4px 10px',
            borderRadius: 4, fontSize: 14, fontFamily: 'inherit',
          }}
        >✕</button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PLACEHOLDER_PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelected(selected === photo.id ? null : photo.id)}
              style={{
                background: photo.color,
                border: `1px solid ${selected === photo.id ? '#ffff00' : '#ffff0033'}`,
                borderRadius: 6,
                padding: '28px 10px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'border-color 0.2s, transform 0.15s',
                transform: selected === photo.id ? 'scale(1.03)' : 'scale(1)',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#ffff0088'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = selected === photo.id ? '#ffff00' : '#ffff0033'}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🖼</div>
              <div style={{ color: '#fff', fontSize: 11, lineHeight: 1.3 }}>{photo.title}</div>
              <div style={{ color: '#555', fontSize: 10, marginTop: 4 }}>{photo.date}</div>
            </div>
          ))}
        </div>

        {/* Coming soon */}
        <div style={{
          textAlign: 'center', color: '#333', fontSize: 11, padding: '20px 0',
          borderTop: '1px solid #111', marginTop: 14,
        }}>
          Upload functionality coming soon...
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #ffff0033',
        textAlign: 'center',
        color: '#333', fontSize: 11,
      }}>
        M3 Universe Photo Archive · All rights reserved
      </div>
    </div>
  );
}
