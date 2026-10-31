const FLOATS_PER_SPHERE = 3;

export class SphereBuffer {
  readonly count: number;
  readonly data: Float32Array;

  constructor(count: number) {
    this.count = count;
    this.data = new Float32Array(count * FLOATS_PER_SPHERE);
  }

  set(index: number, x: number, y: number, radius: number): void {
    const offset = index * FLOATS_PER_SPHERE;
    this.data[offset] = x;
    this.data[offset + 1] = y;
    this.data[offset + 2] = radius;
  }
}
