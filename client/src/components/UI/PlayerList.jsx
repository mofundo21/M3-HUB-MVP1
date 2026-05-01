import React from 'react';

const S = {
  panel: {
    position: 'absolute',
    top: 52,
    right: 8,
    width: 160,
    background: 'rgba(0,0,8,0.82)',
    border: '1px solid rgba(0,255,255,0.25)',
    borderRadius: 8,
    zIndex: 15,
    overflow: 'hidden',
    backdropFilter: 'blur(4px)',
    userSelect: 'none',
  },
  header: {
    padding: '6px 10px',
    color: 'rgba(0,255,255,0.6)',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    borderBottom: '1px solid rgba(0,255,255,0.12)',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    padding: '5px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  dot: (color) => ({
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: color || '#00ffff',
    border: '1px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  }),
  name: (isLocal) => ({
    color: isLocal ? '#00ffff' : '#cceeff',
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: isLocal ? 'bold' : 'normal',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  you: {
    color: 'rgba(0,255,255,0.45)',
    fontFamily: 'monospace',
    fontSize: 8,
    marginLeft: 2,
  },
};

function getAvatarColor(avatarJson) {
  if (!avatarJson) return '#00ffff';
  try {
    const parsed = typeof avatarJson === 'string' ? JSON.parse(avatarJson) : avatarJson;
    return parsed.color || '#00ffff';
  } catch {
    return '#00ffff';
  }
}

export default function PlayerList({ players, mySessionId }) {
  const entries = Array.from(players.entries()).slice(0, 6);
  if (entries.length === 0) return null;

  return (
    <div style={S.panel}>
      <div style={S.header}>Players ({entries.length})</div>
      {entries.map(([sessionId, player]) => {
        const isLocal = sessionId === mySessionId;
        const color = getAvatarColor(player.avatar);
        return (
          <div key={sessionId} style={S.item}>
            <div style={S.dot(color)} />
            <span style={S.name(isLocal)}>
              {player.username || 'GUEST'}
              {isLocal && <span style={S.you}>  you</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
