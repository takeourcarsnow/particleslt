import type { SettingsType } from './config-types';
import type { Particle, PointerState } from './types';
import { PARTICLE_SIZE, X, Y, VX, VY, R, M, INV_M, HEAT } from './types';

// Copied utility functions
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

function hash(n: number) { n = (n << 13) ^ n; return 1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0; }
function noise2D(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const s = (t: number) => t * t * (3 - 2 * t);
  const h = (ix: number, iy: number) => hash(ix * 374761393 + iy * 668265263);
  const v00 = h(xi, yi), v10 = h(xi + 1, yi), v01 = h(xi, yi + 1), v11 = h(xi + 1, yi + 1);
  const u = s(xf), v = s(yf);
  return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v) * 0.5 + 0.5;
}
function curlNoise(x: number, y: number, t: number, scale = 0.003, amp = 1.0) {
  const eps = 1.5;
  noise2D(x * scale, y * scale + t); // warm
  const nx1 = noise2D((x + eps) * scale, y * scale + t);
  const nx2 = noise2D((x - eps) * scale, y * scale + t);
  const ny1 = noise2D(x * scale, (y + eps) * scale + t);
  const ny2 = noise2D(x * scale, (y - eps) * scale + t);
  const dx = (nx1 - nx2) / (2 * eps);
  const dy = (ny1 - ny2) / (2 * eps);
  return { x: amp * (dy), y: amp * (-dx) };
}
function flowNoiseVec(x: number, y: number, t: number, scale = 0.002, amp = 1.0) {
  const theta = noise2D(x * scale + t * 0.31, y * scale - t * 0.17) * TAU * 2;
  return { x: Math.cos(theta) * amp, y: Math.sin(theta) * amp };
}
function LCG(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
}
function mapBoundaries(v: string) {
  if (v === 'bounce') return 'screen-bounce';
  if (v === 'wrap') return 'screen-wrap';
  return v;
}

// Precomputed noise fields
const GRID_SIZE = 128;
let curlX: Float32Array | null = null;
let curlY: Float32Array | null = null;
let flowX: Float32Array | null = null;
let flowY: Float32Array | null = null;
let windX: Float32Array | null = null;
let windY: Float32Array | null = null;
let gustX: Float32Array | null = null;
let gustY: Float32Array | null = null;

// Cached wells
let cachedWells: { x: number; y: number; sign: number }[] | null = null;

function precomputeNoiseFields(BW: number, BH: number, tt: number, sca: number, amp: number, settings: SettingsType) {
  const size = GRID_SIZE;
  curlX = new Float32Array(size * size);
  curlY = new Float32Array(size * size);
  flowX = new Float32Array(size * size);
  flowY = new Float32Array(size * size);
  windX = new Float32Array(size * size);
  windY = new Float32Array(size * size);
  gustX = new Float32Array(size * size);
  gustY = new Float32Array(size * size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = (i / (size - 1)) * BW;
      const y = (j / (size - 1)) * BH;
      const idx = i + j * size;
      // curl
      const c = curlNoise(x, y, tt, sca, amp * settings.forces.curlStrength);
      curlX[idx] = c.x;
      curlY[idx] = c.y;
      // flow
      const f = flowNoiseVec(x, y, tt, sca, amp);
      flowX[idx] = f.x;
      flowY[idx] = f.y;
      // wind
      const w = flowNoiseVec(x * 0.7, y * 0.7, tt, sca * 0.6, settings.forces.windVar || 0);
      windX[idx] = w.x;
      windY[idx] = w.y;
      // gust
      const g = flowNoiseVec(x * 0.3, y * 0.3, tt * 1.7, sca * 0.4, settings.forces.windGust || 0);
      gustX[idx] = g.x;
      gustY[idx] = g.y;
    }
  }
}

function sampleBilinear(arr: Float32Array, x: number, y: number, BW: number, BH: number): number {
  const size = GRID_SIZE;
  const fx = (x / BW) * (size - 1);
  const fy = (y / BH) * (size - 1);
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const ux = fx - ix;
  const uy = fy - iy;
  const i00 = Math.max(0, Math.min(size - 1, ix)) + Math.max(0, Math.min(size - 1, iy)) * size;
  const i10 = Math.max(0, Math.min(size - 1, ix + 1)) + Math.max(0, Math.min(size - 1, iy)) * size;
  const i01 = Math.max(0, Math.min(size - 1, ix)) + Math.max(0, Math.min(size - 1, iy + 1)) * size;
  const i11 = Math.max(0, Math.min(size - 1, ix + 1)) + Math.max(0, Math.min(size - 1, iy + 1)) * size;
  const v00 = arr[i00];
  const v10 = arr[i10];
  const v01 = arr[i01];
  const v11 = arr[i11];
  const v0 = lerp(v00, v10, ux);
  const v1 = lerp(v01, v11, ux);
  return lerp(v0, v1, uy);
}

