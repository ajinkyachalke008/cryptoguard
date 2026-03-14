// src/hub/shared/GlyphDNA.tsx
'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Fingerprint, Zap, Target, Activity, ShieldCheck, Database, Grid3X3, Dna } from 'lucide-react';
import { motion } from 'framer-motion';

export const GlyphDNA: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mountRef.current) return;
    let isCleanedUp = false;
    let animationId = 0;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // Helix Group
    const helix = new THREE.Group();
    scene.add(helix);

    const points = 100;
    const radius = 30;
    const heightStep = 1.5;

    for (let i = 0; i < points; i++) {
        const theta = (i / points) * Math.PI * 10;
        const x = Math.cos(theta) * radius;
        const y = (i - points / 2) * heightStep;
        const z = Math.sin(theta) * radius;

        const sphereGeo = new THREE.SphereGeometry(2, 12, 12);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        sphere.position.set(x, y, z);
        helix.add(sphere);

        // Counter-helix
        const sphere2 = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0x00E5FF }));
        sphere2.position.set(-x, y, -z);
        helix.add(sphere2);

        // Connection line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, z), new THREE.Vector3(-x, y, -z)]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2 });
        helix.add(new THREE.Line(lineGeo, lineMat));
    }

    const animate = () => {
      if (isCleanedUp) return;
      animationId = requestAnimationFrame(animate);
      helix.rotation.y += 0.02;
      helix.rotation.z += 0.005;
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
    <div ref={mountRef} className="w-full h-full relative group bg-black rounded-[4rem] border border-gold/20 overflow-hidden shadow-[0_0_80px_rgba(255,215,0,0.05)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.1),transparent)]" />
      
      <div className="absolute top-12 left-12 z-20 pointer-events-none">
         <div className="flex items-center gap-3 px-6 py-2 bg-gold/10 border border-gold/30 rounded-full text-[10px] font-black text-gold uppercase tracking-[0.5em] mb-4 animate-pulse">
            <Dna size={14} /> GLYPH_DNA_SYNTHESIS
         </div>
         <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
            BEHAVIORAL <br/><span className="text-gold">SIGNATURE</span>
         </h3>
         <div className="text-[8px] text-gray-500 font-mono font-bold tracking-[0.3em] uppercase italic bg-black/40 px-3 py-1 rounded w-fit">ID: 8842-ESI-PROBE</div>
      </div>

      <div className="absolute top-12 right-12 z-20 space-y-4">
         {[
           { label: 'Density', val: '84.2%' },
           { label: 'Frequency', val: 'HIGH' },
           { label: 'Mutations', val: 'DETECTED' }
         ].map(item => (
            <div key={item.label} className="text-right">
               <div className="text-[7px] text-gray-600 font-black uppercase tracking-widest">{item.label}</div>
               <div className="text-[11px] text-white font-black italic">{item.val}</div>
            </div>
         ))}
      </div>

      <div className="absolute bottom-12 left-12 right-12 z-20 flex justify-between items-end">
         <div className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
            <Grid3X3 size={14} /> MAPPING_SEQUENCE...
         </div>
         <div className="text-[7px] text-white/20 font-mono italic">Forensic DNA Profiling v2.1</div>
      </div>

      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
};
