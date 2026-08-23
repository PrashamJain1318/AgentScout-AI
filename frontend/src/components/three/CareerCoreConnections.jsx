import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Curved connection lines between Central AI Core and 6 Orbiting Nodes.
 * Uses rock-solid THREE.BufferGeometry setFromPoints for 100% WebGL stability.
 */
const ConnectionLine = ({ start = [0, 0, 0], end, isHighlighted }) => {
  const pulseRef = useRef();

  const curve = useMemo(() => {
    const midX = (start[0] + end[0]) * 0.5 + (Math.random() - 0.5) * 0.4;
    const midY = (start[1] + end[1]) * 0.5 + (Math.random() - 0.5) * 0.4;
    const midZ = (start[2] + end[2]) * 0.5 + (Math.random() - 0.5) * 0.4;

    const p0 = new THREE.Vector3(...start);
    const p1 = new THREE.Vector3(midX, midY, midZ);
    const p2 = new THREE.Vector3(...end);

    return new THREE.QuadraticBezierCurve3(p0, p1, p2);
  }, [start, end]);

  const geometry = useMemo(() => {
    const points = curve.getPoints(32);
    const geom = new THREE.BufferGeometry();
    geom.setFromPoints(points);
    return geom;
  }, [curve]);

  useFrame((state) => {
    if (pulseRef.current) {
      const t = (state.clock.getElapsedTime() * 0.25) % 1;
      const point = curve.getPoint(t);
      pulseRef.current.position.copy(point);
    }
  });

  return (
    <group>
      {/* 3D Line Path */}
      <line geometry={geometry}>
        <lineBasicMaterial
          color={isHighlighted ? '#10b981' : '#6366f1'}
          transparent
          opacity={isHighlighted ? 0.8 : 0.3}
        />
      </line>

      {/* Traveling Data Pulse Particle */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={isHighlighted ? '#34d399' : '#818cf8'}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
};

const CareerCoreConnections = ({ nodes = [], hoveredNodeId = null, nextActionCategory = null }) => {
  return (
    <group>
      {nodes.map((node) => {
        const isHighlighted = hoveredNodeId === node.id || (nextActionCategory && node.category === nextActionCategory);
        return (
          <ConnectionLine
            key={node.id}
            start={[0, 0, 0]}
            end={node.position}
            isHighlighted={isHighlighted}
          />
        );
      })}
    </group>
  );
};

export default CareerCoreConnections;
