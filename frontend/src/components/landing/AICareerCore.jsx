import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CoreParticles = () => {
  const pointsRef = useRef();
  const count = 100;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const c1 = new THREE.Color("#818cf8"); // Indigo
    const c2 = new THREE.Color("#06b6d4"); // Cyan
    const c3 = new THREE.Color("#c084fc"); // Purple

    for (let i = 0; i < count; i++) {
      const radius = 2.0 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.12;
      pointsRef.current.rotation.x += delta * 0.06;
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
        size={0.065}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation={true}
      />
    </points>
  );
};

const AICareerCore = () => {
  return (
    <div className="ai-career-core-wrapper">
      <div className="ai-core-canvas-container">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.6} />
          <CoreParticles />
        </Canvas>
      </div>

      {/* Node Labels Overlay */}
      <div className="ai-core-labels-overlay">
        <div className="core-node-chip chip-top">
          <span className="node-dot dot-cyan" />
          <span>Opportunities</span>
        </div>
        <div className="core-node-chip chip-left">
          <span className="node-dot dot-purple" />
          <span>Resume & Skills</span>
        </div>
        <div className="core-node-chip chip-right">
          <span className="node-dot dot-indigo" />
          <span>AI Agent Core</span>
        </div>
        <div className="core-node-chip chip-bottom">
          <span className="node-dot dot-emerald" />
          <span>Next Best Action</span>
        </div>
      </div>
    </div>
  );
};

export default AICareerCore;
