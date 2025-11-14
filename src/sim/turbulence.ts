import { DEG, LCG } from './utils';
import { curlNoise, flowNoiseVec } from './utils';
import type { SettingsType } from './config-types';

// Helper used by main-thread physics (objects)
export function turbulenceForParticle(
  x: number,
  y: number,
  tt: number,
  tm: string,
  Settings: any
) {
  const amp = Settings.forces.amplitude;
  const sca = Settings.forces.scale;
  let ax = 0, ay = 0;

  if (tm === 'vortex') {
    // main-loop provides BW/BH; callers must compute cx/cy and pass via Settings.forces.vortexX/Y
    const cx = Settings.forces.vortexX * (Settings.canvasW || 1);
    const cy = Settings.forces.vortexY * (Settings.canvasH || 1);
    const dx = x - cx, dy = y - cy;
    const r = Math.hypot(dx, dy) + 1e-3;
    const strength = Math.min(100, Settings.forces.vortexStrength / Math.pow(r, Settings.forces.vortexFalloff));
    let tx = -dy / r, ty = dx / r;
    if (!Settings.forces.vortexCW) { tx = -tx; ty = -ty; }
    ax += tx * strength; ay += ty * strength;
    const cent = amp * 0.1;
    ax += -dx / r * cent; ay += -dy / r * cent;
  } else if (tm === 'jets') {
    const ang = Settings.forces.jetsAngle * DEG;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const phi = ((x * ux + y * uy) / Math.max(10, Settings.forces.jetsSpacing)) * Math.PI * 2 + tt * 2.0;
    const band = Math.sin(phi);
    const F = amp * band;
    ax += ux * F; ay += uy * F;
  } else if (tm === 'swirlgrid') {
    const spacing = Math.max(20, Settings.forces.swirlSpacing);
    const cxg = Math.floor(x / spacing) * spacing + spacing * 0.5;
    const cyg = Math.floor(y / spacing) * spacing + spacing * 0.5;
    const dx = x - cxg, dy = y - cyg;
    const r = Math.hypot(dx, dy) + 1e-2;
    let cw = Settings.forces.vortexCW ? 1 : -1;
    if (Settings.forces.swirlAlt) {
      const px = Math.floor(x / spacing), py = Math.floor(y / spacing);
      if (((px + py) & 1) === 1) cw = -cw;
    }
    const tx = (-dy / r) * cw, ty = (dx / r) * cw;
    const fall = 1 / Math.pow(1 + (r / spacing), Settings.forces.swirlFalloff);
    const F = amp * fall;
    ax += tx * F; ay += ty * F;
  }

  else if (tm === 'wells') {
    // Multi-well attractor/repel mode for main-thread particle path.
    const falloff = Settings.forces.wellsFalloff;
    const k = Settings.forces.wellsStrength;
    const BW = Settings.canvasW || 1;
    const BH = Settings.canvasH || 1;
    const rng = LCG(Settings.forces.wellsSeed);
    const n = Math.max(1, Math.min(8, Math.round(Settings.forces.wellsCount)));
    for (let i = 0; i < n; i++) {
      const bx = 0.15 + 0.7 * rng();
      const by = 0.15 + 0.7 * rng();
      let wx = bx * BW, wy = by * BH;
      if (Settings.forces.wellsMove) {
        const phase = i * 1.7;
        wx += Math.sin(tt * 0.6 + phase) * 0.12 * Math.min(BW, BH);
        wy += Math.cos(tt * 0.5 + phase * 1.3) * 0.10 * Math.min(BW, BH);
      }
      const dx = wx - x, dy = wy - y;
      const r = Math.hypot(dx, dy) + 1e-2;
      const nx = dx / r, ny = dy / r;
      const sgn = Settings.forces.wellsRepel ? -1 : 1;
      const baseF = Math.min(100, k / Math.pow(r, falloff));
      ax += nx * baseF * sgn;
      ay += ny * baseF * sgn;
      const cw = (i % 2 === 0 ? 1 : -1);
      const tx = -ny * cw, ty = nx * cw;
      const spin = Settings.forces.wellsSpin * baseF;
      ax += tx * spin; ay += ty * spin;
    }
  } else if (tm === 'perlin') {
    // Multi-octave curl noise for complex organic patterns
    const c1 = curlNoise(x, y, tt, sca, amp);
    const c2 = curlNoise(x * 0.5, y * 0.5, tt * 1.3, sca * 0.7, amp * 0.3);
    const c3 = curlNoise(x * 0.25, y * 0.25, tt * 2.1, sca * 0.4, amp * 0.1);
    ax += c1.x + c2.x + c3.x;
    ay += c1.y + c2.y + c3.y;
  } else if (tm === 'clusters') {
    // Multiple small vortex clusters creating organic swirling
    const spacing = Math.max(80, Settings.forces.swirlSpacing * 1.5);
    const cxg = Math.floor(x / spacing) * spacing + spacing * 0.5;
    const cyg = Math.floor(y / spacing) * spacing + spacing * 0.5;
    const dx = x - cxg, dy = y - cyg;
    const r = Math.hypot(dx, dy) + 1e-2;
    const cw = (Math.floor(x / spacing) + Math.floor(y / spacing)) % 2 === 0 ? 1 : -1;
    const tx = (-dy / r) * cw, ty = (dx / r) * cw;
    const fall = Math.exp(-r * r / (spacing * spacing * 0.25));
    const F = amp * fall;
    ax += tx * F; ay += ty * F;
    // Add some curl for more organic movement
    const curl = curlNoise(x, y, tt, sca * 0.8, amp * 0.2);
    ax += curl.x; ay += curl.y;
  } else if (tm === 'waves') {
    // Harmonic waves creating interference patterns
    const wave1 = Math.sin(x * 0.01 + tt * 2.0) * Math.cos(y * 0.008 + tt * 1.5);
    const wave2 = Math.sin(x * 0.006 + y * 0.009 + tt * 1.8) * 0.7;
    const wave3 = Math.sin((x + y) * 0.005 + tt * 2.5) * 0.5;
    const totalWave = (wave1 + wave2 + wave3) * amp * 0.3;
    ax += Math.cos(x * 0.01 + tt * 2.0) * totalWave;
    ay += Math.sin(y * 0.008 + tt * 1.5) * totalWave;
  }

  return { x: ax, y: ay };
}

