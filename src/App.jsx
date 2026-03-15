import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe3D } from "./components/ui/globe";
import { CometCard } from "./components/ui/comet-card";

// 8 sezioni sulla calotta superiore del globo
const markers = [
  { lat: 70, lng: 0, label: "Trade" },
  { lat: 70, lng: 90, label: "Terminale" },
  { lat: 70, lng: 180, label: "Memoria" },
  { lat: 70, lng: -90, label: "Sistemi" },
  { lat: 45, lng: 45, label: "Agenzia" },
  { lat: 45, lng: 135, label: "Blog" },
  { lat: 45, lng: -135, label: "Display" },
  { lat: 45, lng: -45, label: "File" },
];

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

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
          onMarkerHover={(marker) => {}}
        />
      </motion.div>

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
              <div
                className="w-96 rounded-[20px] bg-[#1a1a1a]/90 backdrop-blur-xl p-6 cursor-pointer"
                onClick={() => setActiveSection(null)}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-medium tracking-widest text-zinc-500 uppercase">
                    {activeSection.label}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <span className="text-white text-xs">↗</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-6">
                  {activeSection.label} Overview
                </h3>

                {/* Placeholder content area */}
                <div className="h-40 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">Dati in arrivo</span>
                </div>

                {/* Status indicators */}
                <div className="flex gap-6">
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Status</span>
                    <span className="text-sm text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Online
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Latency</span>
                    <span className="text-sm text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Low
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Load</span>
                    <span className="text-sm text-white flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      Medium
                    </span>
                  </div>
                </div>
              </div>
            </CometCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
