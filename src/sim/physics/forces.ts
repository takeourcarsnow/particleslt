import type { SettingsType } from '../config/types';
import type { PointerState } from '../../types/types';
import { PARTICLE_SIZE, X, Y, VX, VY, INV_M, HEAT } from '../../types/types';
import { DEG, LCG } from '../../utils/utils';
import { sampleBilinear, getCurlX, getCurlY, getFlowX, getFlowY, getWindX, getWindY, getGustX, getGustY } from './noise';
import { turbulenceForArray } from './turbulence';

export function computeWellsPositions(t: number, settings: SettingsType, BW: number, BH: number) {
  const rng = LCG(settings.forces.wellsSeed);
  const n = Math.max(1, Math.min(8, Math.round(settings.forces.wellsCount)));
  const res: { x: number; y: number; sign: number }[] = [];
  for (let i = 0; i < n; i++) {
    const bx = 0.15 + 0.7 * rng();
    const by = 0.15 + 0.7 * rng();
    let x = bx * BW, y = by * BH;
    if (settings.forces.wellsMove) {
      const phase = i * 1.7;
      x += Math.sin(t * 0.6 + phase) * 0.12 * Math.min(BW, BH);
      y += Math.cos(t * 0.5 + phase * 1.3) * 0.10 * Math.min(BW, BH);
    }
    res.push({ x, y, sign: (i % 2 === 0 ? 1 : -1) });
  }
  return res;
}

export function applyForces(
  particles: Float32Array,
  i: number,
  settings: SettingsType,
  time: number,
  pointer: PointerState,
  BW: number,
  BH: number,
  tm: string,
  amp: number,
  sca: number,
  tscale: number,
  tt: number,
  ptrActive: boolean,
  wells: { x: number; y: number; sign: number }[] | null,
  h: number,
  data: any
): { ax: number; ay: number } {
  const base = i * PARTICLE_SIZE;
  const gxBase = (data.mouseSetsGravity ? data.mouseGravity.x : data.gDir.x) * settings.physics.gravity * settings.physics.tiltSensitivity;
  const gyBase = (data.mouseSetsGravity ? data.mouseGravity.y : data.gDir.y) * settings.physics.gravity * settings.physics.tiltSensitivity;
  let ax = gxBase * particles[base + INV_M] + settings.physics.windX * particles[base + INV_M];
  let ay = gyBase * particles[base + INV_M] + settings.physics.windY * particles[base + INV_M];

  // use centralized turbulence helper for float-array worker path
  const turb = turbulenceForArray(
    particles,
    base,
    tt,
    tm,
    settings,
    BW,
    BH,
    sampleBilinear,
    getFlowX,
    getFlowY,
    getCurlX,
    getCurlY,
    getWindX,
    getWindY,
    getGustX,
    getGustY,
    wells
  );
  ax += turb.ax;
  ay += turb.ay;

  if (ptrActive && settings.pointer.tool !== 'none') {
    const dx = particles[base + X] - pointer.x;
    const dy = particles[base + Y] - pointer.y;
    const d2 = dx * dx + dy * dy;
    const rr = settings.pointer.radius;
    if (d2 < rr * rr) {
      const d = Math.sqrt(d2) + 1e-3;
      const nx = dx / d, ny = dy / d;
      const fall = 1 - d / rr;
      const F = settings.pointer.strength * fall * fall * particles[base + INV_M];
      if (settings.pointer.tool === 'attract') {
        ax += -nx * F;
        ay += -ny * F;
      } else if (settings.pointer.tool === 'repel') {
        ax += nx * F;
        ay += ny * F;
      } else if (settings.pointer.tool === 'push') {
        ax += (pointer.dx * 60) * fall * particles[base + INV_M];
        ay += (pointer.dy * 60) * fall * particles[base + INV_M];
      } else if (settings.pointer.tool === 'spin') {
        ax += (-ny) * F * 0.8;
        ay += (nx) * F * 0.8;
      }
    }
  }

  return { ax, ay };
}

export function applyIntegration(particles: Float32Array, i: number, ax: number, ay: number, h: number, settings: SettingsType, data: any) {
  const base = i * PARTICLE_SIZE;
  // Clamp accelerations
  const clampedAx = Math.max(-500, Math.min(500, ax));
  const clampedAy = Math.max(-500, Math.min(500, ay));
  const drag = settings.physics.airDrag;
  particles[base + VX] += (clampedAx - particles[base + VX] * drag) * h;
  particles[base + VY] += (clampedAy - particles[base + VY] * drag) * h;
  // Clamp velocities
  particles[base + VX] = Math.max(-1000, Math.min(1000, particles[base + VX]));
  particles[base + VY] = Math.max(-1000, Math.min(1000, particles[base + VY]));
  particles[base + X] += particles[base + VX] * h;
  particles[base + Y] += particles[base + VY] * h;
  if (settings.particles.colorMode === 'heat') {
    const speed2 = particles[base + VX] * particles[base + VX] + particles[base + VY] * particles[base + VY];
    particles[base + HEAT] = particles[base + HEAT] * data.heatDecay + Math.max(0, Math.min(0.05, speed2 * 0.000001));
  }
}
















