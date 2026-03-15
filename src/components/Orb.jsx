import { useEffect, useRef } from "react";

/**
 * Orb — pulsing green orb canvas, standalone.
 */
export function Orb({ size = 80, className }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const s = size;
    canvas.width = s * 2;
    canvas.height = s * 2;
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    ctx.scale(2, 2);

    let phase = 0;
    const c = [74, 222, 128];

    function draw() {
      ctx.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2;

      // Outer ambient
      const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.45 + Math.sin(phase * 0.5) * 3);
      g1.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.07)`);
      g1.addColorStop(1, "transparent");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, s, s);

      // Mid ring
      const mr = s * 0.25 + Math.sin(phase * 0.8) * 2;
      const g2 = ctx.createRadialGradient(cx, cy, mr * 0.5, cx, cy, mr);
      g2.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.18)`);
      g2.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, mr, 0, Math.PI * 2);
      ctx.fillStyle = g2; ctx.fill();

      // Core
      const cr = s * 0.12 + Math.sin(phase) * 1;
      const g3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      g3.addColorStop(0, "rgba(187,247,208,1)");
      g3.addColorStop(0.5, `rgba(${c[0]},${c[1]},${c[2]},0.85)`);
      g3.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = g3; ctx.fill();

      // Hot center
      const g4 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 3);
      g4.addColorStop(0, "rgba(255,255,255,0.95)");
      g4.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = g4; ctx.fill();

      phase += 0.025;
      animRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return <canvas ref={canvasRef} className={className} />;
}
