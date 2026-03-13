// src/hub/features/F9_GlobalPulse/components/EarthSphere.ts
import * as THREE from 'three';

export class EarthSphere {
  public mesh: THREE.Mesh;
  public atmosphere: THREE.Mesh;

  constructor() {
    const geometry = new THREE.SphereGeometry(15, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      color: '#0D47A1',
      emissive: '#0D47A1',
      emissiveIntensity: 0.1,
      shininess: 5
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // Earth Glow Rim
    const rimGeo = new THREE.SphereGeometry(15.2, 64, 64);
    const rimMat = new THREE.MeshPhongMaterial({
      color: '#00E5FF',
      transparent: true,
      opacity: 0.2,
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    this.mesh.add(rim);

    // Basic Atmosphere
    const atmoGeo = new THREE.SphereGeometry(17, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: '#00E5FF',
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    this.atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
  }

  public update() {
    this.mesh.rotation.y += 0.001;
    this.atmosphere.rotation.y += 0.001;
  }
}
