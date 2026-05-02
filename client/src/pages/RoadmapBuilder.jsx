import React, { useEffect, useMemo, useRef, useState } from 'react';
import RoadmapRooms3D from '../components/RoadmapRooms3D';

const API_BASE =
  (typeof window !== 'undefined' && window.location.hostname
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'http://localhost:3001');
const api = (p) => `${API_BASE}${p}`;

const AGENT = {
  gen:   { color: '#00ccff', label: 'GEN',   tag: 'INFRASTRUCTURE',  theme: 'blueprint' },
  kal:   { color: '#ff006e', label: 'KAL',   tag: 'API / NETWORK',   theme: 'network'  },
  psy:   { color: '#b13aff', label: 'PSY',   tag: 'DESIGN / WORLD',  theme: 'creative' },
  media: { color: '#00ff41', label: 'MEDIA', tag: 'SOCIAL / CONTENT', theme: 'feed'    },
};
const AGENT_ORDER = ['gen', 'kal', 'psy', 'media'];

const STATUS = {
  pending:   { color: '#666',    label: 'IDLE' },
  executing: { color: '#ff9500', label: 'EXECUTING' },
  complete:  { color: '#00ff41', label: 'COMPLETE' },
  failed:    { color: '#ff0040', label: 'FAILED' },
  stopped:   { color: '#ffff00', label: 'STOPPED' },
};

const fmtMs = (ms) => {
  if (!ms || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
};

const STYLE_SHEET = `
@keyframes m3-idle-pulse {
  0%, 100% { box-shadow: 0 0 6px currentColor, inset 0 0 4px currentColor; }
  50% { box-shadow: 0 0 14px currentColor, inset 0 0 8px currentColor; }
}
@keyframes m3-execute-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes m3-execute-glow {
  0%, 100% { box-shadow: 0 0 14px currentColor, inset 0 0 8px currentColor; }
  50% { box-shadow: 0 0 28px currentColor, inset 0 0 18px currentColor; }
}
@keyframes m3-complete-flash {
  0%, 100% { filter: brightness(1); }
  20%, 60% { filter: brightness(1.8) saturate(1.4); }
  40%, 80% { filter: brightness(1); }
}
@keyframes m3-fail-glow {
  0%, 100% { box-shadow: 0 0 10px #ff0040, inset 0 0 6px #ff0040; }
  50% { box-shadow: 0 0 22px #ff0040, inset 0 0 14px #ff0040; }
}
@keyframes m3-room-glow {
  0%, 100% { box-shadow: 0 0 10px var(--agent-color), inset 0 0 20px var(--agent-color)22; }
  50% { box-shadow: 0 0 28px var(--agent-color), 0 0 48px var(--agent-color), inset 0 0 30px var(--agent-color)44; }
}
@keyframes m3-fade-in-line {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes m3-badge-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
@keyframes m3-badge-flash { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.8); } }
@keyframes m3-scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
@keyframes m3-drift {
  0% { transform: translate(0, 0); opacity: 0; }
  10%, 90% { opacity: 0.6; }
  100% { transform: translate(40vw, -30vh); opacity: 0; }
}
@keyframes m3-drift2 {
  0% { transform: translate(0, 0); opacity: 0; }
  15%, 85% { opacity: 0.5; }
  100% { transform: translate(-30vw, 40vh); opacity: 0; }
}
@keyframes m3-data-flow {
  from { background-position: 0 0; }
  to { background-position: 40px 0; }
}
@keyframes m3-node-pulse {
  0%, 100% { box-shadow: 0 0 4px currentColor; }
  50% { box-shadow: 0 0 14px currentColor; }
}
@keyframes m3-swirl { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes m3-feed-roll { from { background-position: 0 0; } to { background-position: 0 30px; } }

.m3-avatar-idle { animation: m3-idle-pulse 2.4s ease-in-out infinite; }
.m3-avatar-executing { animation: m3-execute-glow 0.9s ease-in-out infinite; }
.m3-avatar-complete { animation: m3-complete-flash 1.8s ease-out; }
.m3-avatar-failed { animation: m3-fail-glow 0.8s ease-in-out 3; }
.m3-avatar-ring-spin { animation: m3-execute-spin 0.8s linear infinite; }
.m3-avatar-ring-slow { animation: m3-execute-spin 8s linear infinite; }

.m3-room-idle { transition: box-shadow 300ms; }
.m3-room-executing { animation: m3-room-glow 1.6s ease-in-out infinite; }
.m3-room-complete { animation: m3-complete-flash 1.8s ease-out; }
.m3-room-failed { animation: m3-fail-glow 0.9s ease-in-out 3; }

.m3-badge-executing { animation: m3-badge-pulse 1.1s ease-in-out infinite; }
.m3-badge-complete { animation: m3-badge-flash 0.45s ease-in-out 3; }

.m3-line { animation: m3-fade-in-line 280ms ease-out; }

.m3-theme-blueprint {
  background-image:
    linear-gradient(to right, #00ccff0f 1px, transparent 1px),
    linear-gradient(to bottom, #00ccff0f 1px, transparent 1px),
    linear-gradient(180deg, #00ccff08 0%, #02020a 100%);
  background-size: 24px 24px, 24px 24px, 100% 100%;
}
.m3-theme-network {
  background-image:
    radial-gradient(circle at 20% 30%, #ff006e22 0, transparent 14px),
    radial-gradient(circle at 70% 65%, #ff006e22 0, transparent 14px),
    radial-gradient(circle at 40% 80%, #ff006e22 0, transparent 14px),
    linear-gradient(180deg, #ff006e05 0%, #02020a 100%);
  animation: m3-node-pulse 2.4s ease-in-out infinite;
  color: #ff006e;
}
.m3-theme-creative {
  background-image:
    conic-gradient(from 0deg at 30% 40%, #b13aff18, transparent 30%),
    conic-gradient(from 180deg at 80% 70%, #ff66ff15, transparent 35%),
    linear-gradient(180deg, #b13aff07 0%, #02020a 100%);
}
.m3-theme-feed {
  background-image:
    repeating-linear-gradient(0deg, #00ff4110 0px, #00ff4110 1px, transparent 1px, transparent 14px),
    linear-gradient(180deg, #00ff4107 0%, #02020a 100%);
  animation: m3-feed-roll 4s linear infinite;
}

.m3-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.m3-scroll::-webkit-scrollbar-track { background: #050510; }
.m3-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--agent-color, #00ffff)aa, var(--agent-color, #00ffff)44);
  border-radius: 4px;
}
.m3-scroll::-webkit-scrollbar-thumb:hover { box-shadow: 0 0 8px var(--agent-color, #00ffff); }

.m3-particle {
  position: absolute; width: 3px; height: 3px; border-radius: 50%;
  pointer-events: none;
}

.m3-vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 40%, #000 100%);
  opacity: 0.6;
}

.m3-phase-card {
  border: 1px solid rgba(178, 223, 219, 0.14);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(12, 16, 35, 0.86) 0%, rgba(8, 11, 24, 0.8) 100%);
  overflow: hidden;
  box-shadow: 0 20px 46px rgba(6, 10, 24, 0.32);
}

.m3-phase-card + .m3-phase-card {
  margin-top: 18px;
}

.m3-task-row {
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.m3-task-row:hover {
  transform: translateY(-1px);
}
`;

// ---- hooks ----

function useRoadmap() {
  const [state, setState] = useState({ phases: [], loading: true, error: null });
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(api('/api/roadmap'));
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const j = await r.json();
        if (alive) setState({ phases: j.phases || [], loading: false, error: null });
      } catch (e) {
        if (alive) setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    };
    tick();
    const h = setInterval(tick, 1100);
    return () => { alive = false; clearInterval(h); };
  }, []);
  return state;
}

