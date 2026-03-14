// src/hub/shared/NeuralSync.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BrainCircuit, Cpu, Zap, Activity, ShieldCheck, Database, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

export const NeuralSync: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [thinking, setThinking] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;
    let isCleanedUp = false;
    let animationId = 0;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Neural Nodes
    const group = new THREE.Group();
    scene.add(group);

    const nodeCount = 50;
    const nodes: THREE.Mesh[] = [];
    const positions = new Float32Array(nodeCount * 3);

    const nodeGeo = new THREE.SphereGeometry(2, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.8 });

    for(let i=0; i<nodeCount; i++) {
       const m = new THREE.Mesh(nodeGeo, nodeMat);
       m.position.set(
         (Math.random() - 0.5) * 200,
         (Math.random() - 0.5) * 200,
         (Math.random() - 0.5) * 200
       );
       group.add(m);
       nodes.push(m);
    }

    // Connect nodes with lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.1 });
    const connections: THREE.Line[] = [];

    for(let i=0; i<nodeCount; i++) {
       const nearNodes = nodes.filter(n => n.position.distanceTo(nodes[i].position) < 60);
       nearNodes.forEach(nn => {
          const g = new THREE.BufferGeometry().setFromPoints([nodes[i].position, nn.position]);
          const l = new THREE.Line(g, lineMat);
          group.add(l);
          connections.push(l);
       });
    }

    const animate = () => {
      if (isCleanedUp) return;
      animationId = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      
      // Pulse nodes
      nodes.forEach((n, i) => {
         const scale = 1 + Math.sin(Date.now() * 0.005 + i) * 0.5;
         n.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationId);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative group bg-[#020202] rounded-[4rem] border border-gold/20 overflow-hidden shadow-[inset_0_0_100px_rgba(255,215,0,0.05)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.05),transparent)]" />
      
      <div className="absolute top-16 left-16 z-20 pointer-events-none space-y-8">
         <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-6 animate-pulse">
              <BrainCircuit size={14} /> NEURAL_SYNC_UPLINK
            </div>
            <h3 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
              AI_REASONING <br/><span className="text-gold">SPECTRE</span>
            </h3>
            <p className="max-w-xs text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] leading-relaxed italic border-l-2 border-gold/20 pl-6">
               Visualizing the heuristic neural pathways of ARIA's risk assessment engine.
            </p>
         </motion.div>

         <div className="flex flex-col gap-4 max-w-sm">
            {[
              { id: 'PATH_MORPH', status: 'ACTIVE', color: 'text-gold' },
              { id: 'HEURISTIC_WEIGHT', status: 'SYNCHRONIZED', color: 'text-emerald-400' },
              { id: 'RISK_TENSOR', status: 'CALIBRATED', color: 'text-cyan-400' }
            ].map(item => (
               <div key={item.id} className="flex justify-between items-center p-4 bg-black/60 border border-white/10 rounded-2xl backdrop-blur-xl">
                  <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{item.id}</span>
                  <span className={`text-[9px] font-black uppercase ${item.color}`}>{item.status}</span>
               </div>
            ))}
         </div>
      </div>

      <div className="absolute bottom-16 right-16 z-20 text-right space-y-2">
         <div className="text-[11px] text-gray-600 font-black uppercase tracking-[0.5em] italic flex items-center gap-2 justify-end">
            <Fingerprint className="size-4" /> BIOMETRIC_REASONING_V2.0
         </div>
         <div className="text-[8px] text-gray-800 font-mono mt-2 uppercase">Core: NEURAL_ENGINE // Processing: 1.2TFLOPS</div>
      </div>
      
      {/* HUD Elements Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 border-[30px] border-[#020202] mix-blend-multiply opacity-40" />
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
    </div>
  );
};