// Grid functions
const grid: Map<number, number[]> = new Map();
let gridCell = 16;

function buildGrid(particles: Float32Array, maxRadius: number) {
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

function neighbors(i: number, particles: Float32Array, maxRadius: number) {
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

// Forces
function computeWellsPositions(t: number, settings: SettingsType, BW: number, BH: number) {
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

interface PhysicsMessage {
  type: 'update';
  particles: Particle[];
  settings: SettingsType;
  time: number;
  pointer: PointerState;
  canvasWidth: number;
  canvasHeight: number;
  substeps: number;
  dt: number;
  collisionsEnable: boolean;
  heatDecay: number;
  gDir: { x: number; y: number };
  mouseGravity: { x: number; y: number };
  mouseSetsGravity: boolean;
}

self.onmessage = (e: MessageEvent<PhysicsMessage>) => {
  const data = e.data;
  if (data.type !== 'update') return;

  const numParticles = data.particles.length;
  const particles = new Float32Array(numParticles * PARTICLE_SIZE);
  for (let i = 0; i < numParticles; i++) {
    const p = data.particles[i];
    const base = i * PARTICLE_SIZE;
    particles[base + X] = p.x;
    particles[base + Y] = p.y;
    particles[base + VX] = p.vx;
    particles[base + VY] = p.vy;
    particles[base + R] = p.r;
    particles[base + M] = p.m;
    particles[base + INV_M] = p.invM;
    particles[base + HEAT] = p.heat;
  }
  let maxRadius = 0;
  for (let i = 0; i < numParticles; i++) {
    maxRadius = Math.max(maxRadius, particles[i * PARTICLE_SIZE + R]);
  }
  const settings = data.settings;
  const time = data.time;
  const pointer = data.pointer;
  const BW = data.canvasWidth, BH = data.canvasHeight;
  let sub = data.substeps | 0;
  if (sub < 1) sub = 1;
  const dt = data.dt;
  const h = dt / sub;
  const gmag = settings.physics.gravity;
  const sourceG = data.mouseSetsGravity ? data.mouseGravity : data.gDir;
  const gxBase = sourceG.x * gmag * settings.physics.tiltSensitivity;
  const gyBase = sourceG.y * gmag * settings.physics.tiltSensitivity;
  const bMode = mapBoundaries(settings.physics.boundaries);
  const tm = settings.forces.turbulenceMode;
  const amp = settings.forces.amplitude;
  const sca = settings.forces.scale;
  const tscale = settings.forces.timeScale;
  const tt = time * tscale;
  const ptrActive = settings.pointer.enabled && pointer.active;
  let wells: { x: number; y: number; sign: number }[] | null = null;
  if (tm === 'wells') {
    if (!settings.forces.wellsMove && cachedWells) {
      wells = cachedWells;
    } else {
      wells = computeWellsPositions(time, settings, BW, BH);
      if (!settings.forces.wellsMove) {
        cachedWells = wells;
      }
    }
  }

  if (tm === 'flow' || tm === 'curl' || tm === 'wind') {
    precomputeNoiseFields(BW, BH, tt, sca, amp, settings);
  }

  if (data.collisionsEnable && settings.collisions.mode !== 'none') { buildGrid(particles, maxRadius); }

  for (let s = 0; s < sub; s++) {
    for (let i = 0; i < numParticles; i++) {
      const base = i * PARTICLE_SIZE;
      const axBase = gxBase * particles[base + INV_M] + settings.physics.windX * particles[base + INV_M];
      const ayBase = gyBase * particles[base + INV_M] + settings.physics.windY * particles[base + INV_M];
      let ax = axBase;
      let ay = ayBase;
      if (tm === 'flow') {
        const vx = sampleBilinear(flowX!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
        const vy = sampleBilinear(flowY!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
        ax += vx;
        ay += vy;
      } else if (tm === 'curl') {
        const vx = sampleBilinear(curlX!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
        const vy = sampleBilinear(curlY!, particles[base + X], particles[base + Y], BW, BH) * particles[base + INV_M];
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
        const vx = (sampleBilinear(windX!, particles[base + X], particles[base + Y], BW, BH) + sampleBilinear(gustX!, particles[base + X], particles[base + Y], BW, BH)) * particles[base + INV_M];
        const vy = (sampleBilinear(windY!, particles[base + X], particles[base + Y], BW, BH) + sampleBilinear(gustY!, particles[base + X], particles[base + Y], BW, BH)) * particles[base + INV_M];
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
      const drag = settings.physics.airDrag;
      particles[base + VX] += (ax - particles[base + VX] * drag) * h;
      particles[base + VY] += (ay - particles[base + VY] * drag) * h;
      particles[base + X] += particles[base + VX] * h;
      particles[base + Y] += particles[base + VY] * h;
      if (settings.particles.colorMode === 'heat') {
        const speed2 = particles[base + VX] * particles[base + VX] + particles[base + VY] * particles[base + VY];
        particles[base + HEAT] = particles[base + HEAT] * data.heatDecay + Math.max(0, Math.min(0.05, speed2 * 0.000001));
      }
      const e = settings.physics.restitution;
      const wf = settings.physics.wallFriction;
      if (bMode === 'screen-bounce') {
        const BW2 = BW, BH2 = BH;
        if (particles[base + X] < particles[base + R]) {
          particles[base + X] = particles[base + R];
          if (particles[base + VX] < 0) {
            const vt = particles[base + VY];
            particles[base + VX] = -particles[base + VX] * e;
            particles[base + VY] = vt * (1 - wf);
          }
        } else if (particles[base + X] > BW2 - particles[base + R]) {
          particles[base + X] = BW2 - particles[base + R];
          if (particles[base + VX] > 0) {
            const vt = particles[base + VY];
            particles[base + VX] = -particles[base + VX] * e;
            particles[base + VY] = vt * (1 - wf);
          }
        }
        if (particles[base + Y] < particles[base + R]) {
          particles[base + Y] = particles[base + R];
          if (particles[base + VY] < 0) {
            const vt = particles[base + VX];
            particles[base + VY] = -particles[base + VY] * e;
            particles[base + VX] = vt * (1 - wf);
          }
        } else if (particles[base + Y] > BH2 - particles[base + R]) {
          particles[base + Y] = BH2 - particles[base + R];
          if (particles[base + VY] > 0) {
            const vt = particles[base + VX];
            particles[base + VY] = -particles[base + VY] * e;
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
        const dist = Math.hypot(dx, dy) || 1e-6;
        const allow = Math.max(2, R - particles[base + R]);
        if (dist > allow) {
          const nx = dx / dist, ny = dy / dist;
          particles[base + X] = cx + nx * allow;
          particles[base + Y] = cy + ny * allow;
          const vn = particles[base + VX] * nx + particles[base + VY] * ny;
          particles[base + VX] = particles[base + VX] - (1 + e) * vn * nx;
          particles[base + VY] = particles[base + VY] - (1 + e) * vn * ny;
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
            particles[base + VX] = -particles[base + VX] * e;
            particles[base + VY] = vt * (1 - wf);
          }
        } else if (particles[base + X] > maxX) {
          particles[base + X] = maxX;
          if (particles[base + VX] > 0) {
            const vt = particles[base + VY];
            particles[base + VX] = -particles[base + VX] * e;
            particles[base + VY] = vt * (1 - wf);
          }
        }
        if (particles[base + Y] < minY) {
          particles[base + Y] = minY;
          if (particles[base + VY] < 0) {
            const vt = particles[base + VX];
            particles[base + VY] = -particles[base + VY] * e;
            particles[base + VX] = vt * (1 - wf);
          }
        } else if (particles[base + Y] > maxY) {
          particles[base + Y] = maxY;
          if (particles[base + VY] > 0) {
            const vt = particles[base + VX];
            particles[base + VY] = -particles[base + VY] * e;
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
    if (data.collisionsEnable && settings.collisions.mode !== 'none') {
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
            const d = Math.sqrt(dx * dx + dy * dy) || 1e-4;
            const nx = dx / d, ny = dy / d;
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
                const jimp = -(1 + e2) * vn / invMassSum;
                const ix = nx * jimp, iy = ny * jimp;
                particles[base + VX] -= ix * particles[base + INV_M];
                particles[base + VY] -= iy * particles[base + INV_M];
                particles[qbase + VX] += ix * particles[qbase + INV_M];
                particles[qbase + VY] += iy * particles[qbase + INV_M];
                const fr = settings.physics.particleFriction;
                const tvx = rvx - vn * nx, tvy = rvy - vn * ny;
                const tlen = Math.hypot(tvx, tvy) || 1e-6;
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
  }

  const resultParticles: Particle[] = [];
  for (let i = 0; i < numParticles; i++) {
    const base = i * PARTICLE_SIZE;
    resultParticles.push({
      x: particles[base + X],
      y: particles[base + Y],
      vx: particles[base + VX],
      vy: particles[base + VY],
      r: particles[base + R],
      m: particles[base + M],
      invM: particles[base + INV_M],
      heat: particles[base + HEAT],
      color: ''
    });
  }

  self.postMessage({ particles: resultParticles });
};