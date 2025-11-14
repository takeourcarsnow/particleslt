import type { Particle } from '../../types/types';
import { PARTICLE_SIZE, X, Y, VX, VY, R, M, INV_M, HEAT } from '../../types/types';

export function particlesToFloat32Array(particles: Particle[]): Float32Array {
  const numParticles = particles.length;
  const array = new Float32Array(numParticles * PARTICLE_SIZE);
  for (let i = 0; i < numParticles; i++) {
    const p = particles[i];
    const base = i * PARTICLE_SIZE;
    array[base + X] = p.x;
    array[base + Y] = p.y;
    array[base + VX] = p.vx;
    array[base + VY] = p.vy;
    array[base + R] = p.r;
    array[base + M] = p.m;
    array[base + INV_M] = p.invM;
    array[base + HEAT] = p.heat;
  }
  return array;
}

export function float32ArrayToParticles(array: Float32Array): Particle[] {
  const numParticles = array.length / PARTICLE_SIZE;
  const particles: Particle[] = [];
  for (let i = 0; i < numParticles; i++) {
    const base = i * PARTICLE_SIZE;
    particles.push({
      x: array[base + X],
      y: array[base + Y],
      vx: array[base + VX],
      vy: array[base + VY],
      r: array[base + R],
      m: array[base + M],
      invM: array[base + INV_M],
      heat: array[base + HEAT],
      color: ''
    });
  }
  return particles;
}

export function getMaxRadius(particles: Float32Array): number {
  let maxRadius = 0;
  const numParticles = particles.length / PARTICLE_SIZE;
  for (let i = 0; i < numParticles; i++) {
    maxRadius = Math.max(maxRadius, particles[i * PARTICLE_SIZE + R]);
  }
  return maxRadius;
}















