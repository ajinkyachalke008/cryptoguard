// src/hub/shared/QuantumFlow.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as d3 from 'd3-force-3d';
import { GitCompare, Zap, Fingerprint, Activity, MousePointer2, Info, Search, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuantumFlow: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nodesCount, setNodesCount] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;
    let isCleanedUp = false;
    let animationId = 0;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 2000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Starfield
    const stars = new THREE.BufferGeometry();
    const starPos = new Float32Array(5000 * 3);
    for(let i=0; i<5000*3; i++) starPos[i] = (Math.random() - 0.5) * 3000;
    stars.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xFFD700, size: 0.6, transparent: true, opacity: 0.3 });
    scene.add(new THREE.Points(stars, starMat));

    const nodesData = [
      { id: 'master', group: 1, val: 15, name: 'SYBIL_CENTRAL_UPLINK', risk: 'LOW' },
      ...Array.from({ length: 12 }).map((_, i) => ({ id: `m_${i}`, group: 2, val: 8, name: `SUB_CLUSTER_${i}`, risk: 'MEDIUM' })),
      ...Array.from({ length: 100 }).map((_, i) => ({ id: `n_${i}`, group: 3, val: 4, name: `NODE_ID_${Math.floor(Math.random()*10000)}`, risk: Math.random() > 0.8 ? 'HIGH' : 'LOW' }))
    ];
    const linksData = [
      ...nodesData.filter(n => n.group === 2).map(n => ({ source: 'master', target: n.id })),
      ...nodesData.filter(n => n.group === 3).map(n => ({ source: `m_${Math.floor(Math.random() * 12)}`, target: n.id }))
    ];
    setNodesCount(nodesData.length);

    const simulation = d3.forceSimulation(nodesData)
      .force('link', d3.forceLink(linksData).id((d: any) => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0, 0))
      .force('collision', d3.forceCollide().radius(30));

    const nodeMat1 = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const nodeMat2 = new THREE.MeshBasicMaterial({ color: 0x00BCD4 });
    const nodeMat3 = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.8 });

    const nodeMeshes: THREE.Mesh[] = nodesData.map(n => {
      const geo = new THREE.SphereGeometry(n.val, 16, 16);
      const m = new THREE.Mesh(geo, n.group === 1 ? nodeMat1 : n.group === 2 ? nodeMat2 : nodeMat3);
      (m as any).userData = n;
      scene.add(m);
      return m;
    });

    const linkMat = new THREE.LineBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.05 });
    const linkGeos = linksData.map(() => {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const l = new THREE.Line(g, linkMat);
      scene.add(l);
      return g;
    });

    const onMouseMove = (event: MouseEvent) => {
      const rect = mountRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    mountRef.current.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      if (isCleanedUp) return;
      animationId = requestAnimationFrame(animate);
      
      nodesData.forEach((n: any, i) => nodeMeshes[i].position.set(n.x, n.y, n.z || 0));
      linksData.forEach((l: any, i) => {
        linkGeos[i].setFromPoints([
          new THREE.Vector3(l.source.x, l.source.y, l.source.z || 0),
          new THREE.Vector3(l.target.x, l.target.y, l.target.z || 0)
        ]);
      });

      // Raycasting
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        setHoveredNode(intersects[0].object.userData);
      } else {
        setHoveredNode(null);
      }

      scene.rotation.y += 0.0015;
      scene.rotation.x += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isCleanedUp = true;
      cancelAnimationFrame(animationId);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mountRef} className="w-full h-full relative group bg-black rounded-[4rem] border border-gold/30 overflow-hidden cursor-crosshair">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent)]" />
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />

      <div className="absolute top-16 left-16 z-20 pointer-events-none space-y-8">
         <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-6 animate-pulse">
              <Zap size={14} /> QUANTUM_PROBE_ACTIVE
            </div>
            <h3 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
              INTERACTIVE <br/><span className="text-gold">MONEY TRAIL</span>
            </h3>
            <p className="max-w-xs text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] leading-relaxed italic border-l-2 border-gold/20 pl-6">
               Holographic DAG interrogation system. Hover nodes to extract forensic signatures.
            </p>
         </motion.div>

         <div className="grid grid-cols-2 gap-4 max-w-sm">
            <div className="p-6 bg-black/80 border border-gold/20 rounded-3xl backdrop-blur-3xl shadow-2xl">
               <div className="text-[9px] text-gold/60 font-black uppercase mb-2 tracking-widest">Active_Clusters</div>
               <div className="text-3xl font-black text-white font-mono tracking-tighter italic">{nodesCount}</div>
            </div>
            <div className="p-6 bg-black/80 border border-gold/20 rounded-3xl backdrop-blur-3xl shadow-2xl">
               <div className="text-[9px] text-emerald-400 font-black uppercase mb-2 tracking-widest">Spectral_Sync</div>
               <div className="text-3xl font-black text-white font-mono tracking-tighter italic">99.9%</div>
            </div>
         </div>
      </div>

      {/* Interactive Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 left-16 z-30 w-80 bg-black/90 border-2 border-gold/50 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-[0_0_80px_rgba(255,215,0,0.2)]"
          >
             <div className="flex justify-between items-start mb-6">
                <div className="text-[10px] text-gold font-black uppercase tracking-[0.3em]">Node_Intelligence</div>
                <div className={`px-3 py-1 text-[8px] font-black uppercase rounded ${hoveredNode.risk === 'HIGH' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-400'}`}>
                   RISK_{hoveredNode.risk}
                </div>
             </div>
             <div className="space-y-4">
                <div className="text-2xl font-black text-white italic uppercase tracking-tighter">{hoveredNode.name}</div>
                <div className="text-[9px] text-gray-500 font-mono break-all leading-relaxed">ADDR: 0x{Array.from({length:40}).map(() => Math.floor(Math.random()*16).toString(16)).join('')}</div>
                <div className="pt-4 border-t border-white/10 flex gap-4">
                   <div className="flex-1 text-[8px] text-gray-600 font-black uppercase">Volume: {(Math.random()*100).toFixed(2)} ETH</div>
                   <div className="flex-1 text-[8px] text-gray-600 font-black uppercase">Txs: {Math.floor(Math.random()*1000)}</div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-16 right-16 z-20 text-right space-y-2">
         <div className="text-[11px] text-gray-600 font-black uppercase tracking-[0.5em] italic">Forensic Interrogator v8.0</div>
         <div className="text-[9px] text-gold/40 font-mono tracking-[0.2em] flex items-center gap-2 justify-end uppercase">
            RAYCAST_UPLINK: ACTIVE <div className="size-1.5 bg-gold rounded-full animate-ping" />
         </div>
      </div>
    </div>
  );
};
