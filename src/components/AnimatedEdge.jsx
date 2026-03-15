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
      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={isActive ? 'var(--synapse-active)' : 'var(--synapse)'}
        strokeWidth={isActive ? 3 : 1.5}
        strokeOpacity={isActive ? 0.6 : 0.3}
        filter={isActive ? 'url(#glow)' : undefined}
        style={{ transition: 'all 0.5s ease' }}
      />
      {/* Main line */}
      <path
        d={edgePath}
        fill="none"
        stroke={isActive ? 'var(--accent-bright)' : 'var(--accent)'}
        strokeWidth={isActive ? 2 : 1}
        strokeOpacity={isActive ? 0.8 : 0.4}
        style={{ transition: 'all 0.5s ease' }}
      />
      {/* Animated dash when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--accent-bright)"
          strokeWidth={2}
          strokeDasharray="6 12"
          strokeOpacity={0.9}
          style={{
            animation: 'dashFlow 1.5s linear infinite',
          }}
        />
      )}
    </>
  );
}

export default memo(AnimatedEdge);
