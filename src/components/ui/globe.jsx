"use client";
import React, { useRef, useMemo, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { cn } from "../../lib/utils";

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function Marker({ marker, radius, defaultSize, onClick, onHover }) {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef(null);
  const imageGroupRef = useRef(null);
  const { camera } = useThree();

  const surfacePosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.001), [marker.lat, marker.lng, radius]);
  const topPosition = useMemo(() => latLngToVector3(marker.lat, marker.lng, radius * 1.25), [marker.lat, marker.lng, radius]);
  const lineHeight = topPosition.distanceTo(surfacePosition);

  useFrame(() => {
    if (!imageGroupRef.current) return;
    const worldPos = new THREE.Vector3();
    imageGroupRef.current.getWorldPosition(worldPos);
    const markerDirection = worldPos.clone().normalize();
    const cameraDirection = camera.position.clone().normalize();
    const dot = markerDirection.dot(cameraDirection);
    setIsVisible(dot > 0.1);
  });

  const handlePointerEnter = useCallback(() => { setHovered(true); onHover?.(marker); }, [marker, onHover]);
  const handlePointerLeave = useCallback(() => { setHovered(false); onHover?.(null); }, [onHover]);
  const handleClick = useCallback(() => { onClick?.(marker); }, [marker, onClick]);

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
        <meshBasicMaterial color={hovered ? "#ffffff" : "#94a3b8"} transparent opacity={hovered ? 0.9 : 0.6} />
      </mesh>
      <mesh position={surfacePosition} quaternion={lineQuaternion}>
        <coneGeometry args={[0.012, 0.03, 8]} />
        <meshBasicMaterial color={hovered ? "#4ade80" : "#4ade80"} transparent opacity={hovered ? 1 : 0.6} />
      </mesh>
      <group ref={imageGroupRef} position={topPosition}>
        <Html transform center sprite distanceFactor={4}
          style={{ pointerEvents: isVisible ? "auto" : "none", opacity: isVisible ? 1 : 0, transition: "opacity 0.15s ease-out" }}>
          <div
            style={{
              position: 'relative',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              background: hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '6px 12px 6px 28px',
              borderRadius: '8px',
              border: `0.5px solid rgba(255,255,255,${hovered ? '0.2' : '0.1'})`,
              transition: 'all 0.2s ease',
              boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={handlePointerEnter} onMouseLeave={handlePointerLeave} onClick={handleClick}>
            {/* Icon — filled, half outside card on the left, tilted */}
            {marker.icon && (
              <div style={{
                position: 'absolute',
                left: '-12px',
                top: '50%',
                transform: 'translateY(-50%) rotate(-6deg)',
                transformOrigin: 'center center',
              }}>
                {React.createElement(marker.icon, {
                  size: 20,
                  weight: 'fill',
                  color: hovered ? '#4ade80' : 'rgba(255,255,255,0.85)',
                  style: { transition: 'color 0.2s ease', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' },
                })}
              </div>
            )}
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: hovered ? '#fff' : 'rgba(255,255,255,0.8)',
              letterSpacing: '0.04em',
              transition: 'color 0.2s ease',
            }}>
              {marker.label}
            </span>
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
    vertexShader: `varying vec3 vNormal; varying vec3 vPosition;
      void main() { vNormal = normalize(normalMatrix * normal); vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 atmosphereColor; uniform float intensity; uniform float fresnelPower;
      varying vec3 vNormal; varying vec3 vPosition;
      void main() { float fresnel = pow(1.0 - abs(dot(vNormal, normalize(-vPosition))), fresnelPower); gl_FragColor = vec4(atmosphereColor, fresnel * intensity); }`,
    side: THREE.BackSide, transparent: true, depthWrite: false,
  }), [color, intensity, fresnelPower]);
  return <mesh scale={[1.12, 1.12, 1.12]}><sphereGeometry args={[radius, 64, 32]} /><primitive object={atmosphereMaterial} attach="material" /></mesh>;
}

const DEFAULT_EARTH_TEXTURE = "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const DEFAULT_BUMP_TEXTURE = "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";

