import vertexShader from "./shaders/background.vert?raw";
import fragmentShader from "./shaders/liquid.frag?raw";

const CONFIG = {
  TRAIL_LENGTH: 8,
  SMOOTHING_INTERPOLATION: 0.18,
  MAX_PIXEL_RATIO: 2,
} as const;

export class Pipeline {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private buffer!: WebGLBuffer;
  private vs!: WebGLShader;
  private fs!: WebGLShader;

  private trailData: Float32Array;
  private currentMouse = { x: 0, y: 0 };
  private targetMouse = { x: 0, y: 0 };
  private startTime: number;
  private animationFrameId: number | null = null;

  private uResolutionLoc!: WebGLUniformLocation | null;
  private uTimeLoc!: WebGLUniformLocation | null;
  private uPointerTrailLoc!: WebGLUniformLocation | null;
  private uRandomSeedLoc!: WebGLUniformLocation | null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    })!;
    this.startTime = performance.now();
    this.trailData = new Float32Array(CONFIG.TRAIL_LENGTH * 2);

    this.initWebGL();
    this.initEventListeners();
    this.tick();
  }

  private compileShader(source: string, type: number): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${log}`);
    }
    return shader;
  }

  private initWebGL(): void {
    const gl = this.gl;
    this.vs = this.compileShader(vertexShader, gl.VERTEX_SHADER);
    this.fs = this.compileShader(fragmentShader, gl.FRAGMENT_SHADER);

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Pipeline linking failed: ${gl.getProgramInfoLog(this.program)}`,
      );
    }

    gl.useProgram(this.program);

    this.uResolutionLoc = gl.getUniformLocation(this.program, "uResolution");
    this.uTimeLoc = gl.getUniformLocation(this.program, "uTime");
    this.uPointerTrailLoc = gl.getUniformLocation(
      this.program,
      "uPointerTrail",
    );
    this.uRandomSeedLoc = gl.getUniformLocation(this.program, "uRandomSeed");

    if (this.uRandomSeedLoc) {
      gl.uniform1f(this.uRandomSeedLoc, Math.random() * 100.0);
    }

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    this.resize();
  }

  private initEventListeners(): void {
    window.addEventListener("mousemove", this.handleMouseMove, {
      passive: true,
    });
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const aspect = window.innerWidth / window.innerHeight;
    this.targetMouse.x = ((e.clientX / window.innerWidth) * 2.0 - 1.0) * aspect;
    this.targetMouse.y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;
  };

  private handleResize = (): void => {
    this.resize();
  };

  private resize(): void {
    const pixelRatio = Math.min(
      window.devicePixelRatio,
      CONFIG.MAX_PIXEL_RATIO,
    );
    const targetWidth = Math.floor(window.innerWidth * pixelRatio);
    const targetHeight = Math.floor(window.innerHeight * pixelRatio);

    if (
      this.canvas.width !== targetWidth ||
      this.canvas.height !== targetHeight
    ) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private tick = (): void => {
    this.animationFrameId = requestAnimationFrame(this.tick);
    const gl = this.gl;
    const time = (performance.now() - this.startTime) * 0.001;

    this.currentMouse.x +=
      (this.targetMouse.x - this.currentMouse.x) *
      CONFIG.SMOOTHING_INTERPOLATION;
    this.currentMouse.y +=
      (this.targetMouse.y - this.currentMouse.y) *
      CONFIG.SMOOTHING_INTERPOLATION;

    for (let i = CONFIG.TRAIL_LENGTH - 1; i > 0; i--) {
      this.trailData[i * 2] = this.trailData[(i - 1) * 2];
      this.trailData[i * 2 + 1] = this.trailData[(i - 1) * 2 + 1];
    }
    this.trailData[0] = this.currentMouse.x;
    this.trailData[1] = this.currentMouse.y;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);

    if (this.uResolutionLoc) {
      gl.uniform2f(this.uResolutionLoc, this.canvas.width, this.canvas.height);
    }
    if (this.uTimeLoc) {
      gl.uniform1f(this.uTimeLoc, time);
    }
    if (this.uPointerTrailLoc) {
      gl.uniform1fv(this.uPointerTrailLoc, this.trailData);
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  public dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("resize", this.handleResize);

    const gl = this.gl;
    gl.deleteBuffer(this.buffer);
    gl.deleteShader(this.vs);
    gl.deleteShader(this.fs);
    gl.deleteProgram(this.program);
  }
}
