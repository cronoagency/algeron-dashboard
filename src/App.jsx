import { motion } from "motion/react";
import { World } from "./components/ui/globe";
import { Meteors } from "./components/ui/meteors";

// Arc data — connections between our "sections" as globe arcs
const globeData = [
  { order: 1, startLat: 41.9, startLng: 12.5, endLat: 51.5, endLng: -0.1, arcAlt: 0.3, color: "#4ade80" },  // Roma → London (Trade)
  { order: 2, startLat: 41.9, startLng: 12.5, endLat: 35.7, endLng: 139.7, arcAlt: 0.4, color: "#4ade80" },  // Roma → Tokyo (Memoria)
  { order: 3, startLat: 41.9, startLng: 12.5, endLat: 40.7, endLng: -74.0, arcAlt: 0.3, color: "#22d3ee" },  // Roma → NYC (Sistemi)
  { order: 4, startLat: 41.9, startLng: 12.5, endLat: -33.9, endLng: 151.2, arcAlt: 0.5, color: "#4ade80" }, // Roma → Sydney (Blog)
  { order: 5, startLat: 51.5, startLng: -0.1, endLat: 35.7, endLng: 139.7, arcAlt: 0.3, color: "#a78bfa" },  // London → Tokyo
  { order: 6, startLat: 40.7, startLng: -74.0, endLat: -33.9, endLng: 151.2, arcAlt: 0.4, color: "#22d3ee" }, // NYC → Sydney
  { order: 7, startLat: 48.9, startLng: 2.3, endLat: 41.9, endLng: 12.5, arcAlt: 0.1, color: "#4ade80" },    // Paris → Roma (Agenzia)
  { order: 8, startLat: 55.8, startLng: 37.6, endLat: 41.9, endLng: 12.5, arcAlt: 0.2, color: "#a78bfa" },   // Moscow → Roma (Display)
  { order: 9, startLat: 1.3, startLng: 103.8, endLat: 41.9, endLng: 12.5, arcAlt: 0.4, color: "#22d3ee" },   // Singapore → Roma
  { order: 10, startLat: 34.1, startLng: -118.2, endLat: 41.9, endLng: 12.5, arcAlt: 0.3, color: "#4ade80" }, // LA → Roma (File)
];

const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#4ade80",
  atmosphereAltitude: 0.15,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

function App() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Globe */}
      <div className="absolute inset-0">
        <World globeConfig={globeConfig} data={globeData} />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          className="text-xs text-emerald-400/60 font-mono tracking-wider"
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
