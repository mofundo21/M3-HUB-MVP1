import React, { useEffect, useRef } from 'react';

const ZONES = [
  { id: 'hub',     icon: '🏠', label: 'Hub',          desc: 'Main world' },
  { id: 'gallery', icon: '🎨', label: 'Gallery',       desc: 'Browse art' },
  { id: 'store',   icon: '🛒', label: 'Store',         desc: 'Buy items' },
  { id: 'music',   icon: '🎵', label: 'Music Lounge',  desc: 'Listen' },
  { id: 'lore',    icon: '📖', label: 'Lore Room',     desc: 'Read story' },
  { id: 'friends', icon: '👥', label: 'Friends',       desc: 'Friend list' },
  { id: 'inventory', icon: '🎒', label: 'Inventory',   desc: 'Your items' },
];

const S = {
  overlay: (show) => ({
    position: 'absolute',
    inset: 0,
    background: show ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
    zIndex: 30,
    transition: 'background 0.2s',
    pointerEvents: show ? 'all' : 'none',
  }),
  panel: (show) => ({
    position: 'absolute',
    top: 44,
    left: 0,
    bottom: 52,
    width: 220,
    background: 'rgba(0,0,8,0.95)',
    borderRight: '1px solid rgba(0,255,255,0.3)',
    transform: show ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 31,
    overflow: 'hidden',
  }),
  header: {
    padding: '14px 16px 10px',
    color: '#00ffff',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(0,255,255,0.15)',
    flexShrink: 0,
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  item: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    background: active ? 'rgba(0,255,255,0.12)' : 'transparent',
    borderLeft: active ? '3px solid #00ffff' : '3px solid transparent',
    transition: 'all 0.12s',
  }),
  icon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
    flexShrink: 0,
  },
  text: {
    minWidth: 0,
  },
  label: (active) => ({
    color: active ? '#00ffff' : '#cceeff',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: active ? 'bold' : 'normal',
  }),
  desc: {
    color: 'rgba(150,200,220,0.5)',
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 1,
  },
};

export default function ZoneMenu({ show, currentZone = 'hub', onZoneSelect, onClose }) {
  const panelRef = useRef();

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  return (
    <div style={S.overlay(show)} onClick={onClose}>
      <div
        ref={panelRef}
        style={S.panel(show)}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={S.header}>Navigate</div>
        <div style={S.list}>
          {ZONES.map((zone) => {
            const active = currentZone === zone.id;
            return (
              <div
                key={zone.id}
                style={S.item(active)}
                onClick={() => { onZoneSelect(zone.id); onClose(); }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,255,255,0.06)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={S.icon}>{zone.icon}</span>
                <div style={S.text}>
                  <div style={S.label(active)}>{zone.label}</div>
                  <div style={S.desc}>{zone.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
