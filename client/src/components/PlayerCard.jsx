import React from 'react';

const MODEL_NAMES = {
  geometric_1: 'CUBE',
  geometric_2: 'SPHERE',
  geometric_3: 'PYRAMID',
  geometric_4: 'CRYSTAL',
  geometric_5: 'HELIX',
};

function ColorSwatch({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      <div style={{
        width: 14, height: 14, borderRadius: 3,
        background: color,
        boxShadow: `0 0 6px ${color}`,
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 9, color: 'rgba(0,255,255,0.5)', letterSpacing: 2 }}>
        {label}
      </span>
      <span style={{ fontSize: 9, color: '#00ffff', fontFamily: 'monospace', marginLeft: 'auto' }}>
        {color}
      </span>
    </div>
  );
}

export default function PlayerCard({ player, onClose }) {
  if (!player) return null;

  let avatarData = null;
  if (player.avatar) {
    try { avatarData = JSON.parse(player.avatar); } catch {}
  }

  const modelName = MODEL_NAMES[avatarData?.model] || 'CUBE';

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(320px, 90vw)',
      background: 'rgba(5, 5, 20, 0.96)',
      border: '1.5px solid #00ffff',
      borderRadius: 10,
      padding: '24px 22px',
      zIndex: 200,
      fontFamily: "'Courier New', monospace",
      boxShadow: '0 0 40px rgba(0,255,255,0.25), 0 0 80px rgba(0,255,255,0.1)',
    }}>
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 12, right: 14,
          background: 'none', border: 'none',
          color: 'rgba(0,255,255,0.5)', fontSize: 18, cursor: 'pointer',
          lineHeight: 1, padding: 4,
        }}
      >×</button>

      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
        background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
        boxShadow: '0 0 14px #00ffff', borderRadius: 2,
      }} />

      {/* Avatar preview swatch */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: avatarData?.primaryColor || '#0088aa',
        boxShadow: `0 0 20px ${avatarData?.primaryColor || '#0088aa'}`,
        margin: '0 auto 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px solid ${avatarData?.secondaryColor || '#aa0088'}`,
        fontSize: 20,
      }}>
        {player.username?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Username */}
      <div style={{
        textAlign: 'center', marginBottom: 4,
        fontSize: 'clamp(14px, 3vw, 18px)',
        fontWeight: 'bold', color: '#ffffff',
        letterSpacing: 3, textTransform: 'uppercase',
      }}>
        {player.username}
      </div>

      {/* PKG */}
      {player.pkg && (
        <div style={{
          textAlign: 'center', marginBottom: 16,
          fontSize: 10, letterSpacing: 3,
          color: avatarData?.secondaryColor || '#aa0088',
          textTransform: 'uppercase',
        }}>
          [{player.pkg}]
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(0,255,255,0.15)', marginBottom: 14 }} />

      {/* Avatar info */}
      <div style={{ marginBottom: 8, fontSize: 9, letterSpacing: 3, color: 'rgba(0,255,255,0.5)' }}>
        AVATAR — {modelName}
      </div>

      {avatarData ? (
        <>
          <ColorSwatch color={avatarData.primaryColor}   label="PRIMARY" />
          <ColorSwatch color={avatarData.secondaryColor} label="SECONDARY" />
          <ColorSwatch color={avatarData.accentColor}    label="ACCENT" />
        </>
      ) : (
        <div style={{ fontSize: 10, color: 'rgba(0,255,255,0.35)', fontStyle: 'italic' }}>
          No avatar data
        </div>
      )}

      {/* Zone */}
      {player.zone && (
        <>
          <div style={{ height: 1, background: 'rgba(0,255,255,0.15)', margin: '14px 0 10px' }} />
          <div style={{ fontSize: 9, color: 'rgba(0,255,255,0.5)', letterSpacing: 3, marginBottom: 4 }}>
            CURRENT ZONE
          </div>
          <div style={{ fontSize: 12, color: '#00ffff', letterSpacing: 2, textTransform: 'uppercase' }}>
            ● {player.zone}
          </div>
        </>
      )}
    </div>
  );
}
