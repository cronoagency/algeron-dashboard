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

const nodeTypes = {
  orb: OrbNode,
  system: SystemNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

// Initial node layout — orb center, systems around
const initialNodes = [
  {
    id: 'orb',
    type: 'orb',
    position: { x: 400, y: 280 },
    data: { status: 'online', color: [90, 154, 130] },
    draggable: false,
  },
  {
    id: 'terminal',
    type: 'system',
    position: { x: 100, y: 80 },
    data: {
      label: 'TERMINALE',
      icon: '⌨',
      preview: 'Chat diretta',
      online: true,
    },
  },
  {
    id: 'trade',
    type: 'system',
    position: { x: 650, y: 60 },
    data: {
      label: 'TRADE',
      icon: '📊',
      preview: '7 posizioni attive',
      online: true,
    },
  },
  {
    id: 'memoria',
    type: 'system',
    position: { x: 720, y: 300 },
    data: {
      label: 'MEMORIA',
      icon: '🧠',
      preview: '4443 embeddings',
      online: true,
    },
  },
  {
    id: 'sistemi',
    type: 'system',
    position: { x: 80, y: 350 },
    data: {
      label: 'SISTEMI',
      icon: '⚡',
      preview: 'Pi + Mac + Display',
      online: true,
    },
  },
  {
    id: 'agenzia',
    type: 'system',
    position: { x: 650, y: 520 },
    data: {
      label: 'AGENZIA',
      icon: '🏢',
      preview: 'Staes · Homefloo',
      online: true,
    },
  },
  {
    id: 'blog',
    type: 'system',
    position: { x: 100, y: 550 },
    data: {
      label: 'BLOG',
      icon: '✍',
      preview: '11 post · algeron.ai',
      online: true,
    },
  },
  {
    id: 'display',
    type: 'system',
    position: { x: 380, y: 550 },
    data: {
      label: 'DISPLAY',
      icon: '📱',
      preview: 'Touch-to-talk',
      online: true,
    },
  },
];

const initialEdges = [
  { id: 'orb-terminal', source: 'orb', target: 'terminal', sourceHandle: 'left', targetHandle: 'bottom', type: 'animated', data: { active: false } },
  { id: 'orb-trade', source: 'orb', target: 'trade', sourceHandle: 'right', targetHandle: 'bottom', type: 'animated', data: { active: false } },
  { id: 'orb-memoria', source: 'orb', target: 'memoria', sourceHandle: 'right', targetHandle: 'left', type: 'animated', data: { active: false } },
  { id: 'orb-sistemi', source: 'orb', target: 'sistemi', sourceHandle: 'left', targetHandle: 'right', type: 'animated', data: { active: false } },
  { id: 'orb-agenzia', source: 'orb', target: 'agenzia', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
  { id: 'orb-blog', source: 'orb', target: 'blog', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
  { id: 'orb-display', source: 'orb', target: 'display', sourceHandle: 'bottom', targetHandle: 'top', type: 'animated', data: { active: false } },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Randomly pulse synapses to simulate activity
  useEffect(() => {
    const interval = setInterval(() => {
      setEdges(eds => {
        const idx = Math.floor(Math.random() * eds.length);
        return eds.map((e, i) => ({
          ...e,
          data: { ...e.data, active: i === idx },
        }));
      });
    }, 2000);

    // Clear active after pulse
    const clearInterval2 = setInterval(() => {
      setEdges(eds => eds.map(e => ({
        ...e,
        data: { ...e.data, active: false },
      })));
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(clearInterval2);
    };
  }, [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* SVG filter for glow effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Animated dash keyframes */}
      <style>{`
        @keyframes dashFlow {
          to { stroke-dashoffset: -36; }
        }
      `}</style>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{ type: 'animated' }}
      />
    </div>
  );
}

export default App;
