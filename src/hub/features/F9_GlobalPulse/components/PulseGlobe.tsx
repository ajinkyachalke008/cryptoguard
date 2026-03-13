// src/hub/features/F9_GlobalPulse/components/PulseGlobe.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../../shared/three/SceneManager';
import { createBloomPass } from '../../../shared/three/BloomSetup';
import { EarthSphere } from './EarthSphere';
import { FlowArc } from './FlowArc';

interface PulseGlobeProps {
  flows: any[];
  autoRotate: boolean;
  bloomStrength: number;
}

const PulseGlobe: React.FC<PulseGlobeProps> = ({ flows, autoRotate, bloomStrength }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManager = useRef<SceneManager | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current, {
      background: '#02040c',
      distance: 50
    });
    sceneManager.current = manager;

    const { composer, bloomPass } = createBloomPass(manager.renderer, manager.scene, manager.camera);
    
    // Starfield Background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPositions[i] = (Math.random() - 0.5) * 1000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.5, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    manager.scene.add(stars);

    const earth = new EarthSphere();
    manager.scene.add(earth.mesh);
    manager.scene.add(earth.atmosphere);

    // Clear old arcs before adding new ones
    const existingArcs = manager.scene.children.filter(child => child.userData.type === 'arc');
    existingArcs.forEach(arc => manager.scene.remove(arc));

    // Arcs
    flows.forEach(flow => {
      const start = latLngToVector3(flow.source.lat, flow.source.lng, 15);
      const end = latLngToVector3(flow.target.lat, flow.target.lng, 15);
      const arc = new FlowArc(start, end, flow.type === 'bridge' ? '#00E5FF' : '#00C853');
      arc.mesh.userData = { type: 'arc' }; // Tag for cleanup
      manager.scene.add(arc.mesh);
    });

    manager.animate(() => {
      if (autoRotate) earth.update();
      bloomPass.strength = bloomStrength;
      composer.render();
    });

    return () => manager.stop();
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default PulseGlobe;
