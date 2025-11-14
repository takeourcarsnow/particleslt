import type { SettingsType } from './config-types';
import { PARTICLE_SIZE, X, Y, VX, VY, R } from './types';

export function handleBoundaries(particles: Float32Array, numParticles: number, settings: SettingsType, BW: number, BH: number) {
  const rest = settings.physics.restitution;
  const wf = settings.physics.wallFriction;
  const containerRest = 0; // Reduce bouncing in containers to prevent instability
  const bMode = settings.physics.boundaries;

  for (let i = 0; i < numParticles; i++) {
    const base = i * PARTICLE_SIZE;
    if (bMode === 'screen-bounce') {
      const BW2 = BW, BH2 = BH;
      if (particles[base + X] < particles[base + R]) {
        particles[base + X] = particles[base + R];
        if (particles[base + VX] < 0) {
          const vt = particles[base + VY];
          particles[base + VX] = -particles[base + VX] * rest;
          particles[base + VY] = vt * (1 - wf);
        }
      } else if (particles[base + X] > BW2 - particles[base + R]) {
        particles[base + X] = BW2 - particles[base + R];
        if (particles[base + VX] > 0) {
          const vt = particles[base + VY];
          particles[base + VX] = -particles[base + VX] * rest;
          particles[base + VY] = vt * (1 - wf);
        }
      }
      if (particles[base + Y] < particles[base + R]) {
        particles[base + Y] = particles[base + R];
        if (particles[base + VY] < 0) {
          const vt = particles[base + VX];
          particles[base + VY] = -particles[base + VY] * rest;
          particles[base + VX] = vt * (1 - wf);
        }
      } else if (particles[base + Y] > BH2 - particles[base + R]) {
        particles[base + Y] = BH2 - particles[base + R];
        if (particles[base + VY] > 0) {
          const vt = particles[base + VX];
          particles[base + VY] = -particles[base + VY] * rest;
          particles[base + VX] = vt * (1 - wf);
        }
      }
    } else if (bMode === 'screen-wrap') {
      if (particles[base + X] < -particles[base + R]) particles[base + X] = BW + particles[base + R];
      if (particles[base + X] > BW + particles[base + R]) particles[base + X] = -particles[base + R];
      if (particles[base + Y] < -particles[base + R]) particles[base + Y] = BH + particles[base + R];
      if (particles[base + Y] > BH + particles[base + R]) particles[base + Y] = -particles[base + R];
    } else if (bMode === 'container-circle') {
      const cx = settings.physics.container.cx * BW;
      const cy = settings.physics.container.cy * BH;
      const R = settings.physics.container.radiusN * (Math.min(BW, BH) / 2);
      const dx = particles[base + X] - cx, dy = particles[base + Y] - cy;
      const dist = Math.hypot(dx, dy) || 1e-4;
      const allow = Math.max(2, R - particles[base + R]);
      if (dist > allow) {
        const nx = dx / dist, ny = dy / dist;
        particles[base + X] = cx + nx * allow;
        particles[base + Y] = cy + ny * allow;
        const vn = particles[base + VX] * nx + particles[base + VY] * ny;
        particles[base + VX] = particles[base + VX] - (1 + containerRest) * vn * nx;
        particles[base + VY] = particles[base + VY] - (1 + containerRest) * vn * ny;
        const tnx = -ny, tny = nx;
        const vt = particles[base + VX] * tnx + particles[base + VY] * tny;
        particles[base + VX] -= tnx * vt * wf;
        particles[base + VY] -= tny * vt * wf;
      }
    } else if (bMode === 'container-square') {
      const cx = settings.physics.container.cx * BW;
      const cy = settings.physics.container.cy * BH;
      const half = settings.physics.container.sizeN * (Math.min(BW, BH) / 2);
      const minX = cx - half + particles[base + R], maxX = cx + half - particles[base + R];
      const minY = cy - half + particles[base + R], maxY = cy + half - particles[base + R];
      if (particles[base + X] < minX) {
        particles[base + X] = minX;
        if (particles[base + VX] < 0) {
          const vt = particles[base + VY];
          particles[base + VX] = -particles[base + VX] * containerRest;
          particles[base + VY] = vt * (1 - wf);
        }
      } else if (particles[base + X] > maxX) {
        particles[base + X] = maxX;
        if (particles[base + VX] > 0) {
          const vt = particles[base + VY];
          particles[base + VX] = -particles[base + VX] * containerRest;
          particles[base + VY] = vt * (1 - wf);
        }
      }
      if (particles[base + Y] < minY) {
        particles[base + Y] = minY;
        if (particles[base + VY] < 0) {
          const vt = particles[base + VX];
          particles[base + VY] = -particles[base + VY] * containerRest;
          particles[base + VX] = vt * (1 - wf);
        }
      } else if (particles[base + Y] > maxY) {
        particles[base + Y] = maxY;
        if (particles[base + VY] > 0) {
          const vt = particles[base + VX];
          particles[base + VY] = -particles[base + VY] * containerRest;
          particles[base + VX] = vt * (1 - wf);
        }
      }
    } else {
      if (particles[base + X] < -BW) particles[base + X] = BW * 2;
      if (particles[base + X] > BW * 2) particles[base + X] = -BW;
      if (particles[base + Y] < -BH) particles[base + Y] = BH * 2;
      if (particles[base + Y] > BH * 2) particles[base + Y] = -BH;
    }
  }
}