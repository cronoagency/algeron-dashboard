import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * SystemNode — a glass card node representing a system component.
 * Shows icon + title + mini preview. Expandable on click.
 */
function SystemNode({ data }) {
  const [expanded, setExpanded] = useState(false);

  const isOnline = data.online !== false;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: 'var(--node-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${isOnline ? 'var(--border-glow)' : 'rgba(255,68,85,0.3)'}`,
        borderRadius: 12,
        padding: expanded ? '16px 20px' : '12px 16px',
        minWidth: expanded ? 240 : 140,
        maxWidth: expanded ? 320 : 180,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isOnline
          ? '0 0 20px rgba(90, 154, 130, 0.1), inset 0 0 15px rgba(90, 154, 130, 0.03)'
          : '0 0 15px rgba(255, 68, 85, 0.1)',
      }}
    >
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="s-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="s-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="s-left" style={{ opacity: 0 }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{data.icon || '●'}</span>
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-bright)',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.05em',
          }}>
            {data.label}
          </div>
          <div style={{
            fontSize: 10,
            color: isOnline ? 'var(--accent)' : 'var(--red)',
            marginTop: 2,
          }}>
            {isOnline ? '● online' : '● offline'}
          </div>
        </div>
      </div>

      {/* Preview — always visible */}
      {data.preview && (
        <div style={{
          fontSize: 10,
          color: 'var(--text-dim)',
          marginTop: 8,
          lineHeight: 1.4,
        }}>
          {data.preview}
        </div>
      )}

      {/* Expanded content */}
      {expanded && data.detail && (
        <div style={{
          fontSize: 11,
          color: 'var(--text)',
          marginTop: 12,
          paddingTop: 10,
          borderTop: '1px solid var(--border)',
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}>
          {data.detail}
        </div>
      )}
    </div>
  );
}

export default memo(SystemNode);
