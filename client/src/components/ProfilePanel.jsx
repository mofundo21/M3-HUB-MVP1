import React, { useState, useEffect } from 'react';

export default function ProfilePanel({ user, onClose }) {
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [stats, setStats] = useState({
    zonesVisited: [],
    consecutiveLoginDays: 1,
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    // Load bio from localStorage
    const saved = localStorage.getItem('m3_bio');
    if (saved) setBio(saved);

    // Load avatar customization
    const avatarData = localStorage.getItem('m3_avatar');
    if (avatarData) setAvatar(JSON.parse(avatarData));

    // Load stats from localStorage (will sync with server later)
    const statsData = localStorage.getItem('m3_stats');
    if (statsData) setStats(JSON.parse(statsData));
  }, []);

  const handleSaveBio = () => {
    localStorage.setItem('m3_bio', bio);
    setEditing(false);
  };

  const createdDate = new Date(stats.createdAt);
  const createdStr = createdDate.toLocaleDateString();

  const MODELS = {
    geometric_1: '⬜ CUBE',
    geometric_2: '⭕ SPHERE',
    geometric_3: '🔺 PYRAMID',
    geometric_4: '💎 CRYSTAL',
    geometric_5: '🌀 HELIX',
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>PROFILE</div>
          <div style={styles.username}>{user.username}</div>
        </div>

        {/* Avatar section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>AVATAR</div>
          <div style={styles.avatarBox}>
            <div style={{fontSize: '64px', marginBottom: '10px'}}>
              {avatar && MODELS[avatar.model] ? MODELS[avatar.model][0] : '⭕'}
            </div>
            <div style={styles.avatarModel}>
              {avatar ? MODELS[avatar.model] : 'DEFAULT'}
            </div>
            <div style={styles.colorRow}>
              {avatar && (
                <>
                  <div style={{...styles.colorDot, background: avatar.primaryColor}} title="Primary" />
                  <div style={{...styles.colorDot, background: avatar.secondaryColor}} title="Secondary" />
                  <div style={{...styles.colorDot, background: avatar.accentColor}} title="Accent" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>STATS</div>
          <div style={styles.statRow}>
            <span>📅 MEMBER SINCE</span>
            <span style={styles.statValue}>{createdStr}</span>
          </div>
          <div style={styles.statRow}>
            <span>🔥 STREAK</span>
            <span style={styles.statValue}>{stats.consecutiveLoginDays} days</span>
          </div>
          <div style={styles.statRow}>
            <span>🗺️ ZONES VISITED</span>
            <span style={styles.statValue}>{stats.zonesVisited.length}</span>
          </div>
        </div>

        {/* Bio section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            BIO
            <button
              onClick={() => setEditing(!editing)}
              style={styles.editBtn}
            >
              {editing ? '✓' : '✎'}
            </button>
          </div>
          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell everyone about yourself..."
              style={styles.bioInput}
              maxLength={200}
            />
          ) : (
            <div style={styles.bioDisplay}>
              {bio || '(No bio set yet)'}
            </div>
          )}
          {editing && (
            <div style={styles.bioFooter}>
              <span>{bio.length}/200</span>
              <button onClick={handleSaveBio} style={styles.saveBioBtn}>
                SAVE BIO
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          Package: <span style={{color: '#00ffff'}}>{user.pkg}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    zIndex: 500,
  },
  panel: {
    width: '350px',
    height: '100vh',
    background: 'rgba(10, 0, 21, 0.95)',
    borderRight: '2px solid #00ffff',
    boxShadow: '0 0 30px rgba(0,255,255,0.2)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255,0,0,0.2)',
    border: '1px solid #ff4444',
    color: '#ff4444',
    width: '30px',
    height: '30px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  header: {
    padding: '30px 20px 20px',
    borderBottom: '1px solid rgba(0,255,255,0.2)',
    textAlign: 'center',
  },
  title: {
    fontSize: '10px',
    color: '#00ffff',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '10px',
    fontFamily: 'monospace',
  },
  username: {
    fontSize: '18px',
    color: '#ff00ff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textShadow: '0 0 10px rgba(255,0,255,0.5)',
  },
  section: {
    padding: '20px',
    borderBottom: '1px solid rgba(0,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: '10px',
    color: '#00ffff',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  editBtn: {
    background: 'rgba(0,255,255,0.2)',
    border: '1px solid #00ffff',
    color: '#00ffff',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  avatarBox: {
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatarModel: {
    fontSize: '12px',
    color: '#00ffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  colorRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  colorDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '12px',
    color: '#00ffff',
    fontFamily: 'monospace',
    borderBottom: '1px solid rgba(0,255,255,0.1)',
  },
  statValue: {
    color: '#ffff00',
    fontWeight: 'bold',
  },
  bioDisplay: {
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.2)',
    borderRadius: '6px',
    padding: '12px',
    color: '#00ffff',
    fontSize: '12px',
    lineHeight: '1.5',
    minHeight: '60px',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bioInput: {
    width: '100%',
    background: 'rgba(0,26,51,0.9)',
    border: '1px solid rgba(0,255,255,0.3)',
    color: '#00ffff',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: 'monospace',
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box',
  },
  bioFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
    fontSize: '11px',
    color: 'rgba(0,255,255,0.6)',
  },
  saveBioBtn: {
    background: 'linear-gradient(135deg, #00ffff, #00ff88)',
    color: '#000',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '10px',
    fontFamily: 'monospace',
  },
  footer: {
    padding: '15px 20px',
    fontSize: '11px',
    color: 'rgba(0,255,255,0.5)',
    borderTop: '1px solid rgba(0,255,255,0.2)',
    fontFamily: 'monospace',
    marginTop: 'auto',
  },
};
