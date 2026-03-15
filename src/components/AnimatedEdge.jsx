import { memo } from 'react';
import { getBezierPath } from '@xyflow/react';

/**
 * AnimatedEdge — synapse connection between nodes.
 * Glowing green line with animated flow particles.
 */
function AnimatedEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, style,
}) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isActive = data?.active;

  return (
    <>
      {/* Glow layer — soft spread */}
      <path
        d={edgePath}
        fill="none"
        stroke={isActive ? 'var(--synapse-active)' : 'var(--synapse)'}
        strokeWidth={isActive ? 6 : 3}
        strokeOpacity={isActive ? 0.15 : 0.06}
        strokeLinecap="round"
        style={{ transition: 'all 0.6s ease' }}
      />
      {/* Main line */}
      <path
        d={edgePath}
        fill="none"
        stroke={isActive ? 'var(--accent-bright)' : 'var(--accent)'}
        strokeWidth={isActive ? 1.5 : 0.8}
        strokeOpacity={isActive ? 0.9 : 0.3}
        strokeLinecap="round"
        style={{ transition: 'all 0.6s ease' }}
      />
      {/* Animated pulse when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--accent-bright)"
          strokeWidth={1.5}
          strokeDasharray="4 16"
          strokeOpacity={0.8}
          strokeLinecap="round"
          style={{
            animation: 'dashFlow 2s linear infinite',
          }}
        />
      )}
    </>
  );
}

export default memo(AnimatedEdge);
