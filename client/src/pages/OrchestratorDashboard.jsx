import React, { useState, useEffect, useRef, useCallback } from 'react';

const API = 'http://localhost:3001/api/orchestrator';

const AGENT_META = {
  mochatuno: { label: 'MOCHATUNO', color: '#00ffff', role: 'Coordinator' },
  kal:       { label: 'KAL',       color: '#ff6600', role: 'Strategy / Backend' },
  gen:       { label: 'GEN',       color: '#00ff88', role: 'Content / Frontend' },
  psy:       { label: 'PSY',       color: '#cc44ff', role: 'Analysis / Design' },
  codex:     { label: 'CODEX QA',  color: '#ffff00', role: 'Quality Verification' },
};

const STATUS_COLOR = {
  routing:   '#ffaa00',
  executing: '#ff6600',
  qa:        '#ffff00',
  complete:  '#00ff88',
  failed:    '#ff4444',
  running:   '#ff6600',
  idle:      '#444',
};

// ── Utility ───────────────────────────────────────────────────────────────────
function fmt(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
function fmtCost(usd) {
  if (!usd) return '$0.000000';
  return `$${usd.toFixed(6)}`;
}
function ago(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function AgentCard({ agentId, result }) {
  const meta = AGENT_META[agentId] || { label: agentId.toUpperCase(), color: '#888', role: '' };
  const status = result?.status || 'idle';
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      border: `1px solid ${meta.color}44`,
      borderLeft: `3px solid ${meta.color}`,
      borderRadius: 6,
      padding: '10px 12px',
      background: 'rgba(0,0,0,0.4)',
      flex: '1 1 calc(33% - 8px)',
      minWidth: 200,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: meta.color, fontWeight: 700, fontSize: 13 }}>{meta.label}</span>
        <span style={{
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 3,
          background: (STATUS_COLOR[status] || '#555') + '33',
          color: STATUS_COLOR[status] || '#888',
          border: `1px solid ${STATUS_COLOR[status] || '#555'}44`,
        }}>
          {status.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{meta.role}</div>

      {result && (
        <>
          <div style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>
            {result.tokens ? `${result.tokens} tokens` : ''}{result.durationMs ? ` · ${fmt(result.durationMs)}` : ''}
          </div>
          {result.text && (
            <>
              <div
                style={{
                  fontSize: 11,
                  color: '#ccc',
                  maxHeight: expanded ? 400 : 60,
                  overflow: 'hidden',
                  transition: 'max-height 0.2s',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.5,
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '6px 8px',
                  borderRadius: 4,
                }}
                onClick={() => setExpanded((x) => !x)}
                title="Click to expand"
              >
                {result.text}
              </div>
              <button
                onClick={() => setExpanded((x) => !x)}
                style={{ fontSize: 9, color: '#555', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}
              >
                {expanded ? '▲ collapse' : '▼ expand'}
              </button>
            </>
          )}
        </>
      )}

      {status === 'running' && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: meta.color,
              animation: `pulse 1.2s ${i * 0.4}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

function QAPanel({ qaResult }) {
  if (!qaResult) return null;
  const score = qaResult.score || 0;
  const pass = qaResult.status === 'PASS';

  return (
    <div style={{
      border: `1px solid ${pass ? '#ffff0044' : '#ff444444'}`,
      borderLeft: `3px solid ${pass ? '#ffff00' : '#ff4444'}`,
      borderRadius: 6,
      padding: '10px 14px',
      background: 'rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#ffff00', fontWeight: 700, fontSize: 13 }}>CODEX QA</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            width: 120, height: 8, background: '#111', borderRadius: 4, overflow: 'hidden',
          }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: score >= 70 ? '#00ff88' : '#ff4444',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <span style={{ color: pass ? '#00ff88' : '#ff4444', fontWeight: 700, fontSize: 13 }}>
            {score}/100 · {qaResult.status}
          </span>
        </div>
      </div>

      {qaResult.summary && (
        <div style={{ fontSize: 12, color: '#ccc', marginBottom: 6 }}>{qaResult.summary}</div>
      )}

      {qaResult.issues && qaResult.issues.length > 0 && (
        <ul style={{ margin: 0, padding: '0 0 0 14px', fontSize: 11, color: '#ff9966' }}>
          {qaResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
        </ul>
      )}
    </div>
  );
}

function TaskHistoryRow({ session, onSelect, selected }) {
  const meta = AGENT_META;
  return (
    <div
      onClick={() => onSelect(session.id)}
      style={{
        padding: '8px 10px',
        borderBottom: '1px solid #111',
        cursor: 'pointer',
        background: selected ? 'rgba(0,255,255,0.06)' : 'transparent',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 8,
        alignItems: 'center',
        fontSize: 11,
      }}
    >
      <div style={{ color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.userMessage}
      </div>
      <div style={{ color: STATUS_COLOR[session.status] || '#888', whiteSpace: 'nowrap' }}>
        {session.status.toUpperCase()}
      </div>
      {session.qaScore != null && (
        <div style={{ color: session.qaScore >= 70 ? '#00ff88' : '#ff4444', whiteSpace: 'nowrap' }}>
          QA {session.qaScore}
        </div>
      )}
      <div style={{ color: '#555', whiteSpace: 'nowrap' }}>{ago(session.createdAt)}</div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function OrchestratorDashboard() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [tab, setTab] = useState('chat'); // 'chat' | 'history' | 'status'
  const inputRef = useRef();
  const pollRef = useRef();

  const fetchSessions = useCallback(async () => {
    try {
      const r = await fetch(`${API}/sessions?limit=30`);
      if (!r.ok) return;
      const data = await r.json();
      setSessions(data.sessions || []);
      setStats(data.stats || null);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchSessions();
    pollRef.current = setInterval(fetchSessions, 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchSessions]);

  const submit = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setLoading(true);
    setError(null);
    setActiveSession(null);
    setSuggestions([]);

    try {
      const r = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Request failed');

      setActiveSession(data);
      if (data.routing?.suggestions) setSuggestions(data.routing.suggestions);
      setInput('');
      fetchSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id) => {
    try {
      const r = await fetch(`${API}/sessions/${id}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setActiveSession(data);
      if (data.routing?.suggestions) setSuggestions(data.routing.suggestions);
      setTab('chat');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit();
  };

  const queuedSessions = sessions.filter((s) => ['routing', 'executing', 'qa'].includes(s.status));
  const completedSessions = sessions.filter((s) => ['complete', 'failed'].includes(s.status));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: 'monospace',
      fontSize: 13,
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#111}
        ::-webkit-scrollbar-thumb{background:#333;border-radius:3px}
      `}</style>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: '1px solid #1a1a2e', background: '#06060d',
      }}>
        <div>
          <span style={{ color: '#00ffff', fontWeight: 700, fontSize: 15, letterSpacing: 2 }}>MASTER ORCHESTRATOR</span>
          <span style={{ color: '#444', fontSize: 11, marginLeft: 12 }}>MOCHATUNO · KAL · GEN · PSY · CODEX QA</span>
        </div>

        {stats && (
          <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
            <span style={{ color: '#888' }}>Total: <b style={{ color: '#ccc' }}>{stats.total}</b></span>
            <span style={{ color: '#00ff88' }}>Done: <b>{stats.complete}</b></span>
            <span style={{ color: '#ff4444' }}>Failed: <b>{stats.failed}</b></span>
            <span style={{ color: '#ffaa00' }}>Active: <b>{stats.running}</b></span>
            <span style={{ color: '#555' }}>Tokens: <b style={{ color: '#777' }}>{stats.totalTokens.toLocaleString()}</b></span>
            <span style={{ color: '#555' }}>Cost: <b style={{ color: '#777' }}>{fmtCost(stats.totalCostUsd)}</b></span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4 }}>
          {['chat', 'history', 'status'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '4px 10px', fontSize: 11, border: '1px solid',
              borderColor: tab === t ? '#00ffff' : '#333',
              background: tab === t ? 'rgba(0,255,255,0.1)' : 'transparent',
              color: tab === t ? '#00ffff' : '#666',
              borderRadius: 4, cursor: 'pointer',
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar: queue ── */}
        <div style={{
          width: 240, borderRight: '1px solid #1a1a2e', overflow: 'auto',
          background: '#07070e', flexShrink: 0,
        }}>
          <div style={{ padding: '8px 10px', fontSize: 10, color: '#444', borderBottom: '1px solid #111' }}>
            QUEUE ({queuedSessions.length})
          </div>
          {queuedSessions.map((s) => (
            <div key={s.id} style={{
              padding: '6px 10px', borderBottom: '1px solid #0f0f1a',
              fontSize: 10, cursor: 'pointer',
            }} onClick={() => loadSession(s.id)}>
              <div style={{ color: STATUS_COLOR[s.status], marginBottom: 2 }}>{s.status.toUpperCase()}</div>
              <div style={{ color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.userMessage}
              </div>
            </div>
          ))}

          <div style={{ padding: '8px 10px', fontSize: 10, color: '#444', borderBottom: '1px solid #111', marginTop: 8 }}>
            COMPLETED ({completedSessions.length})
          </div>
          {completedSessions.map((s) => (
            <div key={s.id} style={{
              padding: '6px 10px', borderBottom: '1px solid #0f0f1a',
              fontSize: 10, cursor: 'pointer',
              background: activeSession?.id === s.id ? 'rgba(0,255,255,0.05)' : 'transparent',
            }} onClick={() => loadSession(s.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: STATUS_COLOR[s.status] }}>{s.status.toUpperCase()}</span>
                {s.qaScore != null && (
                  <span style={{ color: s.qaScore >= 70 ? '#00ff88' : '#ff4444' }}>{s.qaScore}</span>
                )}
              </div>
              <div style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {s.userMessage}
              </div>
              <div style={{ color: '#333', marginTop: 2 }}>{ago(s.createdAt)}</div>
            </div>
          ))}
        </div>

        {/* ── Main area ── */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

          {tab === 'chat' && (
            <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Routing plan */}
              {activeSession?.routing && (
                <div style={{
                  border: '1px solid #00ffff33', borderRadius: 6, padding: '10px 14px',
                  background: 'rgba(0,255,255,0.04)',
                }}>
                  <div style={{ color: '#00ffff', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
                    MOCHATUNO ROUTING
                  </div>
                  <div style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>
                    {activeSession.routing.strategy}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {activeSession.routing.agents.map((a) => {
                      const m = AGENT_META[a] || { label: a.toUpperCase(), color: '#888' };
                      return (
                        <span key={a} style={{
                          padding: '2px 8px', borderRadius: 3, fontSize: 11,
                          background: m.color + '22', border: `1px solid ${m.color}44`, color: m.color,
                        }}>{m.label}</span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Agent results grid */}
              {activeSession?.agentResults && Object.keys(activeSession.agentResults).length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>AGENT OUTPUTS</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(activeSession.agentResults).map(([id, result]) => (
                      <AgentCard key={id} agentId={id} result={result} />
                    ))}
                  </div>
                </div>
              )}

              {/* QA */}
              {activeSession?.qaResult && <QAPanel qaResult={activeSession.qaResult} />}

              {/* Cost/duration footer */}
              {activeSession && (
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#444', padding: '4px 0' }}>
                  {activeSession.totalTokens > 0 && (
                    <span>Tokens: <b style={{ color: '#666' }}>{activeSession.totalTokens.toLocaleString()}</b></span>
                  )}
                  {activeSession.costUsd > 0 && (
                    <span>Cost: <b style={{ color: '#666' }}>{fmtCost(activeSession.costUsd)}</b></span>
                  )}
                  {activeSession.durationMs > 0 && (
                    <span>Duration: <b style={{ color: '#666' }}>{fmt(activeSession.durationMs)}</b></span>
                  )}
                  <span style={{ color: STATUS_COLOR[activeSession.status] || '#666' }}>
                    {activeSession.status.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>SUGGESTED NEXT TASKS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => setInput(s)} style={{
                        fontSize: 11, padding: '4px 10px',
                        background: 'rgba(0,255,136,0.07)', border: '1px solid #00ff8844',
                        color: '#00ff88', borderRadius: 4, cursor: 'pointer',
                      }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div style={{ color: '#ff4444', fontSize: 12, padding: '8px 10px', background: '#ff000011', borderRadius: 4 }}>
                  ERROR: {error}
                </div>
              )}

              {!activeSession && !loading && (
                <div style={{ color: '#333', textAlign: 'center', marginTop: 40 }}>
                  Submit a request to activate the orchestrator
                </div>
              )}

              {loading && (
                <div style={{ color: '#00ffff', textAlign: 'center', marginTop: 40 }}>
                  <div style={{ marginBottom: 12 }}>Running pipeline...</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {Object.entries(AGENT_META).map(([id, m]) => (
                      <div key={id} style={{
                        padding: '4px 8px', border: `1px solid ${m.color}44`,
                        borderRadius: 4, fontSize: 10, color: m.color,
                        animation: 'pulse 1.5s infinite',
                      }}>{m.label}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'history' && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: 8, padding: '8px 10px',
                fontSize: 10, color: '#444', borderBottom: '1px solid #1a1a2e',
              }}>
                <span>MESSAGE</span><span>STATUS</span><span>QA</span><span>TIME</span>
              </div>
              {sessions.map((s) => (
                <TaskHistoryRow key={s.id} session={s} onSelect={loadSession}
                  selected={activeSession?.id === s.id} />
              ))}
              {sessions.length === 0 && (
                <div style={{ color: '#333', textAlign: 'center', padding: 40 }}>No sessions yet</div>
              )}
            </div>
          )}

          {tab === 'status' && (
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>AGENT REGISTRY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(AGENT_META).map(([id, m]) => (
                  <div key={id} style={{
                    border: `1px solid ${m.color}33`, borderLeft: `3px solid ${m.color}`,
                    borderRadius: 6, padding: '10px 14px', minWidth: 180,
                    background: 'rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ color: m.color, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{m.role}</div>
                  </div>
                ))}
              </div>

              {stats && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>SESSION STATS</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      ['Total Sessions', stats.total, '#ccc'],
                      ['Completed', stats.complete, '#00ff88'],
                      ['Failed', stats.failed, '#ff4444'],
                      ['Running', stats.running, '#ffaa00'],
                      ['Total Tokens', stats.totalTokens.toLocaleString(), '#777'],
                      ['Est. Cost', fmtCost(stats.totalCostUsd), '#777'],
                    ].map(([label, val, color]) => (
                      <div key={label} style={{
                        border: '1px solid #1a1a2e', borderRadius: 6, padding: '10px 14px',
                        background: 'rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={{
        borderTop: '1px solid #1a1a2e', padding: '12px 16px',
        background: '#06060d', display: 'flex', gap: 10,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask MOCHATUNO anything... Ctrl+Enter to send"
          disabled={loading}
          rows={2}
          style={{
            flex: 1, background: '#0d0d1e', border: '1px solid #1a1a2e', color: '#e0e0e0',
            borderRadius: 6, padding: '8px 12px', fontSize: 13, fontFamily: 'monospace',
            resize: 'none', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={submit}
            disabled={loading || !input.trim()}
            style={{
              padding: '8px 20px', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? '#333' : 'rgba(0,255,255,0.15)',
              border: `1px solid ${loading ? '#333' : '#00ffff'}`,
              color: loading ? '#555' : '#00ffff',
              fontWeight: 700, fontSize: 13,
            }}
          >
            {loading ? '...' : 'RUN'}
          </button>
          <button
            onClick={() => { setInput(''); setActiveSession(null); setError(null); setSuggestions([]); }}
            style={{
              padding: '4px 10px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
              background: 'transparent', border: '1px solid #333', color: '#555',
            }}
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
}
