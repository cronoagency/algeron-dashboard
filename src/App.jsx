import { motion } from "motion/react";
import { MovingBorderCard } from "./components/MovingBorder";
import { HoverEffect } from "./components/HoverCards";
import { Orb } from "./components/Orb";
import { BackgroundBeams } from "./components/BackgroundBeams";

const nodes = [
  { title: "Trade", description: "7 posizioni attive", icon: "📊", active: true },
  { title: "Terminale", description: "Chat diretta", icon: "⌨️", active: true },
  { title: "Memoria", description: "4443 embeddings", icon: "🧠", active: true },
  { title: "Sistemi", description: "Pi · Mac · Display", icon: "⚡", active: true },
  { title: "Agenzia", description: "Staes · Homefloo", icon: "🏢", active: true },
  { title: "Blog", description: "11 post", icon: "✍️", active: true },
  { title: "Display", description: "Touch-to-talk", icon: "📱", active: true },
  { title: "File", description: "Cerca nei file", icon: "📁", active: true },
];

function App() {
  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0a] overflow-hidden flex flex-col items-center">
      {/* Background */}
      <BackgroundBeams />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Top toolbar */}
      <motion.div
        className="relative z-20 flex items-center gap-2 mt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <button className="bg-emerald-400 text-[#0a0a0a] px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20">
          Active
        </button>
        <button className="bg-[#161a1e] text-zinc-300 border border-white/[0.06] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#1c2127] transition-all">
          Share
        </button>
        <button className="bg-[#161a1e] text-emerald-400 border border-white/[0.06] px-6 py-2.5 rounded-full text-sm font-medium hover:border-emerald-400/20 transition-all">
          Save
        </button>
        <div className="flex gap-1.5 ml-2">
          {["↻", "⋯", "⚙"].map((icon, i) => (
            <button key={i} className="bg-[#161a1e] text-zinc-500 border border-white/[0.06] w-10 h-10 rounded-xl text-base flex items-center justify-center hover:bg-[#1c2127] hover:text-zinc-300 transition-all">
              {icon}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orb — center piece with moving border */}
      <motion.div
        className="relative z-10 mt-16"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <MovingBorderCard
          duration={4000}
          borderRadius="1.2rem"
          containerClassName="w-[200px] h-[200px]"
          className="p-6"
        >
          <Orb size={90} />
          <div className="text-base font-semibold text-zinc-100 tracking-wide mt-1">
            AlgerON
          </div>
          <motion.div
            className="text-xs text-emerald-400 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Online
          </motion.div>
        </MovingBorderCard>

        {/* Connection lines from orb — SVG */}
        <svg className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] h-[80px] pointer-events-none" viewBox="0 0 600 80">
          {/* Center line */}
          <line x1="300" y1="0" x2="300" y2="80" stroke="rgba(74,222,128,0.2)" strokeWidth="1" />
          {/* Left branch */}
          <path d="M300,0 Q300,40 100,80" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="1" />
          <path d="M300,0 Q300,40 200,80" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="1" />
          {/* Right branch */}
          <path d="M300,0 Q300,40 400,80" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="1" />
          <path d="M300,0 Q300,40 500,80" fill="none" stroke="rgba(74,222,128,0.15)" strokeWidth="1" />
          {/* Animated pulse dots */}
          <circle r="2" fill="#4ade80" opacity="0.6">
            <animateMotion dur="3s" repeatCount="indefinite" path="M300,0 Q300,40 100,80" />
          </circle>
          <circle r="2" fill="#4ade80" opacity="0.6">
            <animateMotion dur="4s" repeatCount="indefinite" path="M300,0 Q300,40 500,80" />
          </circle>
          <circle r="2" fill="#4ade80" opacity="0.6">
            <animateMotion dur="3.5s" repeatCount="indefinite" path="M300,0 L300,80" />
          </circle>
        </svg>
      </motion.div>

      {/* Node cards grid */}
      <motion.div
        className="relative z-10 mt-20 w-full max-w-3xl px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <HoverEffect items={nodes} />
      </motion.div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#111417]/95 backdrop-blur-sm border-t border-white/[0.04] flex items-center px-6 gap-4 z-30">
        <span className="text-xs text-emerald-400 font-mono font-semibold">
          {new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
        </span>
        <span className="text-xs text-zinc-600 font-mono">
          Latest logs from AlgerON
        </span>
        <div className="flex-1" />
        <div className="h-6 w-40 bg-gradient-to-r from-emerald-900/60 to-emerald-400 rounded-md flex items-center justify-end px-3">
          <span className="text-[10px] text-[#0a0a0a] font-semibold">Online</span>
        </div>
      </div>
    </div>
  );
}

export default App;