function useAgentRun(taskId) {
  const [snap, setSnap] = useState(null);
  useEffect(() => {
    if (!taskId) { setSnap(null); return; }
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(api(`/api/roadmap/tasks/${taskId}`));
        if (!r.ok) return;
        const j = await r.json();
        if (alive) setSnap(j);
      } catch {}
    };
    tick();
    const h = setInterval(tick, 700);
    return () => { alive = false; clearInterval(h); };
  }, [taskId]);
  return snap;
}

function useLiveElapsed(startedAt, endedAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!startedAt || endedAt) return;
    const h = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(h);
  }, [startedAt, endedAt]);
  if (!startedAt) return 0;
  return (endedAt || now) - startedAt;
}

function useViewportWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}

// ---- small components ----

function Badge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  const anim =
    status === 'executing' ? 'm3-badge-executing' :
    status === 'complete'  ? 'm3-badge-complete'  : '';
  return (
    <span
      className={anim}
      style={{
        display: 'inline-block',
        fontFamily: 'Consolas, monospace', fontSize: 10, letterSpacing: 2,
        padding: '3px 8px', background: '#000',
        color: s.color, border: `1px solid ${s.color}`, fontWeight: 700,
        boxShadow: `0 0 8px ${s.color}66, inset 0 0 6px ${s.color}22`,
      }}
    >{s.label}</span>
  );
}

const AVATAR_CLIP = {
  blueprint: 'polygon(25% 6%, 75% 6%, 98% 50%, 75% 94%, 25% 94%, 2% 50%)', // hexagon
  network:   'circle(48% at 50% 50%)',
  creative:  'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)', // star
  feed:      'polygon(15% 10%, 85% 10%, 85% 90%, 15% 90%)', // square
};

function AgentAvatar({ agent, status, size = 44 }) {
  const a = AGENT[agent];
  const running = status === 'executing';
  const avatarClass =
    running                ? 'm3-avatar-executing' :
    status === 'complete'  ? 'm3-avatar-complete'  :
    status === 'failed'    ? 'm3-avatar-failed'    : 'm3-avatar-idle';
  const ringClass = running ? 'm3-avatar-ring-spin' : 'm3-avatar-ring-slow';
  const clip = AVATAR_CLIP[a.theme] || AVATAR_CLIP.network;
  return (
    <div
      title={`${a.label} — ${a.tag}`}
      className={avatarClass}
      style={{
        width: size, height: size,
        clipPath: clip, WebkitClipPath: clip,
        background: `radial-gradient(circle at 35% 30%, ${a.color}cc, #000 70%)`,
        color: a.color, flexShrink: 0, position: 'relative',
        border: `2px solid ${a.color}`,
      }}
    >
      <div
        className={ringClass}
        style={{
          position: 'absolute', inset: 3,
          clipPath: clip, WebkitClipPath: clip,
          background: `conic-gradient(from 0deg, transparent, ${a.color}66, transparent 70%)`,
        }}
      />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: size * 0.28, color: '#fff',
        textShadow: `0 0 8px ${a.color}`, letterSpacing: 1,
      }}>
        {a.label}
      </div>
    </div>
  );
}

