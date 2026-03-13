// src/hub/features/F6_OSINTBoard/components/ClusterGravityGroup.ts
import * as THREE from 'three';

export class ClusterGravityGroup {
  public mesh: THREE.Mesh;

  constructor(nodes: any[], clusterId: string) {
    // Basic logic to create a translucent sphere around a cluster of nodes
    const geometry = new THREE.SphereGeometry(20, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color: '#FFD700',
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData = { clusterId, type: 'cluster' };
  }

  public update(center: THREE.Vector3, radius: number) {
    this.mesh.position.copy(center);
    this.mesh.scale.setScalar(radius / 20); // Normalized scale
  }
}
