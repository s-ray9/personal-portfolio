import { BLOB_COUNT, DriftingBlobs } from "./blobs";
import { createProgram, injectDefines } from "./gl";
import { PointerTrail, TRAIL_LENGTH } from "./pointer-trail";
import vertexSource from "./shaders/fullscreen.vert?raw";
import fragmentSource from "./shaders/liquid.frag?raw";
import { SphereBuffer } from "./spheres";

interface LiquidProgram {
  program: WebGLProgram;
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  spheres: WebGLUniformLocation | null;
}

const RENDER_SCALE = 1.0;
const NOISE_SEED_RANGE = 100;

function createLiquidProgram(
  gl: WebGL2RenderingContext,
  sphereCount: number,
  noiseSeed: number,
): LiquidProgram {
  const program = createProgram(
    gl,
    vertexSource,
    injectDefines(fragmentSource, { SPHERE_COUNT: sphereCount }),
  );
  gl.useProgram(program);
  gl.uniform1f(gl.getUniformLocation(program, "uNoiseSeed"), noiseSeed);

  return {
    program,
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    spheres: gl.getUniformLocation(program, "uSpheres"),
  };
}

export class LiquidBackground {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGL2RenderingContext;
  private readonly blobs = new DriftingBlobs();
  private readonly trail = new PointerTrail();
  private readonly spheres = new SphereBuffer(BLOB_COUNT + TRAIL_LENGTH);
  private readonly noiseSeed = Math.random() * NOISE_SEED_RANGE;
  private readonly animated = !window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  private readonly resizeObserver: ResizeObserver;

  private liquid: LiquidProgram;
  private halfWidth = 1;
  private halfHeight = 1;
  private frameId = 0;
  private startTime: number | null = null;
  private previousTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      depth: false,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("WebGL2 is not available");

    this.canvas = canvas;
    this.gl = gl;
    this.liquid = createLiquidProgram(gl, this.spheres.count, this.noiseSeed);
    this.resize();

    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(canvas);
    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored);

    if (this.animated) {
      window.addEventListener("pointermove", this.handlePointerMove, {
        passive: true,
      });
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  dispose(): void {
    cancelAnimationFrame(this.frameId);
    window.removeEventListener("pointermove", this.handlePointerMove);
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener(
      "webglcontextrestored",
      this.handleContextRestored,
    );
    this.resizeObserver.disconnect();
    this.gl.deleteProgram(this.liquid.program);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  private handlePointerMove = (event: PointerEvent): void => {
    const { left, top, width, height } = this.canvas.getBoundingClientRect();
    const shortSide = Math.min(width, height);

    this.trail.setTarget(
      ((event.clientX - left) * 2 - width) / shortSide,
      (height - (event.clientY - top) * 2) / shortSide,
    );
  };

  private handleResize = (): void => {
    this.resize();
    if (!this.animated) this.draw(0);
  };

  private handleContextLost = (event: Event): void => {
    event.preventDefault();
    cancelAnimationFrame(this.frameId);
  };

  private handleContextRestored = (): void => {
    this.liquid = createLiquidProgram(
      this.gl,
      this.spheres.count,
      this.noiseSeed,
    );
    this.applyViewport();

    if (this.animated) {
      this.frameId = requestAnimationFrame(this.tick);
    } else {
      this.draw(0);
    }
  };

  private resize(): void {
    const width = Math.max(
      1,
      Math.round(this.canvas.clientWidth * RENDER_SCALE),
    );
    const height = Math.max(
      1,
      Math.round(this.canvas.clientHeight * RENDER_SCALE),
    );
    if (width === this.canvas.width && height === this.canvas.height) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.applyViewport();

    const shortSide = Math.min(width, height);
    this.halfWidth = width / shortSide;
    this.halfHeight = height / shortSide;
  }

  private applyViewport(): void {
    const { width, height } = this.canvas;
    this.gl.viewport(0, 0, width, height);
    this.gl.uniform2f(this.liquid.resolution, width, height);
  }

  private tick = (now: number): void => {
    this.frameId = requestAnimationFrame(this.tick);

    if (this.startTime === null) this.startTime = now;
    const time = (now - this.startTime) / 1000;

    this.trail.update(time - this.previousTime);
    this.previousTime = time;

    this.draw(time);
  };

  private draw(time: number): void {
    const { gl, spheres, liquid } = this;

    this.blobs.update(spheres, 0, time, this.halfWidth, this.halfHeight);
    this.trail.write(spheres, BLOB_COUNT);

    gl.uniform1f(liquid.time, time);
    gl.uniform3fv(liquid.spheres, spheres.data);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
