import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import axios from 'axios';

const API = 'https://m3-hub-mvp1-production.up.railway.app';

const Planet = () => {
  const m = useRef();
  useFrame(() => m.current && (m.current.rotation.y += 0.0003));
  return (
    <mesh ref={m} position={[0, 0, -8]}>
      <sphereGeometry args={[3, 64, 64]} />
      <meshStandardMaterial emissive="#ff00ff" emissiveIntensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#00ffff" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#ff00ff" />
    </mesh>
  );
};

const Ship = ({ crashed, setCrashed }) => {
  const m = useRef();
  const p = useRef(0);
  useFrame(() => {
    if (!crashed && m.current) {
      p.current += 0.08;
      m.current.position.y = 10 - p.current * 0.5;
      m.current.rotation.z = p.current * 0.05;
      if (p.current > 18) setCrashed(true);
    }
  });
  return (
    <mesh ref={m} position={[0, 10, 0]}>
      <coneGeometry args={[0.4, 1.5, 8]} />
      <meshStandardMaterial emissive="#00ffff" emissiveIntensity={0.8} />
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 0.3, 6]} />
        <meshStandardMaterial emissive="#ff00ff" emissiveIntensity={0.6} />
      </mesh>
    </mesh>
  );
};

const Portal = ({ crashed }) => {
  const m = useRef();
  useFrame(() => {
    if (crashed && m.current) {
      m.current.rotation.z += 0.02;
      m.current.scale.x = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
      m.current.scale.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
    }
  });
  return (
    <mesh ref={m} position={[0, 1, 0]} scale={crashed ? 1 : 0}>
      <torusGeometry args={[1, 0.15, 16, 32]} />
      <meshStandardMaterial emissive="#00ffff" emissiveIntensity={crashed ? 1 : 0} />
    </mesh>
  );
};

const Form = ({ crashed, onLogin, onErr }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');
  const [load, setLoad] = useState(false);

  const submit = async (fn) => {
    setErr('');
    setLoad(true);
    try {
      const res = await axios.post(`${API}/api/auth/${fn}`, { username: user, password: pass });
      onLogin(res.data.token, res.data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed');
    } finally {
      setLoad(false);
    }
  };

  const guest = async () => {
    setErr('');
    setLoad(true);
    try {
      const res = await axios.post(`${API}/api/auth/guest`);
      onLogin(res.data.token, res.data.user);
    } catch (e) {
      setErr(e.response?.data?.error || 'Guest failed');
    } finally {
      setLoad(false);
    }
  };

  return (
    <div style={{
      position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
      opacity: crashed ? 1 : 0, transition: 'opacity 0.8s', pointerEvents: crashed ? 'auto' : 'none',
      backdropFilter: 'blur(8px)', background: 'rgba(0, 15, 30, 0.7)', border: '2px solid #00ffff',
      boxShadow: '0 0 20px #00ffff, inset 0 0 20px rgba(0, 255, 255, 0.1)',
      padding: '24px', borderRadius: '8px', width: '320px', fontFamily: 'monospace'
    }}>
      <div style={{ color: '#ff00ff', fontSize: '14px', marginBottom: '12px', textShadow: '0 0 10px #ff00ff', textAlign: 'center' }}>
        NEURAL LINK
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => setMode(m)} disabled={load} style={{
            flex: 1, padding: '8px', background: mode === m ? '#00ffff' : '#001a33', color: mode === m ? '#000' : '#00ffff',
            border: '1px solid #00ffff', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '11px', fontWeight: 'bold'
          }}>
            {m.toUpperCase()}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        disabled={load}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#001a33', border: '1px solid #00ffff', color: '#00ffff', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}
      />
      <input
        type="password"
        placeholder="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        disabled={load}
        style={{ width: '100%', padding: '10px', marginBottom: '12px', background: '#001a33', border: '1px solid #00ffff', color: '#00ffff', fontFamily: 'monospace', fontSize: '12px', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}
      />
      {err && <div style={{ color: '#ff4444', fontSize: '11px', marginBottom: '12px', padding: '8px', background: '#2a0000', borderRadius: '4px' }}>{err}</div>}
      <button
        onClick={() => submit(mode)}
        disabled={load}
        style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #00ffff, #ff00ff)', border: 'none', color: '#000', fontWeight: 'bold', cursor: load ? 'not-allowed' : 'pointer', fontFamily: 'monospace', fontSize: '12px', borderRadius: '4px', boxShadow: '0 0 15px #00ffff', opacity: load ? 0.6 : 1, marginBottom: '8px' }}
      >
        {load ? '⏳' : mode === 'login' ? 'LOGIN' : 'REGISTER'}
      </button>
      <button
        onClick={guest}
        disabled={load}
        style={{ width: '100%', padding: '10px', background: '#1a1a3a', border: '1px solid #ff00ff', color: '#ff00ff', cursor: load ? 'not-allowed' : 'pointer', fontFamily: 'monospace', fontSize: '12px', borderRadius: '4px', opacity: load ? 0.6 : 1 }}
      >
        {load ? '⏳' : 'GUEST'}
      </button>
    </div>
  );
};

export default function ShipCrashLogin({ onAuth }) {
  const [crashed, setCrashed] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#000' }}>
      <Canvas>
        <color attach="background" args={['#000010']} />
        <ambientLight intensity={0.2} />
        <Planet />
        <Ship crashed={crashed} setCrashed={setCrashed} />
        <Portal crashed={crashed} />
      </Canvas>
      <Form crashed={crashed} onLogin={onAuth} onErr={() => {}} />
      {!crashed && (
        <button
          onClick={() => setCrashed(true)}
          style={{ position: 'absolute', bottom: 20, left: 20, padding: '10px 20px', background: '#ff00ff', border: '1px solid #00ffff', color: '#000', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px', boxShadow: '0 0 15px #ff00ff' }}
        >
          INITIATE LANDING
        </button>
      )}
    </div>
  );
}