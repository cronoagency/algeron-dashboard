import { memo } from 'react';
import { getBezierPath } from '@xyflow/react';

/**
 * AnimatedEdge — n8n-style green connection with glow and animated flow.
 */
function AnimatedEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data,
}) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const isActive = data?.active;

  return (
    <>
      {/* Wide glow */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(74, 222, 128, 0.08)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Main line */}
      <path
        d={edgePath}
        fill="none"
        stroke={isActive ? 'rgba(74, 222, 128, 0.7)' : 'rgba(74, 222, 128, 0.25)'}
        strokeWidth={isActive ? 2 : 1.5}
        strokeLinecap="round"
        style={{ transition: 'all 0.5s ease' }}
      />
      {/* Animated flow particles */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(74, 222, 128, 0.9)"
          strokeWidth={2}
          strokeDasharray="3 15"
          strokeLinecap="round"
          style={{ animation: 'edgeFlow 2s linear infinite' }}
        />
      )}
      {/* Connection dot at source */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={3}
        fill="rgba(74, 222, 128, 0.5)"
      />
      {/* Connection dot at target */}
      <circle
        cx={targetX}
        cy={targetY}
        r={3}
        fill="rgba(74, 222, 128, 0.5)"
      />
      {/* Edge label */}
      {data?.label && (
        <text
          x={(sourceX + targetX) / 2}
          y={(sourceY + targetY) / 2 - 8}
          textAnchor="middle"
          fill="#52525b"
          fontSize={10}
          fontFamily="Inter, sans-serif"
        >
          {data.label}
        </text>
      )}
    </>
  );
}

export default memo(AnimatedEdge);
