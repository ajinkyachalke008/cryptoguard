// src/hub/features/F0_CommandCenter/components/EntityRadar3D.tsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, Float, Stars, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const RadarNodes = ({ count = 40 }) => {
  const pointsData = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      const r = 15 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      p.push({
        position: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        risk: Math.random() > 0.8 ? 'CRITICAL' : 'NORMAL'
      });
    }
    return p;
  }, [count]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {pointsData.map((p, i) => {
        const connection = i > 0 && i % 3 === 0 ? [p.position, pointsData[i-1].position] : null;

        return (
          <React.Fragment key={i}>
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
              <mesh position={p.position}>
                <sphereGeometry args={[p.risk === 'CRITICAL' ? 0.4 : 0.2, 16, 16]} />
                <meshStandardMaterial 
                  color={p.risk === 'CRITICAL' ? '#ff2d55' : '#00d4ff'} 
                  emissive={p.risk === 'CRITICAL' ? '#ff2d55' : '#00d4ff'}
                  emissiveIntensity={2}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            </Float>
            {connection && (
              <Line
                points={[connection[0], connection[1]]}
                color="#00d4ff"
                lineWidth={0.5}
                transparent
                opacity={0.1}
              />
            )}
          </React.Fragment>
        );
      })}
    </group>
  );
};

const EntityRadar3D: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[400px] relative bg-black/60 rounded-3xl overflow-hidden border border-gold/10">
      <Canvas camera={{ position: [0, 0, 40], fov: 45 }}>
        <color attach="background" args={['#020408']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <RadarNodes />

        {/* Radar scan sweep effect (Simulated with rotating ring) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[14, 15, 64]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.15} />
        </mesh>

        <gridHelper args={[60, 20, 0x1a4060, 0x050c12]} position={[0, -20, 0]} />
      </Canvas>

      {/* Overlays */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">ENTITY_NETWORK_RADAR</div>
        <div className="text-2xl font-black text-white tracking-tighter">CLUSTER_OMNIPRESENCE</div>
      </div>

      <div className="absolute bottom-6 right-6 flex space-x-4 text-[9px] font-mono text-gray-500 uppercase">
        <div className="flex items-center space-x-1">
          <div className="size-1.5 bg-red-500 rounded-full animate-pulse" />
          <span>Critical Threat</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="size-1.5 bg-blue-400 rounded-full" />
          <span>Active Observer</span>
        </div>
      </div>
    </div>
  );
};

export default EntityRadar3D;
