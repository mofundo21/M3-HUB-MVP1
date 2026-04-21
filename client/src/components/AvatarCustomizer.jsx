import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

const AVATAR_MODELS = [
  { id: 'geometric_1', name: 'CUBE', icon: '⬜' },
  { id: 'geometric_2', name: 'SPHERE', icon: '⭕' },
  { id: 'geometric_3', name: 'PYRAMID', icon: '🔺' },
  { id: 'geometric_4', name: 'CRYSTAL', icon: '💎' },
  { id: 'geometric_5', name: 'HELIX', icon: '🌀' },
];

export default function AvatarCustomizer({ user, onComplete }) {
  const [selected, setSelected] = useState(AVATAR_MODELS[0].id);
  const [colors, setColors] = useState({
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    accentColor: '#ffff00',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save avatar choice to localStorage for now
      const avatarData = {
        model: selected,
        primaryColor: colors.primaryColor,
        secondaryColor: colors.secondaryColor,
        accentColor: colors.accentColor,
      };
      localStorage.setItem('m3_avatar', JSON.stringify(avatarData));

      // Try to save to server (optional - doesn't block if fails)
      try {
        const token = localStorage.getItem('m3_token');
        await axios.post(`${API}/api/users/avatar`, avatarData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.log('Server save skipped, using localStorage');
      }

      onComplete();
    } catch (e) {
      console.error('Error:', e);
      // Still complete even if error
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const current = AVATAR_MODELS.find(m => m.id === selected);

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />

      <div style={styles.modal}>
        <div style={styles.title}>CUSTOMIZE YOUR AVATAR</div>
        <div style={styles.subtitle}>Choose your look for M3</div>

        {/* Model selection */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>SELECT MODEL</div>
          <div style={styles.modelGrid}>
            {AVATAR_MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => setSelected(model.id)}
                style={{
                  ...styles.modelCard,
                  ...(selected === model.id ? styles.modelCardActive : {}),
                }}
              >
                <div style={styles.modelIcon}>{model.icon}</div>
                <div style={styles.modelName}>{model.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color customization */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>CUSTOMIZE COLORS</div>

          <div style={styles.colorGroup}>
            <label style={styles.colorLabel}>PRIMARY</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={colors.primaryColor}
                onChange={(e) => setColors({...colors, primaryColor: e.target.value})}
                style={styles.colorInput}
              />
              <span style={styles.colorValue}>{colors.primaryColor}</span>
            </div>
          </div>

          <div style={styles.colorGroup}>
            <label style={styles.colorLabel}>SECONDARY</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={colors.secondaryColor}
                onChange={(e) => setColors({...colors, secondaryColor: e.target.value})}
                style={styles.colorInput}
              />
              <span style={styles.colorValue}>{colors.secondaryColor}</span>
            </div>
          </div>

          <div style={styles.colorGroup}>
            <label style={styles.colorLabel}>ACCENT</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={colors.accentColor}
                onChange={(e) => setColors({...colors, accentColor: e.target.value})}
                style={styles.colorInput}
              />
              <span style={styles.colorValue}>{colors.accentColor}</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={styles.preview}>
          <div style={styles.previewTitle}>PREVIEW</div>
          <div style={styles.previewBox}>
            <div style={{fontSize: '48px'}}>{current?.icon}</div>
            <div style={styles.previewName}>{current?.name}</div>
            <div style={styles.previewColors}>
              <div style={{...styles.colorDot, background: colors.primaryColor}} />
              <div style={{...styles.colorDot, background: colors.secondaryColor}} />
              <div style={{...styles.colorDot, background: colors.accentColor}} />
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...styles.button,
            opacity: saving ? 0.6 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '⏳ SAVING...' : '▶ ENTER M3 HUB'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'rgba(10, 10, 15, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  modal: {
    position: 'relative',
    background: 'rgba(10, 0, 21, 0.95)',
    border: '2px solid #00ffff',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 0 50px rgba(0,255,255,0.3)',
    animation: 'fadeIn 0.5s ease-out',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#00ffff',
    textShadow: '0 0 20px rgba(0,255,255,0.5)',
    textAlign: 'center',
    marginBottom: '8px',
    fontFamily: 'monospace',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(0,255,255,0.6)',
    textAlign: 'center',
    marginBottom: '30px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '11px',
    color: '#00ffff',
    fontWeight: 'bold',
    letterSpacing: '2px',
    marginBottom: '15px',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
  },
  modelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  modelCard: {
    padding: '15px',
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  modelCardActive: {
    background: 'linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.2))',
    border: '2px solid #00ffff',
    boxShadow: '0 0 20px rgba(0,255,255,0.4)',
  },
  modelIcon: {
    fontSize: '28px',
  },
  modelName: {
    fontSize: '10px',
    color: '#00ffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  colorGroup: {
    marginBottom: '15px',
  },
  colorLabel: {
    display: 'block',
    fontSize: '10px',
    color: '#00ffff',
    marginBottom: '8px',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  colorInputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  colorInput: {
    width: '50px',
    height: '40px',
    border: '1px solid #00ffff',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  colorValue: {
    fontSize: '12px',
    color: '#00ffff',
    fontFamily: 'monospace',
    flex: 1,
  },
  preview: {
    marginTop: '30px',
    marginBottom: '20px',
    padding: '20px',
    background: 'rgba(0,255,255,0.05)',
    border: '1px solid rgba(0,255,255,0.3)',
    borderRadius: '8px',
  },
  previewTitle: {
    fontSize: '10px',
    color: '#00ffff',
    fontWeight: 'bold',
    marginBottom: '15px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  previewBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  previewName: {
    fontSize: '14px',
    color: '#00ffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  previewColors: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  colorDot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #00ffff, #00ff88)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    boxShadow: '0 0 20px rgba(0,255,255,0.4)',
    transition: 'all 0.3s ease',
  },
};
