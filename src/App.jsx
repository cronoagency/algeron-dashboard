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
import { BackgroundBeams } from './components/BackgroundBeams';

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
    <div className="w-screen h-screen relative bg-[#0a0a0a]">
      <style>{`@keyframes edgeFlow { to { stroke-dashoffset: -36; } }`}</style>

      {/* Animated background beams */}
      <BackgroundBeams />

      {/* Top toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 items-center">
        <button className="bg-emerald-400 text-[#0a0a0a] px-5 py-2 rounded-full text-[13px] font-semibold hover:bg-emerald-300 transition-colors">
          Active
        </button>
        <button className="bg-[#161a1e] text-zinc-300 border border-white/[0.06] px-5 py-2 rounded-full text-[13px] font-medium hover:border-white/[0.12] transition-colors">
          Share
        </button>
        <button className="bg-[#161a1e] text-emerald-400 border border-white/[0.06] px-5 py-2 rounded-full text-[13px] font-medium hover:border-emerald-400/20 transition-colors">
          Save
        </button>
        {['↻', '⋯'].map((icon, i) => (
          <button key={i} className="bg-[#161a1e] text-zinc-400 border border-white/[0.06] w-9 h-9 rounded-lg text-sm flex items-center justify-center hover:border-white/[0.12] transition-colors">
            {icon}
          </button>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#111417] border-t border-white/[0.06] flex items-center px-5 gap-4 z-10">
        <span className="text-xs text-emerald-400 font-semibold">
          {new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-xs text-zinc-600">Latest logs from AlgerON</span>
        <div className="flex-1" />
        <div className="h-6 w-48 bg-gradient-to-r from-emerald-900 to-emerald-400 rounded-md flex items-center justify-end px-2">
          <span className="text-[10px] text-[#0a0a0a] font-semibold">Online</span>
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
