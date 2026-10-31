import type { SphereBuffer } from "./spheres";

interface Point {
  x: number;
  y: number;
}

export const TRAIL_LENGTH = 8;

const STEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;
const FOLLOW_RATE = 0.18;
const HEAD_RADIUS = 0.12;
const TAIL_RADIUS_LOSS = 0.75;

function radiusAt(index: number): number {
  return HEAD_RADIUS * (1 - (index / TRAIL_LENGTH) * TAIL_RADIUS_LOSS);
}

export class PointerTrail {
  private readonly target: Point = { x: 0, y: 0 };
  private readonly head: Point = { x: 0, y: 0 };
  private readonly history: Point[] = Array.from(
    { length: TRAIL_LENGTH },
    () => ({ x: 0, y: 0 }),
  );
  private pendingSeconds = 0;

  setTarget(x: number, y: number): void {
    this.target.x = x;
    this.target.y = y;
  }

  update(deltaSeconds: number): void {
    this.pendingSeconds = Math.min(
      this.pendingSeconds + deltaSeconds,
      STEP_SECONDS * MAX_STEPS_PER_FRAME,
    );

    while (this.pendingSeconds >= STEP_SECONDS) {
      this.step();
      this.pendingSeconds -= STEP_SECONDS;
    }
  }

  write(spheres: SphereBuffer, firstIndex: number): void {
    this.history.forEach((point, i) => {
      spheres.set(firstIndex + i, point.x, point.y, radiusAt(i));
    });
  }

  private step(): void {
    this.head.x += (this.target.x - this.head.x) * FOLLOW_RATE;
    this.head.y += (this.target.y - this.head.y) * FOLLOW_RATE;

    this.history.unshift({ x: this.head.x, y: this.head.y });
    this.history.pop();
  }
}
