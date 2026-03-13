// src/hub/features/F6_OSINTBoard/components/GalaxyNode.ts
import * as THREE from 'three';

export class GalaxyNode {
  public mesh: THREE.Mesh;
  public data: any;

  constructor(data: any) {
    this.data = data;
    const geometry = new THREE.SphereGeometry(data.size || 1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: data.color || '#808080',
      emissive: data.color || '#808080',
      emissiveIntensity: data.intensity || 0.4,
      metalness: 0.8,
      roughness: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { id: data.id, type: 'node' };
  }

  public updatePosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
  }
}
