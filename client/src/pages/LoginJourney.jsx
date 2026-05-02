import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import JourneyScene from '../components/scenes/JourneyScene';
import LoginFormOverlay from '../components/LoginFormOverlay';
import '../styles/journey.css';

const LORE_SCENES = [
  { title: 'THE ARRIVAL', text: 'Welcome to the M3 Universe. A digital realm where art, music, and consciousness converge.' },
  { title: 'THE PORTAL', text: 'Three entities guide the experience: GEN (isolation & memory), KAL (chaos & exploration), PSY (synthesis & glitch).' },
  { title: 'LATENT SPACE', text: 'Navigate through the latent space—a dimension of pure creative potential where all possibilities exist.' },
  { title: 'DESCENT', text: 'M3 is more than an app. It\'s a ritual disguised as media—a living, breathing universe.' },
  { title: 'WELCOME HOME', text: 'Enter the M3 Hub. Discover your place in this universe. Create, explore, recode.' }
];

export default function LoginJourney({ onAuth }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
      setCurrentScene(Math.floor(progress / 20));
      if (progress >= 80) setFormVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="journey-container">
      <div className="scroll-spacer" style={{ height: '4000px' }} />
      <div className="fixed-canvas">
        <Canvas camera={{ position: [0, 5, 15], fov: 75 }} dpr={Math.min(window.devicePixelRatio, 2)}>
          <JourneyScene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      <SceneHUD currentScene={currentScene} scrollProgress={scrollProgress} />
      {!formVisible && isMobile && (
        <button
          onClick={() => setFormVisible(true)}
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            zIndex: 200, padding: '12px 28px', background: 'rgba(0,255,255,0.15)',
            border: '1px solid #00ffff', color: '#00ffff', borderRadius: '6px',
            fontFamily: 'monospace', fontSize: '13px', fontWeight: 'bold',
            letterSpacing: '1px', cursor: 'pointer', backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(0,255,255,0.3)',
          }}
        >
          SKIP TO LOGIN ▶
        </button>
      )}
      {formVisible && <LoginFormOverlay onAuth={onAuth} />}
    </div>
  );
}

function SceneHUD({ currentScene, scrollProgress }) {
  const scene = LORE_SCENES[Math.min(currentScene, 4)];
  const sceneProgress = (scrollProgress % 20) / 20;

  return (
    <div className="scene-hud">
      <div className="scene-text-container">
        <div className="scene-title" style={{ opacity: Math.min(sceneProgress * 2, 1) }}>
          {scene?.title}
        </div>
        <div className="scene-text" style={{ opacity: Math.min((sceneProgress - 0.1) * 1.5, 1) }}>
          {scene?.text}
        </div>
      </div>
      <div className="scroll-indicator">
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
    </div>
  );
}
