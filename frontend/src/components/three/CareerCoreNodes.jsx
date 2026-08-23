import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

/**
 * 6 Orbiting 3D Nodes representing core career pillars:
 * RESUME, SKILLS, OPPORTUNITIES, APPLICATIONS, INTERVIEWS, CAREER PLAN.
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
      // Subtle hovering floating animation
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
        scale={isHovered ? 1.35 : isNextAction ? 1.2 : 1.0}
      >
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHovered ? 1.6 : isNextAction ? 1.4 : 0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* HTML Overlay Label & Score Badge */}
      <Html
        position={[0, -0.38, 0]}
        center
        distanceFactor={6}
        zIndexRange={[10, 0]}
      >
        <div
          onClick={() => onClick(node.deepLink)}
          onMouseEnter={() => onHover(node.id)}
          onMouseLeave={() => onUnhover()}
          style={{
            cursor: 'pointer',
            textAlign: 'center',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isNextAction ? '#fbbf24' : isHovered ? '#34d399' : '#e4e4e7',
              letterSpacing: '0.5px',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              whiteSpace: 'nowrap',
              background: 'rgba(18, 18, 20, 0.7)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: isNextAction ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)'
            }}
          >
            {node.label}
            {typeof node.score === 'number' && (
              <span style={{ marginLeft: '4px', color: '#818cf8', fontWeight: 800 }}>
                {node.score}%
              </span>
            )}
          </div>
        </div>
      </Html>
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
