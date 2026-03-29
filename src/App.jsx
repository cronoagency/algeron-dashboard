import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe3D } from "./components/ui/globe";
import { CometCard } from "./components/ui/comet-card";
import { Terminal } from "./components/Terminal";

import { SelfAnalysis } from "./components/SelfAnalysis";
import { Systems } from "./components/Systems";

import {
  ChartLineUp,
  Terminal as TerminalIcon,
  Brain,
  Cpu,
  Briefcase,
  PenNib,
  Monitor,
  FolderOpen,
  Eye,
} from "@phosphor-icons/react";

// 9 sezioni sulla calotta superiore del globo
const markers = [
  { lat: 70, lng: 0, label: "Trade", icon: ChartLineUp },
  { lat: 70, lng: 90, label: "Terminale", icon: TerminalIcon },
  { lat: 70, lng: 180, label: "Memoria", icon: Brain },
  { lat: 70, lng: -90, label: "Sistemi", icon: Cpu },
  { lat: 45, lng: 45, label: "Agenzia", icon: Briefcase },
  { lat: 45, lng: 135, label: "Blog", icon: PenNib },
  { lat: 45, lng: -135, label: "Display", icon: Monitor },
  { lat: 45, lng: -45, label: "File", icon: FolderOpen },
  { lat: 20, lng: 0, label: "Self-Awareness", icon: Eye },
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden">
      {/* Globe */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: activeSection ? 150 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <Globe3D
          className="h-full w-full"
          markers={markers}
          config={{
            radius: 3,
            atmosphereColor: "#4da6ff",
            atmosphereIntensity: 20,
            bumpScale: 5,
            autoRotateSpeed: 0.3,
            globeOffset: 4,
          }}
          onMarkerClick={(marker) => setActiveSection(activeSection?.label === marker.label ? null : marker)}
          onMarkerHover={(marker) => setHoveredSection(marker)}
        />
      </motion.div>

      {/* Tooltip — appare on hover */}
      <AnimatePresence>
        {hoveredSection && !activeSection && (
          <motion.div
            key={"tooltip-" + hoveredSection.label}
            className="absolute top-6 left-1/2 z-20"
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            transition={{ duration: 0.15 }}
          >
            <div className="rounded-xl bg-[#1a1a1a]/90 backdrop-blur-xl px-5 py-3 border border-white/[0.06]">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest">{hoveredSection.label}</span>
              <p className="text-sm text-white mt-1">Anteprima dati</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comet Card — appare on click */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            key={activeSection.label}
            className="absolute top-8 left-1/2 z-20"
            initial={{ opacity: 0, y: -40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -40, x: "-50%" }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <CometCard>
              <div className="w-96 rounded-[20px] bg-[#1a1a1a]/90 backdrop-blur-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                    {activeSection.label}
                  </span>
                  <button
                    onClick={() => setActiveSection(null)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <span className="text-zinc-400 text-sm">✕</span>
                  </button>
                </div>

                {/* Content area */}
                {activeSection.label === "Terminale" ? (
                  <div className="h-96">
                    <Terminal />
                  </div>
                ) : activeSection.label === "Self-Awareness" ? (
                  <SelfAnalysis />
                ) : activeSection.label === "Sistemi" ? (
                  <Systems />
                ) : (
                  <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <span className="text-zinc-600 text-sm">Dati in arrivo</span>
                  </div>
                )}
              </div>
            </CometCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
