// src/hub/shared/HubBackground.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
      ref.current.rotation.x += 0.0005;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffcc00"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

const HubBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <color attach="background" args={['#000000']} />
        <ParticleField />
        <fog attach="fog" args={['#000000', 5, 25]} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
    </div>
  );
};

export default HubBackground;
