import { memo, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';

/**
 * OrbNode — AlgerON's heart. Pulsing green orb, n8n-style card.
 */
function OrbNode({ data }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 120;
    canvas.width = size * 2; // retina
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);

    let phase = 0;

    function draw() {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Ambient glow
      const a1 = 45 + Math.sin(phase * 0.5) * 5;
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, a1);
      g1.addColorStop(0, 'rgba(74, 222, 128, 0.06)');
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, size, size);

      // Mid ring
      const a2 = 25 + Math.sin(phase * 0.8) * 3;
      const g2 = ctx.createRadialGradient(cx, cy, a2 * 0.4, cx, cy, a2);
      g2.addColorStop(0, 'rgba(74, 222, 128, 0.12)');
      g2.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, a2, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      // Core
      const cs = 12 + Math.sin(phase) * 1.5;
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, cs);
      g3.addColorStop(0, 'rgba(187, 247, 208, 1)');
      g3.addColorStop(0.4, 'rgba(74, 222, 128, 0.9)');
      g3.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.beginPath();
      ctx.arc(cx, cy, cs, 0, Math.PI * 2);
      ctx.fillStyle = g3;
      ctx.fill();

      // White center
      const ws = 3 + Math.sin(phase * 1.2) * 0.5;
      const g4 = ctx.createRadialGradient(cx, cy, 0, cx, cy, ws);
      g4.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      g4.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, ws, 0, Math.PI * 2);
      ctx.fillStyle = g4;
      ctx.fill();

      phase += 0.025;
      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{
      background: 'var(--node-bg)',
      border: '1px solid var(--border-node)',
      borderRadius: 10,
      padding: '20px',
      width: 180,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: '0 0 40px rgba(74, 222, 128, 0.06), 0 8px 32px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0 }} />

      {/* Green check */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        width: 20, height: 20, borderRadius: '50%',
        background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0b0d0f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <canvas ref={canvasRef} style={{ marginBottom: 8 }} />

      <div style={{
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--text-white)',
        letterSpacing: '0.02em',
      }}>
        AlgerON
      </div>

      <div style={{
        fontSize: 11,
        color: 'var(--accent)',
        marginTop: 4,
      }}>
        {data.status || 'Online'}
      </div>
    </div>
  );
}

export default memo(OrbNode);
