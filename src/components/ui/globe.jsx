"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../../lib/utils";

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Marker({ marker, radius, defaultSize, onClick, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef(null);
  const imageGroupRef = useRef(null);
  const { camera } = useThree();

  const surfacePosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.001), [marker.lat, marker.lng, radius]);
  const topPosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.18), [marker.lat, marker.lng, radius]);
  const lineHeight = topPosition.distanceTo(surfacePosition);

  useFrame(() => {
    if (!imageGroupRef.current) return;
    const worldPos = new THREE.Vector3();
    imageGroupRef.current.getWorldPosition(worldPos);
    setIsVisible(worldPos.clone().normalize().dot(camera.position.clone().normalize()) > 0.1);
  });

  const { lineCenter, lineQuaternion } = useMemo(() => {
    const center = surfacePosition.clone().lerp(topPosition, 0.5);
    const direction = topPosition.clone().sub(surfacePosition).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return { lineCenter: center, lineQuaternion: quaternion };
  }, [surfacePosition, topPosition]);

  return (
    <group ref={groupRef} visible={isVisible}>
      <mesh position={lineCenter} quaternion={lineQuaternion}>
        <cylinderGeometry args={[0.003, 0.003, lineHeight, 8]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#4ade80"} transparent opacity={hovered ? 0.9 : 0.4} />
      </mesh>
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshBasicMaterial color={hovered ? "#ffffff" : "#4ade80"} />
      </mesh>
      <group ref={imageGroupRef} position={topPosition}>
        <Html transform center sprite distanceFactor={10}
          style={{ pointerEvents: isVisible ? "auto" : "none", opacity: isVisible ? 1 : 0, transition: "opacity 0.15s ease-out" }}>
          <div
            className={cn("cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
              hovered ? "bg-emerald-400 text-black scale-110 shadow-lg shadow-emerald-400/30" : "bg-neutral-900/80 text-emerald-400 border border-emerald-400/30 backdrop-blur-sm")}
            onMouseEnter={() => { setHovered(true); onHover?.(marker); }}
            onMouseLeave={() => { setHovered(false); onHover?.(null); }}
            onClick={() => onClick?.(marker)}>
            {marker.label || "●"}
          </div>
        </Html>
      </group>
    </group>
  );
}

function Atmosphere({ radius, color, intensity, blur }) {
  const fresnelPower = Math.max(0.5, 5 - blur);
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      atmosphereColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      fresnelPower: { value: fresnelPower },
    },
    vertexShader: `
      varying vec3 vNormal; varying vec3 vPosition;
      void main() { vNormal = normalize(normalMatrix * normal); vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      uniform vec3 atmosphereColor; uniform float intensity; uniform float fresnelPower;
      varying vec3 vNormal; varying vec3 vPosition;
      void main() { float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower); gl_FragColor = vec4(atmosphereColor, fresnel * intensity); }
    `,
    side: THREE.BackSide, transparent: true, depthWrite: false,
  }), [color, intensity, fresnelPower]);

  return <mesh scale={[1.12, 1.12, 1.12]}><sphereGeometry args={[radius, 64, 32]} /><primitive object={atmosphereMaterial} attach="material" /></mesh>;
}

function RotatingGlobe({ config, markers, onMarkerClick, onMarkerHover }) {
  const groupRef = useRef(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(config.radius, 64, 64), [config.radius]);

  // Custom green sphere instead of Earth texture
  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={config.globeColor} roughness={0.8} metalness={0.1} transparent opacity={0.15} />
      </mesh>
      <mesh geometry={new THREE.SphereGeometry(config.radius * 1.002, 48, 24)}>
        <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.06} />
      </mesh>
      {markers.map((marker, index) => (
        <Marker key={`marker-${index}`} marker={marker} radius={config.radius} defaultSize={config.markerSize}
          onClick={onMarkerClick} onHover={onMarkerHover} />
      ))}
    </group>
  );
}

function Scene({ markers, config, onMarkerClick, onMarkerHover }) {
  const { camera } = useThree();
  React.useEffect(() => { camera.position.set(0, 0, config.radius * 3.5); camera.lookAt(0, 0, 0); }, [camera, config.radius]);

  return (
    <>
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight position={[config.radius * 5, config.radius * 2, config.radius * 5]} intensity={config.pointLightIntensity} />
      <RotatingGlobe config={config} markers={markers} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
      {config.showAtmosphere && <Atmosphere radius={config.radius} color={config.atmosphereColor} intensity={config.atmosphereIntensity} blur={config.atmosphereBlur} />}
      <OrbitControls makeDefault enablePan={false} enableZoom={false} rotateSpeed={0.4}
        autoRotate={config.autoRotateSpeed > 0} autoRotateSpeed={config.autoRotateSpeed} enableDamping dampingFactor={0.1} />
    </>
  );
}

const defaultConfig = {
  radius: 2, globeColor: "#0a2a1a", showAtmosphere: true,
  atmosphereColor: "#4ade80", atmosphereIntensity: 0.6, atmosphereBlur: 2,
  bumpScale: 1, autoRotateSpeed: 0.3, enableZoom: false, enablePan: false,
  minDistance: 5, maxDistance: 15, markerSize: 0.06,
  showWireframe: true, wireframeColor: "#4ade80",
  ambientIntensity: 0.4, pointLightIntensity: 1.2, backgroundColor: null,
};

export function Globe3D({ markers = [], config = {}, className, onMarkerClick, onMarkerHover }) {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  return (
    <div className={cn("relative h-[500px] w-full", className)}>
      <Canvas gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, mergedConfig.radius * 3.5] }}
        style={{ background: "transparent" }}>
        <Suspense fallback={<Html center><span className="text-sm text-neutral-500">Loading...</span></Html>}>
          <Scene markers={markers} config={mergedConfig} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
