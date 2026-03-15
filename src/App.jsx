import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import OrbNode from './components/OrbNode';
import SystemNode from './components/SystemNode';
import AnimatedEdge from './components/AnimatedEdge';

const nodeTypes = { orb: OrbNode, system: SystemNode };
const edgeTypes = { animated: AnimatedEdge };

// Layout: orb top-center, systems branching down like a neural tree
const initialNodes = [
  {
    id: 'orb',
    type: 'orb',
    position: { x: 380, y: 40 },
    data: { status: 'Online' },
    draggable: true,
  },
  {
    id: 'trade',
    type: 'system',
    position: { x: 120, y: 240 },
    data: { label: 'Trade', icon: '📊', subtitle: '7 posizioni', active: true, outputs: ['P&L'] },
  },
  {
    id: 'terminal',
    type: 'system',
    position: { x: 370, y: 240 },
    data: { label: 'Terminale', icon: '⌨️', subtitle: 'Chat diretta', active: true },
  },
  {
    id: 'memoria',
    type: 'system',
    position: { x: 620, y: 240 },
    data: { label: 'Memoria', icon: '🧠', subtitle: '4443 embeddings', active: true, outputs: ['Vector'] },
  },
  {
    id: 'sistemi',
    type: 'system',
    position: { x: 60, y: 440 },
    data: { label: 'Sistemi', icon: '⚡', subtitle: 'Pi · Mac · Display', active: true },
  },
  {
    id: 'agenzia',
    type: 'system',
    position: { x: 280, y: 440 },
    data: { label: 'Agenzia', icon: '🏢', subtitle: 'Staes · Homefloo', active: true },
  },
  {
    id: 'blog',
    type: 'system',
    position: { x: 500, y: 440 },
    data: { label: 'Blog', icon: '✍️', subtitle: '11 post', active: true },
  },
  {
    id: 'display',
    type: 'system',
    position: { x: 720, y: 440 },
    data: { label: 'Display', icon: '📱', subtitle: 'Touch-to-talk', active: true },
  },
];

const initialEdges = [
  { id: 'o-trade', source: 'orb', target: 'trade', sourceHandle: 'left', targetHandle: 'top', type: 'animated', data: { label: 'Market', active: false } },
  { id: 'o-terminal', source: 'orb', target: 'terminal', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { label: 'Chat', active: false } },
  { id: 'o-memoria', source: 'orb', target: 'memoria', sourceHandle: 'right', targetHandle: 'top', type: 'animated', data: { label: 'Memory', active: false } },
  { id: 'trade-sistemi', source: 'trade', target: 'sistemi', sourceHandle: 's-bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
  { id: 'terminal-agenzia', source: 'terminal', target: 'agenzia', sourceHandle: 's-bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
  { id: 'terminal-blog', source: 'terminal', target: 'blog', sourceHandle: 's-bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
  { id: 'memoria-display', source: 'memoria', target: 'display', sourceHandle: 's-bottom', targetHandle: 'top', type: 'animated', data: { label: 'Voice', active: false } },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Pulse random synapses
  useEffect(() => {
    const pulse = setInterval(() => {
      const idx = Math.floor(Math.random() * initialEdges.length);
      setEdges(eds => eds.map((e, i) => ({
        ...e,
        data: { ...e.data, active: i === idx },
      })));
      setTimeout(() => {
        setEdges(eds => eds.map(e => ({ ...e, data: { ...e.data, active: false } })));
      }, 1200);
    }, 2500);
    return () => clearInterval(pulse);
  }, [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes edgeFlow {
          to { stroke-dashoffset: -36; }
        }
      `}</style>

      {/* Top toolbar — n8n style */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8, zIndex: 10, alignItems: 'center',
      }}>
        <button style={{
          background: 'var(--accent)', color: '#0b0d0f', border: 'none',
          padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>Active</button>
        <button style={{
          background: 'var(--surface)', color: 'var(--text-bright)', border: '1px solid var(--border)',
          padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>Share</button>
        <button style={{
          background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--border)',
          padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>Save</button>
        {['↻', '•••'].map((icon, i) => (
          <button key={i} style={{
            background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)',
            width: 36, height: 36, borderRadius: 10, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{icon}</button>
        ))}
      </div>

      {/* Bottom bar — status */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 48, background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        gap: 16, zIndex: 10,
      }}>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
          {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Latest logs from AlgerON
        </span>
        <div style={{ flex: 1 }} />
        <div style={{
          height: 24, width: 200,
          background: 'linear-gradient(90deg, #166534 0%, #4ade80 100%)',
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 8px',
        }}>
          <span style={{ fontSize: 10, color: '#0b0d0f', fontWeight: 600 }}>
            Online
          </span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.4}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'animated' }}
      />
    </div>
  );
}

export default App;