function RotatingGlobe({ config, markers, onMarkerClick, onMarkerHover }) {
  const groupRef = useRef(null);
  const [textures, setTextures] = useState({ earth: null, bump: null });

  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(config.textureUrl || DEFAULT_EARTH_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      setTextures(prev => ({ ...prev, earth: tex }));
    });
    loader.load(config.bumpMapUrl || DEFAULT_BUMP_TEXTURE, (tex) => {
      tex.anisotropy = 8;
      setTextures(prev => ({ ...prev, bump: tex }));
    });
  }, [config.textureUrl, config.bumpMapUrl]);

  const geometry = useMemo(() => new THREE.SphereGeometry(config.radius, 64, 64), [config.radius]);
  const wireframeGeometry = useMemo(() => new THREE.SphereGeometry(config.radius * 1.002, 32, 16), [config.radius]);

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry}>
        {textures.earth ? (
          <meshStandardMaterial map={textures.earth} bumpMap={textures.bump} bumpScale={(config.bumpScale || 1) * 0.05} roughness={0.7} metalness={0.0} />
        ) : (
          <meshStandardMaterial color={config.globeColor || "#1a1a2e"} roughness={0.7} metalness={0.0} />
        )}
      </mesh>
      {config.showWireframe && (
        <mesh geometry={wireframeGeometry}>
          <meshBasicMaterial color={config.wireframeColor || "#4a9eff"} wireframe transparent opacity={0.08} />
        </mesh>
      )}
      {markers.map((marker, index) => (
        <Marker key={`marker-${index}-${marker.lat}-${marker.lng}`} marker={marker} radius={config.radius}
          defaultSize={config.markerSize || 0.06} onClick={onMarkerClick} onHover={onMarkerHover} />
      ))}
    </group>
  );
}

function Scene({ markers, config, onMarkerClick, onMarkerHover }) {
  const { camera } = useThree();
  React.useEffect(() => {
    camera.position.set(0, 0, config.radius * 3.5);
    camera.lookAt(0, 0, 0);
  }, [camera, config.radius]);
  return (
    <>
      <ambientLight intensity={config.ambientIntensity || 0.6} />
      <directionalLight position={[config.radius * 5, config.radius * 2, config.radius * 5]} intensity={config.pointLightIntensity || 1.5} color="#ffffff" />
      <directionalLight position={[-config.radius * 3, config.radius, -config.radius * 2]} intensity={(config.pointLightIntensity || 1.5) * 0.3} color="#88ccff" />
      <group position={[0, -(config.globeOffset || 0), 0]}>
        <RotatingGlobe config={config} markers={markers} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
      </group>
      {config.showAtmosphere && <Atmosphere radius={config.radius} color={config.atmosphereColor || "#4da6ff"} intensity={config.atmosphereIntensity || 0.5} blur={config.atmosphereBlur || 2} />}
      <OrbitControls makeDefault enablePan={false} enableZoom={false} rotateSpeed={0.4}
        autoRotate={config.autoRotateSpeed > 0} autoRotateSpeed={config.autoRotateSpeed || 0.3} enableDamping dampingFactor={0.1}
        minPolarAngle={Math.PI * 0.2} maxPolarAngle={Math.PI * 0.55} />
    </>
  );
}

export function Globe3D({ markers = [], config = {}, className, onMarkerClick, onMarkerHover }) {
  const defaultConfig = {
    radius: 2, globeColor: "#1a1a2e", showAtmosphere: false,
    atmosphereColor: "#4da6ff", atmosphereIntensity: 0.5, atmosphereBlur: 2,
    bumpScale: 1, autoRotateSpeed: 0.3, markerSize: 0.06,
    showWireframe: false, wireframeColor: "#4a9eff",
    ambientIntensity: 0.6, pointLightIntensity: 1.5,
  };
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  return (
    <div className={cn("relative h-[500px] w-full", className)}>
      <Canvas gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 1000, position: [0, 0, mergedConfig.radius * 3.5] }}
        style={{ background: "transparent" }}>
        <Suspense fallback={<Html center><span className="text-sm text-neutral-400">Loading globe...</span></Html>}>
          <Scene markers={markers} config={mergedConfig} onMarkerClick={onMarkerClick} onMarkerHover={onMarkerHover} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default Globe3D;
