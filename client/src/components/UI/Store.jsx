import React, { useState } from 'react';
import { STORE_ITEMS } from '../../data/content';

const CATEGORY_LABELS = { A: 'WEARABLE', B: 'TECH', C: 'COLLECTIBLE', D: 'DIGITAL' };
const CATEGORY_COLORS = { A: '#ff00ff', B: '#00ffff', C: '#A78BFA', D: '#22C55E' };

export default function Store({ onClose }) {
  const [filter, setFilter] = useState('ALL');
  const categories = ['ALL', 'A', 'B', 'C', 'D'];

  const filtered = filter === 'ALL'
    ? STORE_ITEMS
    : STORE_ITEMS.filter(i => i.category === filter);

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0,
      width: 340,
      background: 'linear-gradient(180deg, #0a0f0a 0%, #0d0d14 100%)',
      borderLeft: '2px solid #00ff00',
      boxShadow: '-10px 0 50px rgba(0,255,0,0.12)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
      animation: 'slideInRight 0.25s ease',
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .store-item:hover { border-color: #00ff00 !important; background: #111a11 !important; }
        .filter-btn:hover { border-color: #00ff00 !important; color: #00ff00 !important; }
        .store-item { transition: border-color 0.2s, background 0.2s; }
        .filter-btn { transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid #00ff0033',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: '#00ff00', fontWeight: 700, fontSize: 17, letterSpacing: 3 }}>
            M3 STORE
          </div>
          <div style={{ color: '#444', fontSize: 10, marginTop: 2, letterSpacing: 1 }}>
            OFFICIAL MERCH DROP · PKG TRACKED
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #222',
            color: '#444', cursor: 'pointer', padding: '5px 8px',
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close store"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex', gap: 6, padding: '10px 18px',
        borderBottom: '1px solid #00ff0011', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {categories.map(c => (
          <button
            key={c}
            className="filter-btn"
            onClick={() => setFilter(c)}
            style={{
              padding: '3px 10px', borderRadius: 4, fontSize: 9, fontWeight: 600,
              letterSpacing: 1, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
              background: filter === c ? '#00ff0022' : 'transparent',
              border: `1px solid ${filter === c ? '#00ff00' : '#333'}`,
              color: filter === c ? '#00ff00' : '#555',
            }}
          >
            {c === 'ALL' ? 'ALL' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((item) => (
          <div key={item.id} className="store-item" style={{
            background: '#0d120d',
            border: '1px solid #00ff0022',
            borderRadius: 8,
            padding: '12px 14px',
            cursor: 'pointer',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#e8ffe8', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                <div style={{ color: '#444', fontSize: 10, marginTop: 3 }}>{item.description}</div>
              </div>
              <div style={{ color: '#00ff00', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                {item.price}
              </div>
            </div>

            {/* Bottom row — tags */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Category badge */}
              <span style={{
                background: CATEGORY_COLORS[item.category] + '18',
                border: `1px solid ${CATEGORY_COLORS[item.category]}55`,
                color: CATEGORY_COLORS[item.category],
                fontSize: 8, padding: '2px 6px', borderRadius: 3, letterSpacing: 1, fontWeight: 600,
              }}>
                CAT {item.category} · {CATEGORY_LABELS[item.category]}
              </span>

              {/* Drop tag */}
              {item.tag && (
                <span style={{
                  background: item.tagColor + '22',
                  border: `1px solid ${item.tagColor}55`,
                  color: item.tagColor,
                  fontSize: 8, padding: '2px 6px', borderRadius: 3, letterSpacing: 1, fontWeight: 600,
                }}>
                  {item.tag}
                </span>
              )}

              {/* PKG */}
              <span style={{ color: '#333', fontSize: 8, marginLeft: 'auto', letterSpacing: 1 }}>
                PKG-{item.pkg}
              </span>
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', color: '#222', fontSize: 10, padding: '16px 0', borderTop: '1px solid #111', marginTop: 4, letterSpacing: 1 }}>
          MORE DROPS LOADING SOON
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid #00ff0022',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#222', fontSize: 9, letterSpacing: 1 }}>M3 UNIVERSE · ALL PKG TRACKED</span>
        <span style={{ color: '#00ff0044', fontSize: 9 }}>{STORE_ITEMS.length} ITEMS</span>
      </div>
    </div>
  );
}
