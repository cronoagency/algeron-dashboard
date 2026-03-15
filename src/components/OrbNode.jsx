import { memo, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * OrbNode — the heart of AlgerON. Pulsing orb at the center of the neural network.
 * Color and speed change based on mood/state via MQTT.
 */
function OrbNode({ data }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 160;
    canvas.width = size;
    canvas.height = size;

    let phase = 0;
    const color = data.color || [90, 154, 130]; // accent green

    function draw() {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Outer glow
      const glowSize = 50 + Math.sin(phase * 0.8) * 8;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
      glow.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.25)`);
      glow.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, size, size);

      // Core orb
      const coreSize = 22 + Math.sin(phase) * 3;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      core.addColorStop(0, `rgba(${color[0] + 60}, ${color[1] + 60}, ${color[2] + 60}, 1)`);
      core.addColorStop(0.6, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`);
      core.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      // Inner bright point
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      innerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      phase += 0.03;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [data.color]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: 'default',
    }}>
      {/* Handles for connections — all directions */}
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />

      <canvas ref={canvasRef} style={{ width: 160, height: 160 }} />

      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 14,
        color: 'var(--accent-bright)',
        letterSpacing: '0.15em',
        marginTop: -10,
        textAlign: 'center',
      }}>
        AlgerON
      </div>

      <div style={{
        fontSize: 11,
        color: 'var(--text-dim)',
        marginTop: 4,
        textAlign: 'center',
      }}>
        {data.status || 'online'}
      </div>
    </div>
  );
}

export default memo(OrbNode);
