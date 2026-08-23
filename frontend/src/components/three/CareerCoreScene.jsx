import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import CareerCoreCenter from './CareerCoreCenter';
import CareerCoreOrbits from './CareerCoreOrbits';
import CareerCoreParticles from './CareerCoreParticles';
import CareerCoreConnections from './CareerCoreConnections';
import CareerCoreNodes from './CareerCoreNodes';

/**
 * Mouse Parallax Controller
 */
const ParallaxGroup = ({ children }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Mouse parallax tilt
      const targetX = (state.pointer.x * Math.PI) / 16;
      const targetY = (state.pointer.y * Math.PI) / 16;

      groupRef.current.rotation.y += (targetX - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (-targetY - groupRef.current.rotation.x) * 0.05;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

/**
 * 3D Scene setup with Canvas, Lighting, Camera, and Objects
 */
const CareerCoreScene = ({
  readiness = {},
  agentStatus = 'IDLE',
  nextActionCategory = null,
  nodes = [],
  hoveredNodeId,
  onHoverNode,
  onUnhoverNode
}) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
    >
      {/* Lighting Setup */}
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#818cf8" />
      <pointLight position={[-5, -5, -2]} intensity={0.8} color="#38bdf8" />
      <directionalLight position={[0, 10, 0]} intensity={0.4} />

      {/* Mouse Parallax Inner Scene */}
      <ParallaxGroup>
        <CareerCoreCenter agentStatus={agentStatus} readinessScore={readiness.overall || 75} />
        <CareerCoreOrbits />
        <CareerCoreParticles count={150} />
        <CareerCoreConnections
          nodes={nodes}
          hoveredNodeId={hoveredNodeId}
          nextActionCategory={nextActionCategory}
        />
        <CareerCoreNodes
          nodes={nodes}
          hoveredNodeId={hoveredNodeId}
          nextActionCategory={nextActionCategory}
          onHoverNode={onHoverNode}
          onUnhoverNode={onUnhoverNode}
        />
      </ParallaxGroup>
    </Canvas>
  );
};

export default CareerCoreScene;
