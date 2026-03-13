// src/hub/shared/three/BloomSetup.ts
import * as THREE from 'three';
import { EffectComposer } from 'three-stdlib';
import { RenderPass } from 'three-stdlib';
import { UnrealBloomPass } from 'three-stdlib';

export function createBloomPass(
  renderer: THREE.WebGLRenderer, 
  scene: THREE.Scene, 
  camera: THREE.Camera,
  params = { strength: 1.5, radius: 0.4, threshold: 0.85 }
) {
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    params.strength,
    params.radius,
    params.threshold
  );

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  return { composer, bloomPass };
}
