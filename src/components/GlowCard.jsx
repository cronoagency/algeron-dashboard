import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

/**
 * GlowCard — premium dark card with hover glow effect.
 * n8n/Aceternity style: dark gradient bg, subtle border, glow on hover.
 */
export function GlowCard({
  children,
  className,
  active = true,
  onClick,
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <motion.div
      className={cn(
        "relative rounded-xl overflow-hidden cursor-pointer group",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hover glow effect */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(74, 222, 128, 0.06), transparent 60%)`,
          }}
        />
      )}

      {/* Border glow */}
      <div className="absolute inset-0 rounded-xl pointer-events-none z-10"
        style={{
          border: `1px solid ${isHovered ? 'rgba(74, 222, 128, 0.25)' : 'rgba(255,255,255,0.06)'}`,
          transition: 'border-color 0.3s ease',
        }}
      />

      {/* Card content */}
      <div className="relative z-5 bg-gradient-to-b from-[#161a1e] to-[#111417] p-4">
        {/* Active checkmark */}
        {active && (
          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {children}
      </div>
    </motion.div>
  );
}
