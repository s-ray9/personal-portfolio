import * as THREE from "three";

export abstract class Engine {
  protected canvas: HTMLCanvasElement;
  protected renderer: THREE.WebGLRenderer;
  protected scene: THREE.Scene;
  protected camera: THREE.OrthographicCamera;
  protected mouse: THREE.Vector2;
  protected resolution: THREE.Vector2;
  private startTime: number;
  private animationFrameId: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.animationFrameId = 0;
    this.mouse = new THREE.Vector2(0, 0);
    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.startTime = performance.now();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });

    this.renderer.setSize(this.resolution.x, this.resolution.y);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1.0, 0.0, 1.0);

    this.initEventListeners();
    this.setup();
    this.tick();
  }

  private initEventListeners(): void {
    window.addEventListener("mousemove", this.handleMouseMove, {
      passive: true,
    });
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const aspect = this.resolution.x / this.resolution.y;
    this.mouse.x = ((e.clientX / window.innerWidth) * 2.0 - 1.0) * aspect;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;
  };

  private handleResize = (): void => {
    this.resolution.set(window.innerWidth, window.innerHeight);
    this.renderer.setSize(this.resolution.x, this.resolution.y);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.onResize();
  };

  private tick = (): void => {
    this.animationFrameId = requestAnimationFrame(this.tick);
    const elapsedTime = (performance.now() - this.startTime) * 0.001;
    this.update(elapsedTime);
    this.renderer.render(this.scene, this.camera);
  };

  protected abstract setup(): void;
  protected abstract update(time: number): void;
  protected abstract onResize(): void;

  public dispose(): void {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("resize", this.handleResize);
    this.renderer.dispose();
    this.scene.clear();
  }
}
