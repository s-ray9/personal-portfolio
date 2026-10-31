import type { SphereBuffer } from "./spheres";

interface Range {
  min: number;
  max: number;
}

interface Blob {
  anchorX: number;
  anchorY: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  baseRadius: number;
}

const COLUMNS = 3;
const ROWS = 2;
export const BLOB_COUNT = COLUMNS * ROWS;

const GRID_EXTENT = { x: 0.75, y: 0.45 };
const DRIFT_RANGE = { x: 0.55, y: 0.48 };
const DRIFT_SPEED_X: Range = { min: 0.28, max: 0.46 };
const DRIFT_SPEED_Y: Range = { min: 0.24, max: 0.42 };
const BASE_RADIUS: Range = { min: 0.38, max: 0.5 };
const PULSE_SPEED = 1.5;
const PULSE_AMOUNT = 0.015;

function randomIn({ min, max }: Range): number {
  return min + Math.random() * (max - min);
}

function randomPhase(): number {
  return Math.random() * Math.PI * 2;
}

function evenlySpaced(index: number, count: number, extent: number): number {
  if (count === 1) return 0;
  return -extent + (index / (count - 1)) * 2 * extent;
}

export class DriftingBlobs {
  private readonly blobs: Blob[] = [];

  constructor() {
    for (let column = 0; column < COLUMNS; column++) {
      for (let row = 0; row < ROWS; row++) {
        this.blobs.push({
          anchorX: evenlySpaced(column, COLUMNS, GRID_EXTENT.x),
          anchorY: evenlySpaced(row, ROWS, GRID_EXTENT.y),
          speedX: randomIn(DRIFT_SPEED_X),
          speedY: randomIn(DRIFT_SPEED_Y),
          phaseX: randomPhase(),
          phaseY: randomPhase(),
          baseRadius: randomIn(BASE_RADIUS),
        });
      }
    }
  }

  update(
    spheres: SphereBuffer,
    firstIndex: number,
    time: number,
    halfWidth: number,
    halfHeight: number,
  ): void {
    this.blobs.forEach((blob, i) => {
      const x =
        blob.anchorX +
        Math.sin(time * blob.speedX + blob.phaseX) * DRIFT_RANGE.x;
      const y =
        blob.anchorY +
        Math.cos(time * blob.speedY + blob.phaseY) * DRIFT_RANGE.y;
      const radius =
        blob.baseRadius + Math.sin(time * PULSE_SPEED + i) * PULSE_AMOUNT;

      spheres.set(firstIndex + i, x * halfWidth, y * halfHeight, radius);
    });
  }
}
