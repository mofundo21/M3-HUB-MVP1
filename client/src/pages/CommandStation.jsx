import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import GenLab from '../components/scenes/GenLab';
import KalCommand from '../components/scenes/KalCommand';
import PsyStudio from '../components/scenes/PsyStudio';
import HermesCoordinator from '../components/HermesCoordinator';
import CommandAgent from '../components/CommandAgent';
import Dashboard from '../components/Dashboard';
import ChatInterface from '../components/ChatInterface';
import { useColyseus } from '../hooks/useColyseus';

// Isometric camera manager component
function IsometricCamera() {
  const { camera } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    // Isometric angle: 45 degrees, 30 degrees elevation, ~35m distance
    const distance = 35;
    const angle = Math.PI / 4; // 45 degrees
    const elevation = Math.PI / 6; // 30 degrees

    camera.position.x = distance * Math.cos(angle) * Math.cos(elevation);
    camera.position.y = distance * Math.sin(elevation);
    camera.position.z = distance * Math.sin(angle) * Math.cos(elevation);
    camera.lookAt(0, 5, 0);
    camera.fov = 50;
    camera.updateProjectionMatrix();
  }, [camera]);

  return <OrbitControls ref={controlsRef} autoRotate={false} minZoom={0.5} maxZoom={3} />;
}

// Background and lighting
function SceneEnvironment() {
  return (
    <>
      {/* Dark cyberpunk background */}
      <color attach="background" args={['#0a0a0f']} />

      {/* Ambient light - dark blue undertone */}
      <ambientLight intensity={0.4} color="#0a0a2e" />

      {/* Main cyan light */}
      <pointLight position={[30, 20, 30]} intensity={1.5} color="#00ffff" distance={100} />

      {/* Green accent */}
      <pointLight position={[-20, 15, -20]} intensity={1} color="#00ff00" distance={80} />

      {/* Magenta accent */}
      <pointLight position={[20, 15, -20]} intensity={1} color="#ff00ff" distance={80} />

      {/* Purple accent */}
      <pointLight position={[-20, 15, 20]} intensity={1} color="#8800ff" distance={80} />

      {/* Warm fill light */}
      <pointLight position={[0, 25, 0]} intensity={0.5} color="#ffff00" distance={100} />
    </>
  );
}

// Ground plane with grid
function Ground() {
  return (
    <group>
      {/* Dark ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#0d0d2e"
          metalness={0.4}
          roughness={0.8}
          emissive="#050510"
        />
      </mesh>

      {/* Grid helper */}
      <gridHelper
        args={[100, 50]}
        colorCenterLine="#1a3a4a"
        colorGrid="#0d2d3a"
      />
    </group>
  );
}

