import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * 3 Subtle Orbital Torus Rings rotating at differential speeds around AI Core.
 */
const CareerCoreOrbits = () => {
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  useFrame(() => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += 0.0025;
    if (ring2Ref.current) ring2Ref.current.rotation.x += -0.0018;
    if (ring3Ref.current) ring3Ref.current.rotation.y += 0.0012;
  });

  return (
    <group>
      {/* Inner Ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1.5, 0.008, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.35} />
      </mesh>

      {/* Middle Ring */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.1, 0.006, 16, 100]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.25} />
      </mesh>

      {/* Outer Ring */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, Math.PI / 4, Math.PI / 3]}>
        <torusGeometry args={[2.7, 0.005, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export default CareerCoreOrbits;
