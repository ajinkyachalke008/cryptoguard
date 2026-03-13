// src/hub/features/F9_GlobalPulse/components/FlowArc.ts
import * as THREE from 'three';

export class FlowArc {
  public mesh: THREE.Mesh;

  constructor(start: THREE.Vector3, end: THREE.Vector3, color: string) {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(15 + start.distanceTo(end) * 0.5);

    const curve = new THREE.QuadraticBezierCurve3(start, end, mid);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });

    this.mesh = new THREE.Mesh(geometry, material);
  }
}