// Main command station scene
export default function CommandStation() {
  const [agents, setAgents] = useState({
    gen: { id: 'gen', position: [0, 1, 0], room: 'rest', status: 'idle', currentTask: null, progress: 0 },
    kal: { id: 'kal', position: [0, 1, 0], room: 'rest', status: 'idle', currentTask: null, progress: 0 },
    psy: { id: 'psy', position: [0, 1, 0], room: 'rest', status: 'idle', currentTask: null, progress: 0 },
  });
  const [tasks, setTasks] = useState([]);
  const [taskDetails, setTaskDetails] = useState({});
  const [showTaskPanel, setShowTaskPanel] = useState(false);

  // Connect to Colyseus TaskRoom
  const { room: taskRoom, connected } = useColyseus('task-coordinator', {});

  // Poll API for task updates (real-time output)
  useEffect(() => {
    const pollTasks = setInterval(async () => {
      try {
        const res = await fetch('http://localhost:3001/api/tasks');
        if (res.ok) {
          const data = await res.json();
          const taskList = data.tasks || [];
          setTasks(taskList);

          // Fetch detailed output for each task
          taskList.forEach(async (task) => {
            try {
              const detailRes = await fetch(`http://localhost:3001/api/tasks/${task.id}/status`);
              if (detailRes.ok) {
                const detail = await detailRes.json();
                setTaskDetails(prev => ({
                  ...prev,
                  [task.id]: detail,
                }));
              }
            } catch (e) {
              // Silent
            }
          });
        }
      } catch (e) {
        // Silent
      }
    }, 300); // Poll every 300ms for responsive UI

    return () => clearInterval(pollTasks);
  }, []);

  // Sync room state to local state
  useEffect(() => {
    if (!taskRoom) return;

    // Handle room state changes
    const handleStateChange = () => {
      // Update agents from room state
      const newAgents = { ...agents };
      if (taskRoom.state.agents) {
        taskRoom.state.agents.forEach((agentState, agentId) => {
          if (!agentState) return;
          const pos = agentState.position;
          newAgents[agentId] = {
            id: agentId,
            position: pos ? [pos.x ?? 0, pos.y ?? 0, pos.z ?? 0] : [0, 0, 0],
            room: agentState.currentRoom,
            status: agentState.status,
            targetRoom: agentState.currentRoom,
            currentTask: agentState.currentTask,
          };
        });
      }
      setAgents(newAgents);

      // Update tasks from room state
      const newTasks = [];
      if (taskRoom.state.tasks) {
        taskRoom.state.tasks.forEach((task, taskId) => {
          newTasks.push({
            id: taskId,
            status: task.status,
            progress: task.progress,
            output: task.output,
            assignedAgent: task.assignedAgent,
          });
        });
      }
      setTasks(newTasks);
    };

    taskRoom.onStateChange(handleStateChange);
    taskRoom.onMessage('status', (data) => {
      console.log('Task status update:', data);
    });

    return () => {
      // Cleanup listeners
    };
  }, [taskRoom]);

  // Get active task for output display
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskUpdates, setTaskUpdates] = useState({});

  // Use detailed task info (with output) if available
  const activeTaskId = selectedTaskId || (tasks.length > 0 ? tasks[tasks.length - 1].id : null);
  const activeTask = activeTaskId ? (taskDetails[activeTaskId] || tasks.find(t => t.id === activeTaskId)) : null;

  // Subscribe to TaskRoom broadcasts for real-time updates
  useEffect(() => {
    if (!taskRoom) return;

    const handleOutputLine = (data) => {
      setTaskUpdates(prev => ({
        ...prev,
        [data.taskId]: {
          ...(prev[data.taskId] || {}),
          lastOutput: data.line,
          progress: data.progress,
        }
      }));
    };

    const handleTaskStarted = (data) => {
      setTaskUpdates(prev => ({
        ...prev,
        [data.taskId]: { status: 'running' }
      }));
    };

    const handleTaskComplete = (data) => {
      setTaskUpdates(prev => ({
        ...prev,
        [data.taskId]: { status: 'completed', progress: 100 }
      }));
    };

    const handleTaskError = (data) => {
      setTaskUpdates(prev => ({
        ...prev,
        [data.taskId]: { status: 'failed', error: data.error }
      }));
    };

    const handleAgentStatusUpdate = (data) => {
      setAgents(prev => ({
        ...prev,
        [data.agentId]: {
          ...prev[data.agentId],
          status: data.status,
          currentTask: data.taskName || null,
          progress: data.progress || 0,
        }
      }));
      console.log(`🔄 Agent ${data.agentId}: ${data.status}${data.taskName ? ` → ${data.taskName}` : ''}`);
    };

    // Register broadcast listeners
    taskRoom.onMessage('outputLine', handleOutputLine);
    taskRoom.onMessage('taskStarted', handleTaskStarted);
    taskRoom.onMessage('taskComplete', handleTaskComplete);
    taskRoom.onMessage('taskError', handleTaskError);
    taskRoom.onMessage('agentStatusUpdate', handleAgentStatusUpdate);

    return () => {
      // Cleanup listeners
      taskRoom.removeAllListeners('outputLine');
      taskRoom.removeAllListeners('taskStarted');
      taskRoom.removeAllListeners('taskComplete');
      taskRoom.removeAllListeners('taskError');
      taskRoom.removeAllListeners('agentStatusUpdate');
    };
  }, [taskRoom]);

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#0a0a0f', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '2px solid #00ffff',
        background: 'rgba(0,40,80,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#00ffff',
        fontFamily: 'Courier New, monospace',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '16px' }}>▶ M3 COMMAND STATION v2 - CHATBOT-FIRST</h1>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {connected ? '🟢 ONLINE' : '🔴 OFFLINE'} | Tasks: {tasks.length}
        </div>
      </div>

      {/* MAIN CONTENT - Chat Left, Agents Right */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: '12px', padding: '12px', background: '#0a0a0f' }}>

        {/* LEFT: CHAT INTERFACE (60%) */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <ChatInterface
            taskRoom={taskRoom}
            connected={connected}
            onTaskSubmit={(task) => {
              setSelectedTaskId(task?.id);
            }}
          />
        </div>

        {/* RIGHT: AGENTS + EXECUTION (40%) */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>

          {/* AGENT STATUS CARDS */}
          <div style={{
            background: 'rgba(0,20,40,0.5)',
            border: '1px solid #003333',
            borderRadius: '8px',
            padding: '12px',
            flex: 0,
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#00ffff',
              marginBottom: '12px',
              fontFamily: 'Courier New, monospace',
            }}>
              🤖 AGENTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.values(agents).map(agent => {
                const agentColor = agent.id === 'gen' ? '#00ff00' : agent.id === 'kal' ? '#ff00ff' : '#8800ff';
                const isWorking = agent.status === 'working';
                return (
                  <div key={agent.id} style={{
                    padding: '10px',
                    background: `${agentColor}22`,
                    border: `1px solid ${agentColor}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'Courier New, monospace',
                    color: '#ffffff',
                  }}>
                    <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {agent.id === 'gen' ? '🟢 GEN' : agent.id === 'kal' ? '🟣 KAL' : '🟣 PSY'}
                    </div>
                    <div style={{ opacity: 0.8, fontSize: '10px', marginTop: '4px' }}>
                      Status: <span style={{
                        color: isWorking ? '#ffaa00' : '#00ff00',
                      }}>
                        {isWorking ? 'WORKING' : 'IDLE'}
                      </span>
                    </div>
                    {agent.taskName && (
                      <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '4px', color: agentColor }}>
                        → {agent.taskName}
                      </div>
                    )}
                    {isWorking && (
                      <div style={{ marginTop: '6px', height: '3px', background: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          background: agentColor,
                          width: `${Math.min(99, agent.progress || 0)}%`,
                          transition: 'width 0.2s',
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXECUTION OUTPUT */}
          <div style={{
            flex: 1,
            background: 'rgba(0,20,40,0.5)',
            border: '1px solid #003333',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#00ffff',
              marginBottom: '8px',
              fontFamily: 'Courier New, monospace',
            }}>
              📊 OUTPUT
            </div>
            <div style={{
              flex: 1,
              overflow: 'auto',
              background: 'rgba(0,10,20,0.8)',
              border: '1px solid #001111',
              borderRadius: '4px',
              padding: '8px 10px',
              fontSize: '10px',
              fontFamily: 'Courier New, monospace',
              color: '#00ff00',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}>
              {activeTask ? (
                <>
                  <div style={{ opacity: 0.6, marginBottom: '8px' }}>
                    $ {activeTask.command || activeTask.id.substring(0, 20)}
                  </div>
                  {(activeTask.output || []).length > 0 ? (
                    activeTask.output.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))
                  ) : (
                    <div style={{ opacity: 0.4 }}>
                      {activeTask.status === 'running' ? '▌ executing...' : '(no output)'}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ opacity: 0.4 }}>No task selected</div>
              )}
            </div>

            {/* Progress Bar */}
            {activeTask && activeTask.status === 'running' && (
              <div style={{
                marginTop: '8px',
                height: '6px',
                background: 'rgba(0,255,255,0.1)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: '#00ffff',
                  width: `${(activeTask.progress || 0)}%`,
                  transition: 'width 0.3s ease',
                }}
                />
              </div>
            )}

            {/* Task Status */}
            {activeTask && (
              <div style={{
                marginTop: '8px',
                fontSize: '10px',
                fontFamily: 'Courier New, monospace',
                color: activeTask.status === 'completed' ? '#00ff00' : activeTask.status === 'running' ? '#ffaa00' : '#888',
              }}>
                Status: {activeTask.status?.toUpperCase()} | Progress: {activeTask.progress || 0}%
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
