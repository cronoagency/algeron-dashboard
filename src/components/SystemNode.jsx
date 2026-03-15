import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * SystemNode — n8n-style dark card with icon, title, green check, border glow.
 */
function SystemNode({ data }) {
  const [hovered, setHovered] = useState(false);

  const isActive = data.active !== false;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--node-bg)',
        border: `1px solid ${hovered ? 'var(--border-node-hover)' : 'var(--border-node)'}`,
        borderRadius: 10,
        padding: '16px',
        width: 170,
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: hovered
          ? '0 0 30px rgba(74, 222, 128, 0.08), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0, 0, 0, 0.4)',
        position: 'relative',
      }}
    >
      {/* Connection handles — invisible */}
      <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Top} id="s-top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="s-right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="s-left" style={{ opacity: 0 }} />

      {/* Green checkmark */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0b0d0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
        fontSize: 22,
      }}>
        {data.icon}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-white)',
        textAlign: 'center',
        lineHeight: 1.3,
      }}>
        {data.label}
      </div>

      {/* Subtitle */}
      {data.subtitle && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-dim)',
          textAlign: 'center',
          marginTop: 4,
        }}>
          {data.subtitle}
        </div>
      )}

      {/* Connection labels — small text below node */}
      {data.outputs && data.outputs.map((out, i) => (
        <div key={i} style={{
          fontSize: 10,
          color: 'var(--text-dim)',
          textAlign: 'center',
          marginTop: i === 0 ? 10 : 2,
        }}>
          {out}
        </div>
      ))}
    </div>
  );
}

export default memo(SystemNode);
