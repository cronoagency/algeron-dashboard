import { memo, useEffect, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { GlowCard } from './GlowCard';

function OrbNode({ data }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 100;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);

    let phase = 0;
    const c = [74, 222, 128]; // emerald-400

    function draw() {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2;

      // Ambient
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 42 + Math.sin(phase * 0.5) * 4);
      g1.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.06)`);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, size, size);

      // Ring
      const rs = 22 + Math.sin(phase * 0.8) * 2;
      const g2 = ctx.createRadialGradient(cx, cy, rs * 0.5, cx, cy, rs);
      g2.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.15)`);
      g2.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, rs, 0, Math.PI * 2);
      ctx.fillStyle = g2; ctx.fill();

      // Core
      const cs = 10 + Math.sin(phase) * 1;
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, cs);
      g3.addColorStop(0, 'rgba(187,247,208,1)');
      g3.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},0.8)`);
      g3.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.beginPath(); ctx.arc(cx, cy, cs, 0, Math.PI * 2);
      ctx.fillStyle = g3; ctx.fill();

      // Center
      const g4 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 3);
      g4.addColorStop(0, 'rgba(255,255,255,0.9)');
      g4.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = g4; ctx.fill();

      phase += 0.025;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div>
      <Handle type="source" position={Position.Top} id="top" className="!opacity-0" />
      <Handle type="source" position={Position.Right} id="right" className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!opacity-0" />
      <Handle type="source" position={Position.Left} id="left" className="!opacity-0" />

      <GlowCard active={true} className="w-[180px]">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="mb-1" />
          <div className="text-[15px] font-semibold text-zinc-100 tracking-wide">
            AlgerON
          </div>
          <motion.div
            className="text-[11px] text-emerald-400 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {data.status || 'Online'}
          </motion.div>
        </div>
      </GlowCard>
    </div>
  );
}

export default memo(OrbNode);