// Helper used by worker (float arrays). Sample functions are passed in to avoid coupling.
export function turbulenceForArray(
  particles: Float32Array,
  base: number,
  tt: number,
  tm: string,
  settings: SettingsType,
  BW: number,
  BH: number,
  sampleBilinear: (arr: Float32Array, x:number, y:number, BW:number, BH:number)=>number,
  getFlowX: ()=>Float32Array|null,
  getFlowY: ()=>Float32Array|null,
  getCurlX: ()=>Float32Array|null,
  getCurlY: ()=>Float32Array|null,
  getWindX: ()=>Float32Array|null,
  getWindY: ()=>Float32Array|null,
  getGustX: ()=>Float32Array|null,
  getGustY: ()=>Float32Array|null,
  wells: {x:number;y:number;sign:number}[]|null
) {
  const X = 0, Y = 1, INV_M = 4;
  const x = particles[base + X], y = particles[base + Y];
  const amp = settings.forces.amplitude;
  let ax = 0, ay = 0;

  if (tm === 'vortex') {
    const cx = settings.forces.vortexX * BW;
    const cy = settings.forces.vortexY * BH;
    const dx = x - cx, dy = y - cy;
    const r = Math.sqrt(dx*dx + dy*dy) + 1e-3;
    const strength = Math.min(100, settings.forces.vortexStrength / Math.pow(r, settings.forces.vortexFalloff));
    let tx = -dy / r, ty = dx / r;
    if (!settings.forces.vortexCW) { tx = -tx; ty = -ty; }
    ax += tx * strength * particles[base + INV_M];
    ay += ty * strength * particles[base + INV_M];
    const cent = amp * 0.1 * particles[base + INV_M];
    ax += -dx / r * cent; ay += -dy / r * cent;
  } else if (tm === 'jets') {
    const ang = settings.forces.jetsAngle * DEG;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    const phi = ((x * ux + y * uy) / Math.max(10, settings.forces.jetsSpacing)) * Math.PI * 2 + tt * 2.0;
    const band = Math.sin(phi);
    const F = amp * band * particles[base + INV_M];
    ax += ux * F; ay += uy * F;
  } else if (tm === 'swirlgrid') {
    const spacing = Math.max(20, settings.forces.swirlSpacing);
    const cxg = Math.floor(x / spacing) * spacing + spacing * 0.5;
    const cyg = Math.floor(y / spacing) * spacing + spacing * 0.5;
    const dx = x - cxg, dy = y - cyg;
    const r = Math.hypot(dx, dy) + 1e-2;
    let cw = settings.forces.vortexCW ? 1 : -1;
    if (settings.forces.swirlAlt) {
      const px = Math.floor(x / spacing), py = Math.floor(y / spacing);
      if (((px + py) & 1) === 1) cw = -cw;
    }
    const tx = (-dy / r) * cw, ty = (dx / r) * cw;
    const fall = 1 / Math.pow(1 + (r / spacing), settings.forces.swirlFalloff);
    const F = amp * fall * particles[base + INV_M];
    ax += tx * F; ay += ty * F;
  } else if (tm === 'wells' && wells) {
    const falloff = settings.forces.wellsFalloff;
    const k = settings.forces.wellsStrength;
    for (let w = 0; w < wells.length; w++) {
      const wx = wells[w].x, wy = wells[w].y;
      const dx = wx - x, dy = wy - y;
      const r = Math.hypot(dx, dy) + 1e-2;
      const nx = dx / r, ny = dy / r;
      const sgn = settings.forces.wellsRepel ? -1 : 1;
      const baseF = Math.min(100, k / Math.pow(r, falloff));
      ax += nx * baseF * sgn * particles[base + INV_M];
      ay += ny * baseF * sgn * particles[base + INV_M];
      const cw = (w % 2 === 0 ? 1 : -1);
      const tx = -ny * cw, ty = nx * cw;
      const spin = settings.forces.wellsSpin * baseF * particles[base + INV_M];
      ax += tx * spin; ay += ty * spin;
    }
  } else if (tm === 'perlin') {
    // Multi-octave curl noise for complex organic patterns - same as main thread
    const c1 = curlNoise(x, y, tt, settings.forces.scale, amp);
    const c2 = curlNoise(x * 0.5, y * 0.5, tt * 1.3, settings.forces.scale * 0.7, amp * 0.3);
    const c3 = curlNoise(x * 0.25, y * 0.25, tt * 2.1, settings.forces.scale * 0.4, amp * 0.1);
    ax += (c1.x + c2.x + c3.x) * particles[base + INV_M];
    ay += (c1.y + c2.y + c3.y) * particles[base + INV_M];
  } else if (tm === 'clusters') {
    // Multiple small vortex clusters creating organic swirling
    const spacing = Math.max(80, settings.forces.swirlSpacing * 1.5);
    const cxg = Math.floor(x / spacing) * spacing + spacing * 0.5;
    const cyg = Math.floor(y / spacing) * spacing + spacing * 0.5;
    const dx = x - cxg, dy = y - cyg;
    const r = Math.hypot(dx, dy) + 1e-2;
    const cw = (Math.floor(x / spacing) + Math.floor(y / spacing)) % 2 === 0 ? 1 : -1;
    const tx = (-dy / r) * cw, ty = (dx / r) * cw;
    const fall = Math.exp(-r * r / (spacing * spacing * 0.25));
    const F = amp * fall * particles[base + INV_M];
    ax += tx * F; ay += ty * F;
    // Add some curl for more organic movement
    const cx = getCurlX(), cy = getCurlY();
    if (cx && cy) {
      const curlX = sampleBilinear(cx, x, y, BW, BH);
      const curlY = sampleBilinear(cy, x, y, BW, BH);
      ax += curlX * 0.2 * particles[base + INV_M];
      ay += curlY * 0.2 * particles[base + INV_M];
    }
  } else if (tm === 'waves') {
    // Harmonic waves creating interference patterns
    const wave1 = Math.sin(x * 0.01 + tt * 2.0) * Math.cos(y * 0.008 + tt * 1.5);
    const wave2 = Math.sin(x * 0.006 + y * 0.009 + tt * 1.8) * 0.7;
    const wave3 = Math.sin((x + y) * 0.005 + tt * 2.5) * 0.5;
    const totalWave = (wave1 + wave2 + wave3) * amp * 0.3 * particles[base + INV_M];
    ax += Math.cos(x * 0.01 + tt * 2.0) * totalWave;
    ay += Math.sin(y * 0.008 + tt * 1.5) * totalWave;
  }

  return { ax, ay };
}