function OutputTerminal({ lines, agentColor, maxHeight = 180 }) {
  const scrollRef = useRef(null);
  const prevLen = useRef(0);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    prevLen.current = lines.length;
  }, [lines.length]);
  return (
    <div
      ref={scrollRef}
      className="m3-scroll"
      style={{
        maxHeight, overflowY: 'auto', padding: 10, minHeight: 100,
        background: '#fbfdff', fontFamily: 'Consolas, monospace', fontSize: 10.5,
        whiteSpace: 'pre-wrap', lineHeight: 1.55,
        borderTop: '1px solid #d8e2ee',
        '--agent-color': agentColor,
      }}
    >
      {lines.length === 0 && <span style={{ color: '#7a8797' }}>$ awaiting output...</span>}
      {lines.map((o, i) => (
        <div
          key={i}
          className={i >= prevLen.current ? 'm3-line' : ''}
          style={{
            color: o.kind === 'stderr' ? '#d58d2f' : (o.kind === 'sys' ? '#7a8797' : '#2c8c58'),
          }}
        >
          <span style={{ color: '#a1afc0', marginRight: 6 }}>{String(i + 1).padStart(3, '0')}</span>
          {o.line}
        </div>
      ))}
    </div>
  );
}

// ---- agent room ----

function AgentRoom({ agentId, activeTask, snap, onStop, focused, onFocus }) {
  const a = AGENT[agentId];
  const run = snap?.run;
  const status = run?.status || 'pending';
  const running = status === 'executing';
  const liveElapsed = useLiveElapsed(run?.startedAt, run?.endedAt);
  const roomClass =
    running               ? 'm3-room-executing' :
    status === 'complete' ? 'm3-room-complete'  :
    status === 'failed'   ? 'm3-room-failed'    : 'm3-room-idle';

  return (
    <div
      onClick={onFocus}
      className={`${roomClass} m3-theme-${a.theme}`}
      style={{
        display: 'grid', gridTemplateRows: 'auto auto 1fr',
        minHeight: 0, color: a.color,
        '--agent-color': a.color,
        border: `1.5px solid ${running ? a.color : `${a.color}44`}`,
        borderLeft: `4px solid ${a.color}`,
        cursor: 'pointer',
        borderRadius: 4, overflow: 'hidden',
        transition: 'border-color 300ms',
      }}
    >
      <div style={{
        padding: '8px 10px', display: 'flex', gap: 10, alignItems: 'center',
        borderBottom: `1px solid ${a.color}22`,
        background: `linear-gradient(180deg, ${a.color}12, transparent)`,
      }}>
        <AgentAvatar agent={agentId} status={status} size={focused ? 56 : 40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
            <span style={{
              fontFamily: 'Consolas, monospace', color: a.color, fontWeight: 800,
              letterSpacing: 3, fontSize: 12, textShadow: `0 0 6px ${a.color}`,
            }}>
              {a.label} ROOM
            </span>
            <Badge status={activeTask ? status : 'pending'} />
          </div>
          <div style={{
            fontFamily: 'Consolas, monospace', fontSize: 9, color: '#667', letterSpacing: 2, marginTop: 1,
          }}>
            {a.tag}
          </div>
        </div>
      </div>

      <div style={{
        padding: '6px 10px', borderBottom: `1px solid ${a.color}22`,
        background: '#02020a99', backdropFilter: 'blur(2px)',
      }}>
        {activeTask ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <div style={{
                fontFamily: 'Consolas, monospace', color: '#eaeaea', fontSize: 11, fontWeight: 700,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
              }}>
                {activeTask.name}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  fontFamily: 'Consolas, monospace', color: a.color, fontSize: 10, letterSpacing: 1,
                  textShadow: running ? `0 0 6px ${a.color}` : 'none',
                }}>
                  {fmtMs(liveElapsed)}
                </span>
                {running && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStop(activeTask.id); }}
                    style={{
                      padding: '3px 9px', background: '#ff4466', color: '#fff',
                      border: 'none', fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: 10,
                      cursor: 'pointer', letterSpacing: 2,
                    }}
                  >■</button>
                )}
              </div>
            </div>
            <div style={{
              display: 'flex', gap: 10, fontFamily: 'Consolas, monospace', fontSize: 9,
              color: '#667', marginTop: 3,
            }}>
              {run?.output?.length != null && <span>lines {run.output.length}</span>}
              {run?.exitCode != null && <span>exit {run.exitCode}</span>}
              {run?.stoppedByUser && <span style={{ color: '#ffff00' }}>killed</span>}
            </div>
            {run?.error && (
              <div style={{ fontFamily: 'Consolas, monospace', fontSize: 10, color: '#ff6688', marginTop: 4 }}>
                ERR: {run.error}
              </div>
            )}
          </>
        ) : (
          <div style={{ fontFamily: 'Consolas, monospace', fontSize: 10, color: '#556', letterSpacing: 2 }}>
            idle — no task assigned
          </div>
        )}
      </div>

      <OutputTerminal
        lines={run?.output || []}
        agentColor={a.color}
        maxHeight={focused ? 360 : 180}
      />
    </div>
  );
}

