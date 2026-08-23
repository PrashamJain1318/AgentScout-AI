import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 3D Animated Particle Sphere Constellation
const ParticleConstellation = () => {
  const pointsRef = useRef();

  const count = 120;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color("#818cf8"); // Indigo
    const color2 = new THREE.Color("#6366f1"); // Primary Violet
    const color3 = new THREE.Color("#10b981"); // Emerald

    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      col[i * 3] = mixedColor.r;
      col[i * 3 + 1] = mixedColor.g;
      col[i * 3 + 2] = mixedColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.15;
      pointsRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
};

// Concentric Glowing Orbits
const OrbitalRings = () => {
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state, delta) => {
    if (ringRef1.current) ringRef1.current.rotation.z += delta * 0.1;
    if (ringRef2.current) ringRef2.current.rotation.z -= delta * 0.15;
  });

  return (
    <group>
      <mesh ref={ringRef1} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ringRef2} rotation={[-Math.PI / 4, -Math.PI / 6, 0]}>
        <torusGeometry args={[3.1, 0.006, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn("WebGL 3D background catch fallback:", err);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const Auth3DCanvas = () => {
  return (
    <ThreeErrorBoundary>
      <div
        className="auth-3d-canvas-wrapper"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
          opacity: 0.7,
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60 }}
          dpr={[1, 1.5]}
          frameloop="always"
          gl={{ antialias: true, alpha: true }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.6} />
          <ParticleConstellation />
          <OrbitalRings />
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
};

export default Auth3DCanvas;
