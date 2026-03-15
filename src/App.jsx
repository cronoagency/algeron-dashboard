import { Globe3D } from "./components/ui/globe";

// 8 sezioni distribuite uniformemente sulla sfera
const markers = [
  { lat: 45, lng: 0, label: "Trade" },
  { lat: 45, lng: 90, label: "Terminale" },
  { lat: 45, lng: 180, label: "Memoria" },
  { lat: 45, lng: -90, label: "Sistemi" },
  { lat: 0, lng: 45, label: "Agenzia" },
  { lat: 0, lng: 135, label: "Blog" },
  { lat: 0, lng: -135, label: "Display" },
  { lat: 0, lng: -45, label: "File" },
];

export default function App() {
  return (
    <div className="w-screen h-screen bg-black">
      <Globe3D
        className="h-full w-full"
        markers={markers}
        config={{
          radius: 3,
          atmosphereColor: "#4ade80",
          atmosphereIntensity: 20,
          bumpScale: 5,
          autoRotateSpeed: 0.3,
          globeOffset: 4,
        }}
        onMarkerClick={(marker) => console.log("Clicked:", marker.label)}
        onMarkerHover={(marker) => marker && console.log("Hovering:", marker.label)}
      />
    </div>
  );
}
