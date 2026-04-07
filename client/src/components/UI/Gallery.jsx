import React, { useState } from 'react';
import { GALLERY_ITEMS, TAG_COLORS } from '../../data/content';

export default function Gallery({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [imgErrors, setImgErrors] = useState({});

  const tags = ['ALL', ...Array.from(new Set(GALLERY_ITEMS.map(p => p.tag)))];
  const filtered = filter === 'ALL' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(p => p.tag === filter);

  const selectedItem = GALLERY_ITEMS.find(p => p.id === selected);

  const handleImgError = (id) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0,
      width: 360,
      background: 'linear-gradient(180deg, #0f0f0a 0%, #0d0d14 100%)',
      borderRight: '2px solid #ffff00',
      boxShadow: '10px 0 50px rgba(255,255,0,0.10)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Poppins', sans-serif",
      animation: 'slideInLeft 0.25s ease',
    }}>
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .gal-thumb:hover { border-color: #ffff00 !important; transform: scale(1.02); }
        .gal-thumb { transition: border-color 0.2s, transform 0.15s; }
        .gal-filter:hover { border-color: #ffff00 !important; color: #ffff00 !important; }
        .gal-filter { transition: all 0.2s; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '18px 18px 14px',
        borderBottom: '1px solid #ffff0033',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: '#ffff00', fontWeight: 700, fontSize: 17, letterSpacing: 3 }}>
            M3 GALLERY
          </div>
          <div style={{ color: '#444', fontSize: 10, marginTop: 2, letterSpacing: 1 }}>
            M3 UNIVERSE ARCHIVE · {GALLERY_ITEMS.length} PIECES
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #222',
            color: '#444', cursor: 'pointer', padding: '5px 8px',
            borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          aria-label="Close gallery"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Tag Filter */}
      <div style={{
        display: 'flex', gap: 5, padding: '10px 18px',
        borderBottom: '1px solid #ffff0011', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {tags.map(t => {
          const color = t === 'ALL' ? '#ffff00' : (TAG_COLORS[t] || '#ffff00');
          return (
            <button
              key={t}
              className="gal-filter"
              onClick={() => { setFilter(t); setSelected(null); }}
              style={{
                padding: '3px 9px', borderRadius: 4, fontSize: 9, fontWeight: 600,
                letterSpacing: 1, cursor: 'pointer', fontFamily: "'Poppins', sans-serif",
                background: filter === t ? color + '22' : 'transparent',
                border: `1px solid ${filter === t ? color : '#333'}`,
                color: filter === t ? color : '#555',
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Lightbox — expanded view */}
      {selectedItem && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', padding: 24,
          }}
        >
          {imgErrors[selectedItem.id] ? (
            <div style={{
              width: '100%', aspectRatio: '1', background: '#111',
              border: '1px solid #ffff0033', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ffff0044" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          ) : (
            <img
              src={selectedItem.src}
              alt={selectedItem.title}
              style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 8, objectFit: 'contain' }}
              onError={() => handleImgError(selectedItem.id)}
            />
          )}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{selectedItem.title}</div>
            <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>{selectedItem.date}</div>
            {selectedItem.tag && (
              <span style={{
                display: 'inline-block', marginTop: 8,
                background: (TAG_COLORS[selectedItem.tag] || '#ffff00') + '22',
                border: `1px solid ${TAG_COLORS[selectedItem.tag] || '#ffff00'}55`,
                color: TAG_COLORS[selectedItem.tag] || '#ffff00',
                fontSize: 9, padding: '2px 8px', borderRadius: 3, letterSpacing: 1,
              }}>
                {selectedItem.tag}
              </span>
            )}
          </div>
          <div style={{ color: '#333', fontSize: 10, marginTop: 16 }}>TAP TO CLOSE</div>
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {filtered.map((photo) => {
            const tagColor = TAG_COLORS[photo.tag] || '#ffff00';
            const hasError = imgErrors[photo.id];
            return (
              <div
                key={photo.id}
                className="gal-thumb"
                onClick={() => setSelected(selected === photo.id ? null : photo.id)}
                style={{
                  border: `1px solid ${selected === photo.id ? '#ffff00' : '#ffff0022'}`,
                  borderRadius: 6,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#0a0a0a',
                  position: 'relative',
                }}
              >
                {/* Image or fallback */}
                {hasError ? (
                  <div style={{
                    width: '100%', aspectRatio: '1', background: '#111',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffff0033" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={photo.src}
                    alt={photo.title}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                    onError={() => handleImgError(photo.id)}
                    loading="lazy"
                  />
                )}

                {/* Overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                  padding: '18px 8px 6px',
                }}>
                  <div style={{ color: '#fff', fontSize: 10, fontWeight: 600, lineHeight: 1.3 }}>{photo.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
                    <span style={{ color: '#555', fontSize: 8 }}>{photo.date}</span>
                    <span style={{
                      background: tagColor + '33', border: `1px solid ${tagColor}55`,
                      color: tagColor, fontSize: 7, padding: '1px 5px', borderRadius: 2, letterSpacing: 0.5,
                    }}>{photo.tag}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', color: '#222', fontSize: 10, padding: '16px 0', borderTop: '1px solid #111', marginTop: 8, letterSpacing: 1 }}>
          UPLOAD COMING SOON · ALL RIGHTS RESERVED
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid #ffff0022',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#222', fontSize: 9, letterSpacing: 1 }}>M3 UNIVERSE PHOTO ARCHIVE</span>
        <span style={{ color: '#ffff0044', fontSize: 9 }}>{filtered.length} / {GALLERY_ITEMS.length}</span>
      </div>
    </div>
  );
}
