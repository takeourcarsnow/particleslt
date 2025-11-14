import { PARTICLE_SIZE, X, Y } from '../../types/types';

// Grid functions
const grid: Map<number, number[]> = new Map();
let gridCell = 16;

export function buildGrid(particles: Float32Array, maxRadius: number) {
  grid.clear();
  gridCell = Math.max(8, maxRadius * 2);
  const numParticles = particles.length / PARTICLE_SIZE;
  for (let i = 0; i < numParticles; i++) {
    const base = i * PARTICLE_SIZE;
    const cx = (particles[base + X] / gridCell) | 0, cy = (particles[base + Y] / gridCell) | 0;
    const key = (cx << 16) ^ cy;
    let list = grid.get(key);
    if (!list) { list = []; grid.set(key, list); }
    list.push(i);
  }
}

export function neighbors(i: number, particles: Float32Array, maxRadius: number) {
  const res: number[] = [];
  const base = i * PARTICLE_SIZE;
  const cx = (particles[base + X] / gridCell) | 0, cy = (particles[base + Y] / gridCell) | 0;
  const searchRange = Math.ceil(2 * maxRadius / gridCell);
  for (let ox = -searchRange; ox <= searchRange; ox++) {
    for (let oy = -searchRange; oy <= searchRange; oy++) {
      const key = ((cx + ox) << 16) ^ (cy + oy);
      const list = grid.get(key);
      if (list) for (const j of list) { if (j !== i) res.push(j); }
    }
  }
  // Sort by distance to prioritize closer particles
  res.sort((a, b) => {
    const ba = a * PARTICLE_SIZE, bb = b * PARTICLE_SIZE;
    const dxa = particles[ba + X] - particles[base + X], dya = particles[ba + Y] - particles[base + Y];
    const dxb = particles[bb + X] - particles[base + X], dyb = particles[bb + Y] - particles[base + Y];
    return (dxa * dxa + dya * dya) - (dxb * dxb + dyb * dyb);
  });
  // Cap neighbors to improve performance
  const maxNeighbors = 64;
  if (res.length > maxNeighbors) res.length = maxNeighbors;
  return res;
}















