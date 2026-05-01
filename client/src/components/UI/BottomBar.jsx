import React from 'react';

const S = {
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
    background: 'rgba(0,0,0,0.8)',
    borderTop: '1px solid rgba(0,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 20,
    backdropFilter: 'blur(4px)',
    userSelect: 'none',
    padding: '0 8px',
  },
  btn: (active) => ({
    minWidth: 52,
    minHeight: 44,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: active ? 'rgba(0,255,255,0.18)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#00ffff' : 'rgba(0,255,255,0.25)'}`,
    borderRadius: 8,
    color: active ? '#00ffff' : 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: '0.05em',
    padding: '4px 10px',
    transition: 'all 0.15s',
    flex: 1,
    maxWidth: 72,
  }),
  icon: {
    fontSize: 16,
    lineHeight: 1,
  },
  sep: {
    width: 1,
    height: 28,
    background: 'rgba(0,255,255,0.15)',
    flexShrink: 0,
  },
  logout: {
    minWidth: 52,
    minHeight: 44,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    background: 'rgba(255,0,0,0.1)',
    border: '1px solid rgba(255,68,68,0.35)',
    borderRadius: 8,
    color: 'rgba(255,100,100,0.8)',
    cursor: 'pointer',
    fontFamily: 'monospace',
    fontSize: 9,
    padding: '4px 10px',
    transition: 'all 0.15s',
    flex: 1,
    maxWidth: 72,
  },
};

export default function BottomBar({
  showChat,
  onChatToggle,
  muted,
  onAudioToggle,
  onZoneMenu,
  onLogout,
  connected,
}) {
  return (
    <div style={S.bar}>
      <button style={S.btn(showChat)} onClick={onChatToggle} disabled={!connected}>
        <span style={S.icon}>💬</span>
        CHAT
      </button>

      <button style={S.btn(muted)} onClick={onAudioToggle}>
        <span style={S.icon}>{muted ? '🔇' : '🔊'}</span>
        {muted ? 'MUTED' : 'AUDIO'}
      </button>

      <div style={S.sep} />

      <button style={S.btn(false)} onClick={onZoneMenu}>
        <span style={S.icon}>🗺️</span>
        ZONES
      </button>

      <div style={S.sep} />

      <button style={S.logout} onClick={onLogout}>
        <span style={S.icon}>🚪</span>
        LEAVE
      </button>
    </div>
  );
}