function lastNonExecFor(phases, agent) {
  let best = null;
  for (const p of phases) for (const t of p.tasks) {
    if (t.agent === agent && t.status !== 'pending' && t.status !== 'executing') {
      if (!best || (t.endedAt || 0) > (best.endedAt || 0)) {
        best = { ...t, phaseName: p.name, phaseNum: p.num };
      }
    }
  }
  return best;
}

function buildActiveByAgent(phases) {
  const out = { gen: null, kal: null, psy: null, media: null };
  for (const p of phases) for (const t of p.tasks) {
    if (t.status === 'executing' && out[t.agent] == null) {
      out[t.agent] = { ...t, phaseName: p.name, phaseNum: p.num };
    }
  }
  for (const id of AGENT_ORDER) {
    if (!out[id]) {
      const last = lastNonExecFor(phases, id);
      if (last) out[id] = last;
    }
  }
  return out;
}

function AgentGrid({ phases, onStop, stacked = false, mobile = false }) {
  const [focused, setFocused] = useState(null);

  const activeByAgent = useMemo(() => {
    const out = { gen: null, kal: null, psy: null, media: null };
    for (const p of phases) for (const t of p.tasks) {
      if (t.status === 'executing' && out[t.agent] == null) {
        out[t.agent] = { ...t, phaseName: p.name, phaseNum: p.num };
      }
    }
    for (const id of AGENT_ORDER) {
      if (!out[id]) {
        const last = lastNonExecFor(phases, id);
        if (last) out[id] = last;
      }
    }
    return out;
  }, [phases]);

  const gen   = useAgentRun(activeByAgent.gen?.id);
  const kal   = useAgentRun(activeByAgent.kal?.id);
  const psy   = useAgentRun(activeByAgent.psy?.id);
  const media = useAgentRun(activeByAgent.media?.id);
  const snaps = { gen, kal, psy, media };

  const gridTemplate = stacked
    ? (focused
        ? `"focused" minmax(${mobile ? 340 : 420}px, auto) "${AGENT_ORDER
            .filter((id) => id !== focused)
            .join('" minmax(250px, auto) "')}"`
        : '"gen" minmax(250px, auto) "kal" minmax(250px, auto) "psy" minmax(250px, auto) "media" minmax(250px, auto) / 1fr')
    : (focused
        ? (focused === 'gen'   ? '"focused focused" minmax(320px, 1.15fr) "kal kal" minmax(220px, .8fr) "psy media" minmax(220px, .8fr) / 1fr 1fr' :
           focused === 'kal'   ? '"focused focused" minmax(320px, 1.15fr) "gen gen" minmax(220px, .8fr) "psy media" minmax(220px, .8fr) / 1fr 1fr' :
           focused === 'psy'   ? '"focused focused" minmax(320px, 1.15fr) "gen kal" minmax(220px, .8fr) "media media" minmax(220px, .8fr) / 1fr 1fr' :
                                 '"focused focused" minmax(320px, 1.15fr) "gen kal" minmax(220px, .8fr) "psy psy" minmax(220px, .8fr) / 1fr 1fr')
        : '"gen kal" minmax(260px, 1fr) "psy media" minmax(260px, 1fr) / 1fr 1fr');

  return (
    <div style={{
      display: 'grid',
      grid: gridTemplate,
      gap: 14, padding: 14, minHeight: 0,
    }}>
      {AGENT_ORDER.map((id) => (
        <div key={id} style={{ gridArea: focused === id ? 'focused' : id, minHeight: 0 }}>
          <AgentRoom
            agentId={id}
            activeTask={activeByAgent[id]}
            snap={snaps[id]}
            onStop={onStop}
            focused={focused === id}
            onFocus={() => setFocused(focused === id ? null : id)}
          />
        </div>
      ))}
    </div>
  );
}

// ---- roadmap pane ----

