import type { SettingsType } from './config-types';
import type { PointerState } from './types';
import { PARTICLE_SIZE, X, Y, VX, VY, INV_M, HEAT } from './types';
import { DEG, LCG } from './utils';
import { sampleBilinear, getCurlX, getCurlY, getFlowX, getFlowY, getWindX, getWindY, getGustX, getGustY } from './physics-noise';

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

  if (tm === 'flow') {
    const vx = sampleBilinear(getFlowX()!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
    const vy = sampleBilinear(getFlowY()!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
    ax += vx;
    ay += vy;
  } else if (tm === 'curl') {
    const vx = sampleBilinear(getCurlX()!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
    const vy = sampleBilinear(getCurlY()!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
    ax += vx;
    ay += vy;
  } else if (tm === 'vortex') {
    const cx = settings.forces.vortexX * BW;
    const cy = settings.forces.vortexY * BH;
    const dx = particles[base + X] - cx, dy = particles[base + Y] - cy;
    const r2 = dx * dx + dy * dy;
    const r = Math.sqrt(r2) + 1e-4;
    const strength = settings.forces.vortexStrength / Math.pow(r, settings.forces.vortexFalloff);
    let tx = -dy / r, ty = dx / r;
    if (!settings.forces.vortexCW) { tx = -tx; ty = -ty; }
    ax += tx * strength * particles[base + INV_M];
    ay += ty * strength * particles[base + INV_M];
    const cent = amp * 0.1 * particles[base + INV_M];
    ax += -dx / r * cent;
    ay += -dy / r * cent;
  } else if (tm === 'wind') {
    const vx = (sampleBilinear(getWindX()!, particles[base + X], particles[base + Y], BW, BH) + sampleBilinear(getGustX()!, particles[base + X], particles[base + Y], BW, BH)) * particles[base + INV_M];
    const vy = (sampleBilinear(getWindY()!, particles[base + X], particles[base + Y], BW, BH) + sampleBilinear(getGustY()!, particles[base + X], particles[base + Y], BW, BH)) * particles[base + INV_M];
    ax += vx;
    ay += vy;
  } else if (tm === 'jets') {
    const ang = settings.forces.jetsAngle * DEG;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const phi = ((particles[base + X] * ux + particles[base + Y] * uy) / Math.max(10, settings.forces.jetsSpacing)) * Math.PI * 2 + tt * 2.0;
    const band = Math.sin(phi);
    const F = amp * band * particles[base + INV_M];
    ax += ux * F;
    ay += uy * F;
  } else if (tm === 'swirlgrid') {
    const spacing = Math.max(20, settings.forces.swirlSpacing);
    const cxg = Math.floor(particles[base + X] / spacing) * spacing + spacing * 0.5;
    const cyg = Math.floor(particles[base + Y] / spacing) * spacing + spacing * 0.5;
    const dx = particles[base + X] - cxg, dy = particles[base + Y] - cyg;
    const r = Math.hypot(dx, dy) + 1e-3;
    let cw = settings.forces.vortexCW ? 1 : -1;
    if (settings.forces.swirlAlt) {
      const px = Math.floor(particles[base + X] / spacing), py = Math.floor(particles[base + Y] / spacing);
      if (((px + py) & 1) === 1) cw = -cw;
    }
    const tx = (-dy / r) * cw, ty = (dx / r) * cw;
    const fall = 1 / Math.pow(1 + (r / spacing), settings.forces.swirlFalloff);
    const F = amp * fall * particles[base + INV_M];
    ax += tx * F;
    ay += ty * F;
  } else if (tm === 'wells' && wells) {
    const falloff = settings.forces.wellsFalloff;
    const k = settings.forces.wellsStrength;
    for (let w = 0; w < wells.length; w++) {
      const wx = wells[w].x, wy = wells[w].y;
      const dx = wx - particles[base + X], dy = wy - particles[base + Y];
      const r = Math.hypot(dx, dy) + 1e-3;
      const nx = dx / r, ny = dy / r;
      const sgn = settings.forces.wellsRepel ? -1 : 1;
      const baseF = k / Math.pow(r, falloff);
      ax += nx * baseF * sgn * particles[base + INV_M];
      ay += ny * baseF * sgn * particles[base + INV_M];
      const cw = (w % 2 === 0 ? 1 : -1);
      const tx = -ny * cw, ty = nx * cw;
      const spin = settings.forces.wellsSpin * baseF * particles[base + INV_M];
      ax += tx * spin;
      ay += ty * spin;
    }
  }

  if (ptrActive && settings.pointer.tool !== 'none') {
    const dx = particles[base + X] - pointer.x;
    const dy = particles[base + Y] - pointer.y;
    const d2 = dx * dx + dy * dy;
    const rr = settings.pointer.radius;
    if (d2 < rr * rr) {
      const d = Math.sqrt(d2) + 1e-4;
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
  const drag = settings.physics.airDrag;
  particles[base + VX] += (ax - particles[base + VX] * drag) * h;
  particles[base + VY] += (ay - particles[base + VY] * drag) * h;
  particles[base + X] += particles[base + VX] * h;
  particles[base + Y] += particles[base + VY] * h;
  if (settings.particles.colorMode === 'heat') {
    const speed2 = particles[base + VX] * particles[base + VX] + particles[base + VY] * particles[base + VY];
    particles[base + HEAT] = particles[base + HEAT] * data.heatDecay + Math.max(0, Math.min(0.05, speed2 * 0.000001));
  }
}