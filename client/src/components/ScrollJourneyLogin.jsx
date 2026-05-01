import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import JourneyScene from './scenes/JourneyScene';
import LoginFormOverlay from './LoginFormOverlay';
import '../styles/journey.css';

const LORE_SCENES = [
  { title: 'THE ARRIVAL', text: 'Welcome to the M3 Universe. A digital realm where art, music, and consciousness converge.' },
  { title: 'THE PORTAL', text: 'Three entities guide the experience: GEN (isolation & memory), KAL (chaos & exploration), PSY (synthesis & glitch).' },
  { title: 'LATENT SPACE', text: 'Navigate through the latent space—a dimension of pure creative potential where all possibilities exist.' },
  { title: 'DESCENT', text: 'M3 is more than an app. It\'s a ritual disguised as media—a living, breathing universe.' },
  { title: 'WELCOME HOME', text: 'Enter the M3 Hub. Discover your place in this universe. Create, explore, recode.' }
];

export default function ScrollJourneyLogin({ onAuth }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setScrollProgress(progress);
      setCurrentScene(Math.min(Math.floor(progress / 20), 4));
      if (progress >= 78) setFormVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Skip journey — jump straight to login (click anywhere hint)
  const skip = () => {
    setScrollProgress(100);
    setCurrentScene(4);
    setFormVisible(true);
    window.scrollTo(0, document.documentElement.scrollHeight);
  };

  return (
    <div className="journey-container" ref={containerRef}>
      <div className="scroll-spacer" style={{ height: '4000px' }} />
      <div className="fixed-canvas">
        <Canvas camera={{ position: [0, 5, 25], fov: 75 }} dpr={Math.min(window.devicePixelRatio, 2)}>
          <JourneyScene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      <SceneHUD currentScene={currentScene} scrollProgress={scrollProgress} onSkip={skip} />
      {formVisible && (
        <div className="form-overlay" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <LoginFormOverlay onAuth={onAuth} compact />
        </div>
      )}
    </div>
  );
}

function SceneHUD({ currentScene, scrollProgress, onSkip }) {
  const scene = LORE_SCENES[Math.min(currentScene, 4)];
  const sceneProgress = (scrollProgress % 20) / 20;
  const textOpacity = Math.min(sceneProgress * 2.5, 1) * (1 - Math.max((sceneProgress - 0.75) * 4, 0));

  return (
    <div className="scene-hud">
      <div className="scene-text-container">
        <div className="scene-title" style={{ opacity: textOpacity }}>
          {scene?.title}
        </div>
        <div className="scene-text" style={{ opacity: Math.max(textOpacity - 0.1, 0) }}>
          {scene?.text}
        </div>
      </div>

      {/* Scroll hint — only first scene */}
      {currentScene === 0 && scrollProgress < 10 && (
        <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', color: 'rgba(0,255,255,0.6)', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>
          ↓ SCROLL TO ENTER ↓
        </div>
      )}

      {/* Skip button */}
      {scrollProgress < 78 && (
        <button
          onClick={onSkip}
          style={{ position: 'absolute', top: '20px', right: '20px', padding: '8px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,255,0.3)', color: 'rgba(0,255,255,0.6)', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', cursor: 'pointer', borderRadius: '4px', backdropFilter: 'blur(4px)', pointerEvents: 'auto' }}
        >
          SKIP →
        </button>
      )}

      <div className="scroll-indicator">
        <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>
    </div>
  );
}
