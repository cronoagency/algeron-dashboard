import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe3D } from "./components/ui/globe";
import { Meteors } from "./components/ui/meteors";
import { Tooltip } from "./components/ui/tooltip-card";

// Sections as globe markers — positioned around the sphere
const sections = [
  { lat: 30, lng: -30, label: "Trade", desc: "7 posizioni attive", src: "" },
  { lat: 50, lng: 40, label: "Terminale", desc: "Chat diretta", src: "" },
  { lat: -20, lng: 80, label: "Memoria", desc: "4443 embeddings", src: "" },
  { lat: 10, lng: 150, label: "Sistemi", desc: "Pi · Mac · Display", src: "" },
  { lat: -40, lng: -80, label: "Agenzia", desc: "Staes · Homefloo", src: "" },
  { lat: 60, lng: -120, label: "Blog", desc: "11 post", src: "" },
  { lat: -50, lng: 20, label: "Display", desc: "Touch-to-talk", src: "" },
  { lat: 20, lng: -160, label: "File", desc: "Cerca nei file", src: "" },
];

function App() {
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Meteor effect background */}
      <div className="absolute inset-0 overflow-hidden">
        <Meteors number={15} />
      </div>

      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 45%, rgba(74,222,128,0.04) 0%, transparent 70%)" }} />

      {/* Globe — the orb */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          y: activeSection ? -80 : 0,
          scale: activeSection ? 0.7 : 1,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <Globe3D
          className="w-full h-full max-w-[700px] max-h-[700px]"
          markers={sections}
          config={{
            radius: 2,
            globeColor: "#0a2a1a",
            showAtmosphere: true,
            atmosphereColor: "#4ade80",
            atmosphereIntensity: 0.8,
            atmosphereBlur: 2,
            autoRotateSpeed: 0.2,
          }}
          onMarkerClick={(marker) => {
            setActiveSection(activeSection?.label === marker.label ? null : marker);
          }}
          onMarkerHover={(marker) => {
            // Could show tooltip preview here
          }}
        />
      </motion.div>

      {/* Active section — comet card */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            key={activeSection.label}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4"
          >
            <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-neutral-950/80 backdrop-blur-2xl p-6 shadow-2xl shadow-emerald-400/5">
              {/* Meteor effect inside card */}
              <Meteors number={8} />

              {/* Close button */}
              <button
                onClick={() => setActiveSection(null)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>

              {/* Card content */}
              <div className="relative z-10">
                <h2 className="text-xl font-bold text-white mb-1">{activeSection.label}</h2>
                <p className="text-sm text-neutral-400 mb-4">{activeSection.desc}</p>

                {/* Placeholder for expanded content */}
                <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <span className="text-neutral-600 text-sm">Contenuto {activeSection.label} — coming soon</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom status */}
      <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center gap-3 z-10">
        <motion.div
          className="text-[10px] text-emerald-400/60 font-mono"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          AlgerON · Online
        </motion.div>
      </div>
    </div>
  );
}

export default App;
