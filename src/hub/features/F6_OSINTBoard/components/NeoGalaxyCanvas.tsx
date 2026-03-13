// src/hub/features/F6_OSINTBoard/components/NeoGalaxyCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { SceneManager } from '../../../shared/three/SceneManager';
import { createBloomPass } from '../../../shared/three/BloomSetup';
import { WebGLDetector } from '../../../shared/three/WebGLDetector';
import { ForceEngine3D } from './ForceEngine3D';
import { GalaxyNode } from './GalaxyNode';
import { EnergyPulseEdge } from './EnergyPulseEdge';

interface NeoGalaxyCanvasProps {
  nodes: any[];
  edges: any[];
  onNodeClick?: (nodeId: string) => void;
}

const NeoGalaxyCanvas: React.FC<NeoGalaxyCanvasProps> = ({ nodes, edges, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneManager = useRef<SceneManager | null>(null);
  const forceEngine = useRef<ForceEngine3D | null>(null);
  const [nodeMeshes, setNodeMeshes] = useState<Map<string, GalaxyNode>>(new Map());

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new SceneManager(containerRef.current, {
      background: '#020208',
      distance: 200
    });
    sceneManager.current = manager;

    const { composer } = createBloomPass(manager.renderer, manager.scene, manager.camera);
    
    forceEngine.current = new ForceEngine3D(nodes, edges);

    // Initial Node Creation
    const meshMap = new Map<string, GalaxyNode>();
    nodes.forEach(node => {
      const gNode = new GalaxyNode(node);
      manager.scene.add(gNode.mesh);
      meshMap.set(node.id, gNode);
    });
    setNodeMeshes(meshMap);

    manager.animate((time) => {
      // Update node positions from force engine
      nodes.forEach(node => {
        const mesh = meshMap.get(node.id);
        if (mesh && node.x) {
          mesh.updatePosition(node.x, node.y, node.z || 0);
        }
      });
      composer.render();
    });

    return () => manager.stop();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-move">
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full flex items-center space-x-2">
          <div className="size-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em]">Neo-Galaxy Engine v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default NeoGalaxyCanvas;
