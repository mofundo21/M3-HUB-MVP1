import React, { useState, useEffect } from 'react';

const PLACEHOLDER_ITEMS = [
  { id: 1, name: 'M3 Drop Tee', price: '$35', tag: 'LIMITED' },
  { id: 2, name: 'MOFUNDO Hoodie', price: '$65', tag: 'NEW' },
  { id: 3, name: 'M3 Cap', price: '$28', tag: '' },
  { id: 4, name: 'Hub Access Pass', price: '$10', tag: 'DIGITAL' },
];

export default function Store({ onClose }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 600);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const width = isMobile ? '100%' : 320;
  const top = isMobile ? 'auto' : 0;
  const bottom = isMobile ? 0 : 0;
  const height = isMobile ? '70vh' : 'auto';
  const borderLeft = isMobile ? 'none' : '2px solid #00ff00';
  const borderTop = isMobile ? '2px solid #00ff00' : 'none';

  return (
    <div style={{
      position: 'fixed', right: 0, top,
      width,
      height,
      bottom,
      background: '#0d0d14',
      borderLeft,
      borderTop,
      boxShadow: isMobile ? '0 -10px 40px rgba(0,255,0,0.15)' : '-10px 0 40px rgba(0,255,0,0.15)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      animation: isMobile ? 'slideInUp 0.3s ease-out' : 'slideInRight 0.3s ease-out',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
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
        borderBottom: '1px solid #00ff0033',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: 18, letterSpacing: 3 }}>
            M3 STORE
          </div>
          <div style={{ color: '#555', fontSize: 11, marginTop: 2 }}>Official Merch Drop</div>
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

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PLACEHOLDER_ITEMS.map((item) => (
          <div key={item.id} style={{
            background: '#111',
            border: '1px solid #00ff0033',
            borderRadius: 6,
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = '#00ff00'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = '#00ff0033'}
          >
            <div>
              <div style={{ color: '#fff', fontSize: 13 }}>{item.name}</div>
              {item.tag && (
                <div style={{
                  display: 'inline-block', marginTop: 4,
                  background: '#00ff0022', border: '1px solid #00ff0066',
                  color: '#00ff00', fontSize: 9, padding: '1px 6px', borderRadius: 2,
                  letterSpacing: 1,
                }}>
                  {item.tag}
                </div>
              )}
            </div>
            <div style={{ color: '#00ff00', fontWeight: 'bold', fontSize: 15 }}>{item.price}</div>
          </div>
        ))}

        {/* Coming soon */}
        <div style={{
          textAlign: 'center', color: '#333', fontSize: 11, padding: '20px 0',
          borderTop: '1px solid #111', marginTop: 8,
        }}>
          More drops coming soon...
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #00ff0033',
        textAlign: 'center',
        color: '#333', fontSize: 11,
      }}>
        Full store launching soon · Powered by M3
      </div>
    </div>
  );
}
