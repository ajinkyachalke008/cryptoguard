// src/hub/shared/three/SceneManager.ts
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private frameId: number | null = null;

  constructor(container: HTMLElement, options: any = {}) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(options.background || '#050510');

    this.camera = new THREE.PerspectiveCamera(
      options.fov || 60,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 0, options.distance || 150);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onWindowResize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  public animate(callback?: (time: number) => void) {
    const run = (time: number) => {
      this.frameId = requestAnimationFrame(run);
      this.controls.update();
      if (callback) callback(time);
      this.renderer.render(this.scene, this.camera);
    };
    this.frameId = requestAnimationFrame(run);
  }

  public stop() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}
