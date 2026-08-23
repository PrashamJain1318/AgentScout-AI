import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * Central glowing AI Sphere/Orb representing AgentScout Intelligence Engine.
 * Features slow 4-6s breathing pulse and state-modulated emissive aura.
 */
const CareerCoreCenter = ({ agentStatus = 'IDLE', readinessScore = 75 }) => {
  const coreRef = useRef();
  const shellRef = useRef();

  const getColorByStatus = (status) => {
    switch (status) {
      case 'ANALYZING':
        return '#818cf8';
      case 'REASONING':
        return '#8b5cf6';
      case 'ACTION_REQUIRED':
        return '#f59e0b';
      case 'EXECUTING':
        return '#10b981';
      case 'PAUSED':
        return '#64748b';
      case 'IDLE':
      default:
        return '#6366f1';
    }
  };

  const statusColor = getColorByStatus(agentStatus);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Smooth breathing scale pulse (1.00 -> 1.04 -> 1.00 over 5 seconds)
    const scale = 1 + Math.sin((time * Math.PI) / 2.5) * 0.04;

    if (coreRef.current) {
      coreRef.current.scale.set(scale, scale, scale);
    }

    if (shellRef.current) {
      shellRef.current.rotation.y = time * 0.15;
      shellRef.current.rotation.x = time * 0.1;
    }
  });

  return (
    <group>
      {/* Central Inner Glowing Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.2 + (readinessScore / 100) * 0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Transparent Outer Glass Shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.92, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={statusColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.25}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Point light emitting from central core */}
      <pointLight color={statusColor} intensity={2.5} distance={6} decay={2} />
    </group>
  );
};

export default CareerCoreCenter;
