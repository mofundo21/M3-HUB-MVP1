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
  { title: 'WELCOME HOME', text: 'Enter the M3 Hub. Discover your place in this universe. Create, explore, recode.' },
];

export default function ScrollJourneyLogin({ onAuth }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [crashed, setCrashed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setScrollProgress(progress);
      setCurrentScene(Math.min(Math.floor(progress / 20), 4));
      if (progress >= 85) setCrashed(true);
      if (progress >= 90) setFormVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="journey-container">
      <div className="scroll-spacer" style={{ height: '5000px' }} />
      <div className="fixed-canvas">
        <Canvas camera={{ position: [0, 5, 25], fov: 75 }} dpr={Math.min(window.devicePixelRatio, 2)}>
          <JourneyScene scrollProgress={scrollProgress} crashed={crashed} />
        </Canvas>
      </div>

      {/* Screen flash on crash */}
      {crashed && (
        <div style={{
          position: 'fixed', inset: 0, background: 'white', zIndex: 50,
          animation: 'crashFlash 0.6s ease-out forwards', pointerEvents: 'none',
        }} />
      )}

      <SceneHUD currentScene={currentScene} scrollProgress={scrollProgress} />

      {formVisible && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
          paddingBottom: '32px', animation: 'slideUpForm 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
        }}>
          <LoginFormOverlay onAuth={onAuth} compact />
        </div>
      )}
    </div>
  );
}

function SceneHUD({ currentScene, scrollProgress }) {
  const scene = LORE_SCENES[Math.min(currentScene, 4)];
  const sceneLocal = scrollProgress % 20;

  // Fade in first half of scene, fade out last quarter
  const fadeIn = Math.min(sceneLocal / 6, 1);
  const fadeOut = sceneLocal > 14 ? Math.max(1 - (sceneLocal - 14) / 6, 0) : 1;
  const textOpacity = fadeIn * fadeOut;

  const showScrollHint = currentScene === 0 && scrollProgress < 8;
  const showProgress = scrollProgress > 2;

  return (
    <div className="scene-hud" style={{ pointerEvents: 'none' }}>
      {/* Scene number */}
      {showProgress && (
        <div style={{
          position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(0,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px',
          letterSpacing: '4px', textTransform: 'uppercase',
        }}>
          SCENE {currentScene + 1} / 5
        </div>
      )}

      {/* Lore text — center of screen */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center', maxWidth: '640px', padding: '0 24px',
        opacity: textOpacity, transition: 'opacity 0.15s linear',
      }}>
        <div style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 700,
          letterSpacing: '4px', textTransform: 'uppercase',
          fontFamily: "'Space Mono', monospace",
          color: '#00ffff',
          textShadow: '0 0 30px rgba(0,255,255,0.8), 0 0 60px rgba(0,255,255,0.4)',
          marginBottom: '20px', lineHeight: 1.2,
        }}>
          {scene?.title}
        </div>
        <div style={{
          fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)', letterSpacing: '1px',
          color: 'rgba(255,255,255,0.85)',
          textShadow: '0 0 20px rgba(0,255,255,0.3)',
          lineHeight: 1.7, fontFamily: "'IBM Plex Mono', monospace",
          maxWidth: '520px', margin: '0 auto',
        }}>
          {scene?.text}
        </div>
      </div>

      {/* Scroll to enter */}
      {showScrollHint && (
        <div style={{
          position: 'absolute', bottom: '80px', left: '50%',
          transform: 'translateX(-50%)',
          color: '#00ffff', fontFamily: "'Space Mono', monospace",
          fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
          letterSpacing: '5px', textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(0,255,255,0.9), 0 0 40px rgba(0,255,255,0.5)',
          animation: 'scrollPulse 1.8s ease-in-out infinite',
          whiteSpace: 'nowrap',
        }}>
          ↓ &nbsp; SCROLL TO ENTER &nbsp; ↓
        </div>
      )}

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '3px', background: 'rgba(0,255,255,0.08)',
      }}>
        <div style={{
          height: '100%', width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, #00ffff, #ff00ff, #ffd700)',
          boxShadow: '0 0 8px rgba(0,255,255,0.6)',
          transition: 'width 0.1s linear',
        }} />
      </div>
    </div>
  );
}
