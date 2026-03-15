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

      // Outermost ambient glow
      const ambientSize = 70 + Math.sin(phase * 0.5) * 5;
      const ambient = ctx.createRadialGradient(cx, cy, 0, cx, cy, ambientSize);
      ambient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.08)`);
      ambient.addColorStop(0.6, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.02)`);
      ambient.addColorStop(1, 'transparent');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, size, size);

      // Mid glow ring
      const midSize = 38 + Math.sin(phase * 0.8) * 4;
      const mid = ctx.createRadialGradient(cx, cy, midSize * 0.3, cx, cy, midSize);
      mid.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.15)`);
      mid.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, midSize, 0, Math.PI * 2);
      ctx.fillStyle = mid;
      ctx.fill();

      // Core orb — tight, bright
      const coreSize = 16 + Math.sin(phase) * 2;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
      core.addColorStop(0, `rgba(${Math.min(255, color[0] + 100)}, ${Math.min(255, color[1] + 100)}, ${Math.min(255, color[2] + 100)}, 1)`);
      core.addColorStop(0.4, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.9)`);
      core.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      // White hot center
      const innerSize = 4 + Math.sin(phase * 1.2) * 1;
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerSize);
      innerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      innerGlow.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      innerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, innerSize, 0, Math.PI * 2);
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
