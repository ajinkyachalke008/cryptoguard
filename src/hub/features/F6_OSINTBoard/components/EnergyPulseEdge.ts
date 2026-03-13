// src/hub/features/F6_OSINTBoard/components/EnergyPulseEdge.ts
import * as THREE from 'three';

export class EnergyPulseEdge {
  public line: THREE.Line;
  public particles: THREE.Points;
  private curve: THREE.QuadraticBezierCurve3;

  constructor(source: THREE.Vector3, target: THREE.Vector3, color: string) {
    const mid = new THREE.Vector3().addVectors(source, target).multiplyScalar(0.5);
    mid.y += source.distanceTo(target) * 0.3; // Raised arc

    this.curve = new THREE.QuadraticBezierCurve3(source, target, mid);
    const points = this.curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.2 });

    this.line = new THREE.Line(geometry, material);

    // Particle setup
    const pGeo = new THREE.BufferGeometry().setFromPoints([source]);
    const pMat = new THREE.PointsMaterial({ color, size: 0.5, transparent: true, blending: THREE.AdditiveBlending });
    this.particles = new THREE.Points(pGeo, pMat);
  }

  public update() {
    // Animation logic for particles along the curve
  }
}
