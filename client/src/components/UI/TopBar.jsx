import React from 'react';

const S = {
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    background: 'rgba(0,0,0,0.75)',
    borderBottom: '1px solid rgba(0,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    zIndex: 20,
    backdropFilter: 'blur(4px)',
    userSelect: 'none',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '2px solid #00ffff',
    flexShrink: 0,
  },
  username: {
    color: '#00ffff',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 120,
  },
  center: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#ffffff',
    fontFamily: 'monospace',
    fontSize: 11,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  stat: {
    color: 'rgba(0,255,255,0.6)',
    fontFamily: 'monospace',
    fontSize: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#00ff00',
    display: 'inline-block',
  },
};

export default function TopBar({ username, zone = 'HUB', playerCount = 0, avatarColor = '#00ffff', onProfile }) {
  return (
    <div style={S.bar}>
      <div style={S.left}>
        <div
          style={{ ...S.avatar, background: avatarColor, cursor: onProfile ? 'pointer' : 'default' }}
          onClick={onProfile}
          title="View profile"
        />
        <span style={S.username}>{username || 'GUEST'}</span>
      </div>

      <div style={S.center}>
        ⬡ {zone}
      </div>

      <div style={S.right}>
        <span style={S.stat}>
          <span style={S.dot} />
          {playerCount} online
        </span>
      </div>
    </div>
  );
}
