import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';

/**
 * 6 Orbiting 3D Nodes representing core career pillars:
 * RESUME, SKILLS, OPPORTUNITIES, APPLICATIONS, INTERVIEWS, CAREER PLAN.
 * Pure R3F implementation without DOM portals for 100% crash safety.
 */
const SingleNode = ({
  node,
  isHovered,
  isNextAction,
  onHover,
  onUnhover,
  onClick
}) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = node.position[1] + Math.sin(state.clock.getElapsedTime() * 2 + node.id) * 0.06;
    }
  });

  const nodeColor = isNextAction ? '#f59e0b' : isHovered ? '#10b981' : '#818cf8';

  return (
    <group position={node.position}>
      {/* 3D Sphere Node */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(node.id);
        }}
        onPointerOut={() => onUnhover()}
        onClick={(e) => {
          e.stopPropagation();
          onClick(node.deepLink);
        }}
        scale={isHovered ? 1.4 : isNextAction ? 1.25 : 1.0}
      >
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHovered ? 1.6 : isNextAction ? 1.4 : 0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Orbiting halo ring around node */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.34, 0.01, 8, 32]} />
        <meshBasicMaterial color={nodeColor} transparent opacity={isHovered ? 0.9 : 0.4} />
      </mesh>
    </group>
  );
};

const CareerCoreNodes = ({
  nodes = [],
  hoveredNodeId,
  nextActionCategory,
  onHoverNode,
  onUnhoverNode
}) => {
  const navigate = useNavigate();

  const handleNodeClick = (deepLink) => {
    if (deepLink) {
      navigate(deepLink);
    }
  };

  return (
    <group>
      {nodes.map((node) => (
        <SingleNode
          key={node.id}
          node={node}
          isHovered={hoveredNodeId === node.id}
          isNextAction={nextActionCategory && node.category === nextActionCategory}
          onHover={onHoverNode}
          onUnhover={onUnhoverNode}
          onClick={handleNodeClick}
        />
      ))}
    </group>
  );
};

export default CareerCoreNodes;
