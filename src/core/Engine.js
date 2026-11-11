import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export class Engine {
  constructor(container) {
    this.container = container;
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('quality');
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    this.quality = ['low', 'medium', 'high'].includes(requested)
      ? requested
      : (coarse ? 'low' : 'medium');
    this.lowQuality = this.quality === 'low';
    this.useSSAO = this.quality === 'high';
    this.useBloom = this.quality !== 'low';
    this.pixelRatioCap = this.quality === 'high' ? 1.75 : this.quality === 'medium' ? 1.4 : 1;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.pixelRatioCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = !this.lowQuality;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.style.outline = 'none';
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      63, window.innerWidth / window.innerHeight, 0.08, 460,
    );
    this.camera.rotation.order = 'YXZ';

    this.scene = null;
    this.elapsed = 0;
    this.clock = new THREE.Clock();
    this._loop = null;

    // 后处理：SSAO + Bloom + ACES 输出
    this.composer = null;
    this.renderPass = null;
    this.ssaoPass = null;

    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 240));
  }

  _buildComposer() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // SSAO 需要额外渲染法线/深度，是最高开销的一档，只在 quality=high 时启用。
    if (this.useSSAO) {
      this.ssaoPass = new SSAOPass(this.scene, this.camera, w, h);
      this.ssaoPass.kernelRadius = 7;
      this.ssaoPass.minDistance = 0.0015;
      this.ssaoPass.maxDistance = 0.07;
      this.composer.addPass(this.ssaoPass);
    }

    if (this.useBloom) {
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.26, 0.55, 0.86);
      this.composer.addPass(this.bloomPass);
    }

    this.composer.addPass(new OutputPass());
    this._syncComposerSize();
  }

  _syncComposerSize() {
    if (!this.composer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(w, h);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.pixelRatioCap));
    this.renderer.setSize(w, h);
    this._syncComposerSize();
  }

  setScene(scene) {
    this.scene = scene;
    if (this.lowQuality) return;
    if (!this.composer) {
      this._buildComposer();
      return;
    }
    this.renderPass.scene = scene;
    if (this.ssaoPass) this.ssaoPass.scene = scene;
  }

  _render() {
    if (!this.scene) return;
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  start(cb) {
    this._loop = cb;
    this.resume();
  }

  resume() {
    this.clock.start();
    this.renderer.setAnimationLoop(() => {
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.elapsed += dt;
      if (this._loop) this._loop(dt, this.elapsed);
      this._render();
    });
  }

  pause() {
    this.renderer.setAnimationLoop(null);
  }

  renderOnce() {
    this._render();
  }
}
