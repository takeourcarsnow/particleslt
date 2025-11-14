import type { SettingsType } from '../config/types';
import { PARTICLE_SIZE, X, Y, VX, VY, R, M, INV_M, HEAT } from '../../types/types';
import { neighbors } from './grid';

export function handleCollisions(
  particles: Float32Array,
  numParticles: number,
  maxRadius: number,
  settings: SettingsType,
  h: number
) {
  const mode = settings.collisions.mode;
  const cap = settings.performance.collisionCap | 0;
  const rest = settings.physics.restitution * (mode === 'inelastic' ? (1 - settings.collisions.inelasticity) : 1);

  for (let i = 0; i < numParticles; i++) {
    const base = i * PARTICLE_SIZE;
    const neigh = neighbors(i, particles, maxRadius);
    let handled = 0;
    for (let idx = 0; idx < neigh.length; idx++) {
      const j = neigh[idx];
      if (j <= i) continue;
      const qbase = j * PARTICLE_SIZE;
      const dx = particles[qbase + X] - particles[base + X], dy = particles[qbase + Y] - particles[base + Y];
      const sr = particles[base + R] + particles[qbase + R];
      if (dx * dx + dy * dy <= sr * sr) {
        let d = Math.sqrt(dx * dx + dy * dy);
        // If particles are exactly on top of each other (d == 0) or extremely close,
        // use a small random separation direction. Otherwise nx/ny will be 0 and
        // positional correction won't separate them which can lead to instability.
        let nx: number, ny: number;
        if (d < 1e-3) {
          // Small fixed unit vector
          nx = 1;
          ny = 0;
          d = 1e-3; // avoid division by zero downstream
        } else {
          nx = dx / d; ny = dy / d;
        }
        const overlap = sr - d;
        if (mode === 'soft') {
          const k = settings.collisions.softness;
          const push = overlap * 0.5 * k;
          particles[base + X] -= nx * push;
          particles[base + Y] -= ny * push;
          particles[qbase + X] += nx * push;
          particles[qbase + Y] += ny * push;
          const rvx = particles[qbase + VX] - particles[base + VX], rvy = particles[qbase + VY] - particles[base + VY];
          const vn = rvx * nx + rvy * ny;
          const damp = (1 + rest) * 0.5 * vn;
          const invMass = 1 / (particles[base + M] + particles[qbase + M]);
          particles[base + VX] += nx * damp * invMass * particles[qbase + M];
          particles[base + VY] += ny * damp * invMass * particles[qbase + M];
          particles[qbase + VX] -= nx * damp * invMass * particles[base + M];
          particles[qbase + VY] -= ny * damp * invMass * particles[base + M];
        } else {
          const correction = overlap * 0.5;
          particles[base + X] -= nx * correction;
          particles[base + Y] -= ny * correction;
          particles[qbase + X] += nx * correction;
          particles[qbase + Y] += ny * correction;
          const rvx = particles[qbase + VX] - particles[base + VX], rvy = particles[qbase + VY] - particles[base + VY];
          const vn = rvx * nx + rvy * ny;
          if (vn < 0) {
            const e2 = rest;
            const invMassSum = 1 / particles[base + M] + 1 / particles[qbase + M];
            const jimp = Math.max(-100, Math.min(100, -(1 + e2) * vn / invMassSum));
            const ix = nx * jimp, iy = ny * jimp;
            particles[base + VX] -= ix * particles[base + INV_M];
            particles[base + VY] -= iy * particles[base + INV_M];
            particles[qbase + VX] += ix * particles[qbase + INV_M];
            particles[qbase + VY] += iy * particles[qbase + INV_M];
            const fr = settings.physics.particleFriction;
            const tvx = rvx - vn * nx, tvy = rvy - vn * ny;
            const tlen = Math.hypot(tvx, tvy) || 1e-4;
            const tx = tlen ? tvx / tlen : 0, ty = tlen ? tvy / tlen : 0;
            const jt = -fr * jimp;
            particles[base + VX] -= tx * jt * particles[base + INV_M];
            particles[base + VY] -= ty * jt * particles[base + INV_M];
            particles[qbase + VX] += tx * jt * particles[qbase + INV_M];
            particles[qbase + VY] += ty * jt * particles[qbase + INV_M];
            if (settings.particles.colorMode === 'heat') {
              const loss = (1 - rest) * Math.abs(vn) * 0.02;
              particles[base + HEAT] = Math.max(0, Math.min(1.2, particles[base + HEAT] + loss));
              particles[qbase + HEAT] = Math.max(0, Math.min(1.2, particles[qbase + HEAT] + loss));
            }
          }
        }
        handled++;
        if (handled > cap) break;
      }
    }
  }
}
















