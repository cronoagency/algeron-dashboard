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
        animate={{ y: activeSection ? 100 : 0 }}
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
                className="flex w-80 cursor-pointer flex-col items-stretch rounded-[16px] border-0 bg-[#1F2121] p-2 md:p-4"
                onClick={() => setActiveSection(null)}
              >
                <div className="mx-2 flex-1">
                  <div className="relative mt-2 aspect-[3/4] w-full">
                    <div className="absolute inset-0 rounded-[16px] bg-black flex items-center justify-center"
                      style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px" }}>
                      <span className="text-zinc-600 text-sm">Contenuto {activeSection.label}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-shrink-0 items-center justify-between p-4 font-mono text-white">
                  <div className="text-xs">{activeSection.label}</div>
                  <div className="text-xs text-gray-300 opacity-50">AlgerON</div>
                </div>
              </div>
            </CometCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