function TaskRow({ task, phase, onStart, onStop, compact = false }) {
  const a = AGENT[task.agent] || AGENT.gen;
  const running = task.status === 'executing';
  return (
    <div
      className="m3-task-row"
      style={{
        background: running ? `${a.color}18` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${running ? a.color : 'rgba(178,223,219,0.12)'}`,
        borderLeft: `4px solid ${a.color}`,
        padding: compact ? '10px 12px' : '12px 14px',
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : 'minmax(0,1fr) auto',
        gap: compact ? 12 : 14,
        alignItems: compact ? 'stretch' : 'center',
        borderRadius: 12,
        transition: 'background 200ms, border-color 200ms',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontFamily: 'Consolas, monospace', fontSize: 9, color: '#8f98b3', letterSpacing: 2 }}>P{phase.num}</span>
          <span style={{ fontFamily: 'Consolas, monospace', color: a.color, fontSize: 9, letterSpacing: 2 }}>{a.label}</span>
          <span style={{ fontFamily: 'Consolas, monospace', fontSize: 9, color: '#8f98b3' }}>{phase.name}</span>
          <span style={{ fontFamily: 'Consolas, monospace', fontSize: 9, color: '#8f98b3' }}>~{task.eta}m</span>
        </div>
        <div style={{
          fontFamily: 'Consolas, monospace', color: '#eef3ff', fontWeight: 700, fontSize: compact ? 12 : 13, lineHeight: 1.35,
          whiteSpace: 'normal',
        }}>{task.name}</div>
        {task.desc && (
          <div style={{
            marginTop: 8,
            fontFamily: 'Consolas, monospace',
            color: '#a0a8c0',
            fontSize: compact ? 10 : 10.5,
            lineHeight: 1.55,
            whiteSpace: 'normal',
          }}>
            {task.desc}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: compact ? 'space-between' : 'flex-end', flexWrap: 'wrap' }}>
        <Badge status={task.status} />
        {!running ? (
          <button
            onClick={() => onStart(task.id)}
            style={{
              padding: '6px 12px', background: a.color, color: '#000',
              border: 'none', borderRadius: 8, fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: 10,
              boxShadow: `0 0 18px ${a.color}33`,
              cursor: 'pointer', letterSpacing: 2,
            }}
          >▶</button>
        ) : (
          <button
            onClick={() => onStop(task.id)}
            style={{
              padding: '6px 12px', background: '#ff4466', color: '#fff',
              border: 'none', borderRadius: 8, fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: 10,
              boxShadow: '0 0 18px rgba(255,68,102,0.24)',
              cursor: 'pointer', letterSpacing: 2,
            }}
          >■</button>
        )}
      </div>
    </div>
  );
}

function RoadmapPane({ phases, onStart, onStop, compact = false }) {
  return (
    <div className="m3-scroll" style={{
      overflowY: 'auto', padding: compact ? 12 : 16, minHeight: 0, background: 'linear-gradient(180deg, rgba(10,14,30,0.88), rgba(7,10,22,0.92))',
    }}>
      {phases.map((phase) => (
        <section key={phase.id} className="m3-phase-card">
          <div style={{
            padding: compact ? '12px 14px' : '14px 16px',
            borderBottom: '1px solid rgba(178,223,219,0.12)',
            background: 'linear-gradient(180deg, rgba(63,81,181,0.18) 0%, rgba(9,12,24,0.08) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{
                  fontFamily: 'Consolas, monospace', color: '#b2dfdb', fontSize: 10,
                  letterSpacing: 3, textShadow: '0 0 6px rgba(178,223,219,0.28)',
                }}>PHASE {phase.num}</div>
                <div style={{ fontFamily: 'Consolas, monospace', color: '#f5f8ff', fontWeight: 700, fontSize: compact ? 13 : 14, marginTop: 6 }}>
                  {phase.name}
                </div>
              </div>
              <div style={{
                fontFamily: 'Consolas, monospace',
                color: '#8e9ab4',
                fontSize: 10,
                letterSpacing: 2,
              }}>
                {phase.tasks.length} TASKS
              </div>
            </div>
            {phase.blurb && (
              <div style={{
                marginTop: 10,
                fontFamily: 'Consolas, monospace',
                color: '#a0a8c0',
                fontSize: compact ? 10 : 10.5,
                lineHeight: 1.5,
              }}>
                {phase.blurb}
              </div>
            )}
          </div>

          <div style={{ padding: compact ? 10 : 12, display: 'grid', gap: 10 }}>
            {phase.tasks.map((t) => (
              <TaskRow key={t.id} task={t} phase={phase} onStart={onStart} onStop={onStop} compact={compact} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- MoChatuno ----

function MoChatunoChat() {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(api('/api/hermes/history'));
        if (r.ok) { const j = await r.json(); setMessages(j.history || []); }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length, sending]);

  const send = async () => {
    const msg = draft.trim();
    if (!msg || sending) return;
    setDraft('');
    setMessages((m) => [...m, { role: 'user', content: msg, at: Date.now() }]);
    setSending(true);
    try {
      const r = await fetch(api('/api/hermes/chat'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const j = await r.json().catch(() => ({}));
      const reply = j.reply || j.error || '(no reply)';
      setMessages((m) => [...m, { role: 'assistant', content: reply, at: Date.now(), ok: j.ok !== false }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `ERROR: ${e.message}`, at: Date.now(), ok: false }]);
    } finally { setSending(false); }
  };

  const visible = messages.slice(-50);

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'auto 1fr auto', gridTemplateRows: 'auto 1fr',
      gap: 0, minHeight: 0,
      background: 'linear-gradient(180deg, rgba(12,16,35,0.9) 0%, rgba(8,11,24,0.88) 100%)',
      border: '1px solid rgba(178,223,219,0.14)', borderRadius: 18, overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(8, 12, 28, 0.24)',
    }}>
      <div style={{
        gridColumn: '1 / span 3', padding: '8px 12px',
        borderBottom: '1px solid rgba(178,223,219,0.12)',
        background: 'linear-gradient(180deg, rgba(63,81,181,0.18) 0%, rgba(10,14,28,0.08) 100%)',
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div
          className={sending ? 'm3-avatar-executing' : 'm3-avatar-idle'}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '2px solid #ffdd00',
            background: 'radial-gradient(circle at 35% 30%, #ffdd00cc, #000 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: 11,
            color: '#fff',
            letterSpacing: 1,
          }}
        >MCT</div>
        <div>
          <div style={{
            fontFamily: 'Consolas, monospace', color: '#b2dfdb', fontWeight: 800,
            letterSpacing: 3, fontSize: 13,
          }}>MoChatuno · COORDINATOR</div>
          <div style={{ fontFamily: 'Consolas, monospace', fontSize: 10, color: '#8e9ab4', letterSpacing: 2 }}>
            chat · brainstorm · route tasks
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="m3-scroll"
        style={{
          gridColumn: '1 / span 3',
          overflowY: 'auto', padding: 10, minHeight: 0,
          '--agent-color': '#ffdd00',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(7, 10, 20, 0.72)',
        }}
      >
        {visible.length === 0 && (
          <div style={{ color: '#8e9ab4', fontFamily: 'Consolas, monospace', fontSize: 11, padding: 10 }}>
            ask MoChatuno about architecture, roadmap, or the next move...
          </div>
        )}
        {visible.map((m, i) => {
          const mine = m.role === 'user';
          return (
            <div
              key={i}
              className="m3-line"
              style={{
                margin: '5px 0', display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '75%', padding: '7px 11px',
                background: mine ? 'rgba(63,81,181,0.24)' : 'rgba(178,223,219,0.09)',
                border: `1px solid ${mine ? 'rgba(122,136,255,0.36)' : 'rgba(178,223,219,0.22)'}`,
                fontFamily: 'Consolas, monospace', fontSize: 11, lineHeight: 1.5,
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                borderRadius: 3,
                color: m.ok === false ? '#ff8ca7' : '#e8eeff',
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="m3-badge-executing" style={{
            margin: '6px 0', color: '#b2dfdb', fontFamily: 'Consolas, monospace', fontSize: 11,
          }}>MoChatuno thinking...</div>
        )}
        <div style={{
          marginTop: 'auto', display: 'flex', gap: 6, paddingTop: 10,
          borderTop: '1px solid rgba(178,223,219,0.12)', position: 'sticky', bottom: -10, background: 'rgba(8, 11, 24, 0.96)',
        }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            disabled={sending}
            placeholder={sending ? 'waiting...' : 'ask MoChatuno...'}
            style={{
              flex: 1, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', color: '#eef3ff',
              border: '1px solid rgba(178,223,219,0.14)', borderRadius: 10, fontFamily: 'Consolas, monospace', fontSize: 11,
              outline: 'none',
            }}
          />
          <button
            onClick={send} disabled={sending || !draft.trim()}
            style={{
              padding: '8px 18px', background: sending ? '#2a3042' : '#3f51b5', color: '#f8faff',
              border: 'none', borderRadius: 10, fontFamily: 'Consolas, monospace', fontWeight: 800, fontSize: 11,
              letterSpacing: 2, cursor: sending ? 'default' : 'pointer',
            }}
          >SEND</button>
        </div>
      </div>
    </div>
  );
}

// ---- completion log ----

function CompletionStrip({ phases, dismissed, onDismiss, collapsed, onToggle }) {
  const [expandedId, setExpandedId] = useState(null);
  const expandedSnap = useAgentRun(expandedId);

  const done = useMemo(() => {
    const list = [];
    for (const p of phases) for (const t of p.tasks) {
      if ((t.status === 'complete' || t.status === 'failed' || t.status === 'stopped') && !dismissed.has(t.id)) {
        list.push({ ...t, phaseName: p.name, phaseNum: p.num });
      }
    }
    list.sort((a, b) => (b.endedAt || 0) - (a.endedAt || 0));
    return list;
  }, [phases, dismissed]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: collapsed ? 'auto' : (expandedId ? 'auto auto 1fr' : 'auto 1fr'),
      minHeight: 0, background: 'linear-gradient(180deg, rgba(10,14,30,0.92), rgba(7,10,22,0.96))', borderTop: '1px solid rgba(178,223,219,0.12)',
    }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(178,223,219,0.12)', display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{
          fontFamily: 'Consolas, monospace', color: '#b2dfdb', letterSpacing: 4, fontSize: 10,
          textShadow: '0 0 6px rgba(178,223,219,0.28)',
        }}>▓ COMPLETION LOG</span>
        <span style={{ fontFamily: 'Consolas, monospace', color: '#8e9ab4', fontSize: 10 }}>
          {done.length} shown · click card to expand · × to dismiss
        </span>
        <button
          onClick={onToggle}
          style={{
            marginLeft: 'auto', padding: '3px 10px', background: 'transparent',
            border: '1px solid rgba(178,223,219,0.16)', color: '#b8c0d9',
            fontFamily: 'Consolas, monospace', fontSize: 10, letterSpacing: 2, cursor: 'pointer',
          }}
        >{collapsed ? 'SHOW' : 'HIDE'}</button>
        {!collapsed && expandedId && (
          <button
            onClick={() => setExpandedId(null)}
            style={{
              padding: '3px 10px', background: 'transparent',
              border: '1px solid rgba(122,136,255,0.38)', color: '#7a88ff',
              fontFamily: 'Consolas, monospace', fontSize: 10, letterSpacing: 2, cursor: 'pointer',
            }}
          >× CLOSE OUTPUT</button>
        )}
      </div>

      {!collapsed && expandedId && (
        <div style={{ maxHeight: 200, borderBottom: '1px solid #1a1a2a' }}>
          <OutputTerminal
            lines={expandedSnap?.run?.output || []}
            agentColor={AGENT[expandedSnap?.run?.agent || 'gen']?.color || '#00ffff'}
            maxHeight={200}
          />
        </div>
      )}

      {!collapsed && (
      <div className="m3-scroll" style={{
        display: 'flex', gap: 6, padding: 6,
        overflowX: 'auto', overflowY: 'hidden', minHeight: 0,
        '--agent-color': '#00ffff',
        background: 'transparent',
      }}>
        {done.length === 0 && (
          <div style={{ color: '#444', fontFamily: 'Consolas, monospace', fontSize: 10, padding: 6 }}>
            no finished tasks yet
          </div>
        )}
        {done.map((t) => {
          const s = STATUS[t.status] || STATUS.pending;
          const a = AGENT[t.agent] || AGENT.gen;
          const isExpanded = expandedId === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setExpandedId(isExpanded ? null : t.id)}
              style={{
                minWidth: 210, maxWidth: 250,
                border: `1px solid ${isExpanded ? s.color : 'rgba(178,223,219,0.12)'}`,
                borderLeft: `3px solid ${a.color}`,
                padding: 8, background: isExpanded ? 'rgba(63,81,181,0.18)' : 'rgba(255,255,255,0.04)',
                cursor: 'pointer',
                boxShadow: isExpanded ? `0 8px 18px ${s.color}22` : '0 10px 18px rgba(8,12,28,0.16)',
                transition: 'box-shadow 200ms, background 200ms',
                display: 'flex', flexDirection: 'column', gap: 4,
                position: 'relative',
              }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(t.id); if (isExpanded) setExpandedId(null); }}
                title="Dismiss"
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 18, height: 18, padding: 0,
                  background: 'transparent', border: '1px solid rgba(178,223,219,0.14)',
                  color: '#9aa6bc', fontFamily: 'Consolas, monospace', fontSize: 10,
                  cursor: 'pointer', lineHeight: 1,
                }}
              >×</button>
              <div style={{
                fontFamily: 'Consolas, monospace', color: '#eef3ff', fontSize: 11, fontWeight: 700,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 22,
              }}>{t.name}</div>
              <div style={{ display: 'flex', gap: 8, fontFamily: 'Consolas, monospace', fontSize: 9, color: '#8e9ab4' }}>
                <span>P{t.phaseNum}</span>
                <span style={{ color: a.color, letterSpacing: 2 }}>{a.label}</span>
                <span>{fmtMs(t.elapsedMs)}</span>
              </div>
              <Badge status={t.status} />
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

// ---- space background ----

function SpaceBackground() {
  const particles = useMemo(() => {
    const colors = ['#00ccff', '#ff006e', '#b13aff', '#00ff41', '#ffdd00'];
    return Array.from({ length: 18 }, (_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: colors[i % colors.length],
      size: 2 + Math.random() * 3,
      delay: Math.random() * 10,
      dur: 14 + Math.random() * 18,
      alt: i % 2,
    }));
  }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        background:
          'radial-gradient(ellipse at top left, rgba(63,81,181,0.34) 0%, transparent 56%), ' +
          'radial-gradient(ellipse at bottom right, rgba(178,223,219,0.14) 0%, transparent 56%), ' +
          'linear-gradient(180deg, #080b18 0%, #0c1022 100%)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.35,
        backgroundImage:
          'linear-gradient(to right, #ffffff08 1px, transparent 1px), ' +
          'linear-gradient(to bottom, #ffffff08 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 3px)',
      }}/>
      {particles.map((p, i) => (
        <div
          key={i}
          className="m3-particle"
          style={{
            left: `${p.left}%`, top: `${p.top}%`,
            width: p.size, height: p.size,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animation: `${p.alt ? 'm3-drift2' : 'm3-drift'} ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="m3-vignette"/>
    </div>
  );
}

// ---- root ----

export default function RoadmapBuilder() {
  const { phases, loading, error } = useRoadmap();
  const [dismissed, setDismissed] = useState(() => new Set());
  const [completionCollapsed, setCompletionCollapsed] = useState(true);
  const width = useViewportWidth();
  const stacked = width < 1320;
  const mobile = width < 900;

  const startTask = async (id) => {
    try { await fetch(api(`/api/roadmap/tasks/${id}/start`), { method: 'POST' }); } catch (e) { console.error(e); }
  };
  const stopTask = async (id) => {
    try { await fetch(api(`/api/roadmap/tasks/${id}/stop`), { method: 'POST' }); } catch (e) { console.error(e); }
  };
  const dismiss = (id) => setDismissed((s) => { const n = new Set(s); n.add(id); return n; });

  const counts = useMemo(() => {
    const c = { pending: 0, executing: 0, complete: 0, failed: 0, stopped: 0 };
    for (const p of phases) for (const t of p.tasks) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [phases]);

  const activeByAgent = useMemo(() => buildActiveByAgent(phases), [phases]);
  const genSnap = useAgentRun(activeByAgent.gen?.id);
  const kalSnap = useAgentRun(activeByAgent.kal?.id);
  const psySnap = useAgentRun(activeByAgent.psy?.id);
  const mediaSnap = useAgentRun(activeByAgent.media?.id);

  const roomBoard = useMemo(() => (
    [
      ...AGENT_ORDER.map((id) => {
        const snap =
          id === 'gen' ? genSnap :
          id === 'kal' ? kalSnap :
          id === 'psy' ? psySnap :
          mediaSnap;
        const active = activeByAgent[id];
        return {
          id,
          status: snap?.run?.status || active?.status || 'pending',
          taskName: active?.name || null,
          phaseName: active?.phaseName || null,
          elapsed: snap?.run?.elapsedMs || active?.elapsedMs || 0,
        };
      }),
      {
        id: 'core',
        status: counts.executing > 0 ? 'executing' : 'pending',
        taskName: counts.executing > 0 ? `${counts.executing} active routes` : 'Coordinator idle',
        phaseName: 'MoChatuno Coordinator',
        elapsed: 0,
      },
    ].sort((a, b) => (a.id === 'core' ? -1 : b.id === 'core' ? 1 : 0))
  ), [activeByAgent, counts.executing, genSnap, kalSnap, psySnap, mediaSnap]);

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', height: stacked ? 'auto' : '100vh', boxSizing: 'border-box',
      paddingTop: mobile ? 84 : 56, color: '#fff', fontFamily: 'Consolas, monospace',
      position: 'relative', overflowX: 'hidden', overflowY: stacked ? 'auto' : 'hidden',
    }}>
      <style>{STYLE_SHEET}</style>
      <SpaceBackground />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', height: stacked ? 'auto' : '100%',
        display: 'grid',
        gridTemplateRows: stacked ? 'auto auto auto auto' : `auto minmax(0,1fr) ${completionCollapsed ? 48 : 220}px`,
        gridTemplateColumns: stacked ? '1fr' : 'minmax(0,1.28fr) minmax(420px,0.82fr)',
      }}>

        <div style={{
          gridColumn: stacked ? '1 / span 1' : '1 / span 2',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          padding: mobile ? '12px 14px' : '14px 22px',
          borderTop: '1px solid rgba(178,223,219,0.12)', borderBottom: '1px solid rgba(178,223,219,0.12)',
          background: 'linear-gradient(180deg, rgba(12,16,35,0.82) 0%, rgba(8,11,24,0.76) 100%)',
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{
            color: '#b2dfdb', letterSpacing: 5, fontWeight: 800, fontSize: 14,
          }}>
            ▓▓ M3 · COMMAND CENTER
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 11, color: '#8e9ab4' }}>
            <span>PENDING <span style={{ color: '#aaa' }}>{counts.pending}</span></span>
            <span>EXEC <span style={{ color: STATUS.executing.color }}>{counts.executing}</span></span>
            <span>DONE <span style={{ color: STATUS.complete.color }}>{counts.complete}</span></span>
            <span>FAIL <span style={{ color: STATUS.failed.color }}>{counts.failed}</span></span>
            <span>STOP <span style={{ color: STATUS.stopped.color }}>{counts.stopped}</span></span>
          </div>
          {error && (
            <div style={{
              width: '100%', marginTop: 4, padding: '6px 10px',
              background: 'rgba(255,97,44,0.08)', color: '#ff9c7c', border: '1px solid rgba(255,97,44,0.24)', fontSize: 11,
            }}>API ERROR: {error} — check server on {API_BASE}</div>
          )}
        </div>

        <div style={{
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: stacked ? 'auto minmax(280px, auto)' : 'minmax(0,1fr) minmax(260px, 30vh)',
          gap: 14,
          padding: mobile ? 12 : 16,
        }}>
          <div style={{
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: 'minmax(340px, 1fr) auto',
            gap: 12,
          }}>
            <RoadmapRooms3D rooms={roomBoard} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: mobile ? '1fr' : 'repeat(2, minmax(0,1fr))',
              gap: 10,
            }}>
              {roomBoard.map((room) => {
                const meta = AGENT[room.id] || { color: '#f2c66d', label: 'MCT' };
                return (
                  <div
                    key={room.id}
                  style={{
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: `1px solid ${meta.color}33`,
                      background: 'rgba(255,255,255,0.04)',
                      boxShadow: '0 14px 28px rgba(8,12,28,0.16)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontSize: 11, letterSpacing: 2, color: meta.color, fontWeight: 800 }}>
                        {meta.label} ROOM
                      </div>
                      <Badge status={room.status} />
                    </div>
                    <div style={{ color: '#eef3ff', fontSize: 12, fontWeight: 700, lineHeight: 1.35 }}>
                      {room.taskName || 'Waiting for assignment'}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, color: '#8e9ab4', lineHeight: 1.5 }}>
                      {room.phaseName ? `${room.phaseName} · ` : ''}{room.elapsed ? fmtMs(room.elapsed) : 'idle'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ minHeight: stacked ? 260 : 0, height: stacked ? 'auto' : '100%' }}>
            <MoChatunoChat />
          </div>
        </div>

        <div style={{
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          borderTop: stacked ? '1px solid rgba(178,223,219,0.12)' : 'none',
          borderLeft: stacked ? 'none' : '1px solid rgba(178,223,219,0.12)',
          background: 'linear-gradient(180deg, rgba(10,14,30,0.88), rgba(7,10,22,0.92))',
          backdropFilter: 'blur(4px)',
        }}>
          {loading && (
            <div style={{ padding: 16, color: '#b2dfdb', letterSpacing: 3, fontSize: 11 }}>
              ▓▓▓ LOADING...
            </div>
          )}
          {!loading && phases.length === 0 && !error && (
            <div style={{ padding: 16, color: '#8e9ab4', fontSize: 11 }}>
              No roadmap data at {API_BASE}/api/roadmap
            </div>
          )}
          {phases.length > 0 && (
            <RoadmapPane phases={phases} onStart={startTask} onStop={stopTask} compact={mobile} />
          )}
        </div>

        <div style={{ gridColumn: stacked ? '1 / span 1' : '1 / span 2', minHeight: 0 }}>
          <CompletionStrip
            phases={phases}
            dismissed={dismissed}
            onDismiss={dismiss}
            collapsed={completionCollapsed}
            onToggle={() => setCompletionCollapsed((v) => !v)}
          />
        </div>

      </div>
    </div>
  );
}
