import { Settings } from './config';
import { State } from './state';
import { mapBoundaries, curlNoise, flowNoiseVec, DEG } from './utils';
import { buildGrid, neighbors } from './grid';
import { computeWellsPositions } from './forces';

export function simulatePhysicsStep(time: number, h: number) {
  const BW = State.canvas!.width / State.DPR, BH = State.canvas!.height / State.DPR;
  const bMode = mapBoundaries(Settings.physics.boundaries);
  const tm = Settings.forces.turbulenceMode;
  const amp = Settings.forces.amplitude;
  const sca = Settings.forces.scale;
  const tscale = Settings.forces.timeScale;
  const tt = time * tscale;
  const ptrActive = Settings.pointer.enabled && State.pointer.active;
  const wells = tm === 'wells' ? computeWellsPositions(time) : null;

  for (let i = 0; i < State.particles.length; i++) {
    const p = State.particles[i];
    const axBase = (Settings.controls.mouseSetsGravity ? State.mouseGravity.x : State.gDir.x) * Settings.physics.gravity * Settings.physics.tiltSensitivity * p.invM + Settings.physics.windX * p.invM;
    const ayBase = (Settings.controls.mouseSetsGravity ? State.mouseGravity.y : State.gDir.y) * Settings.physics.gravity * Settings.physics.tiltSensitivity * p.invM + Settings.physics.windY * p.invM;
    let ax = axBase;
    let ay = ayBase;

    if (tm === 'flow') {
      const v = flowNoiseVec(p.x, p.y, tt, sca, amp * p.invM);
      ax += v.x;
      ay += v.y;
    } else if (tm === 'curl') {
      const v = curlNoise(p.x, p.y, tt, sca, amp * Settings.forces.curlStrength * p.invM);
      ax += v.x;
      ay += v.y;
    } else if (tm === 'vortex') {
      const cx = Settings.forces.vortexX * BW;
      const cy = Settings.forces.vortexY * BH;
      const dx = p.x - cx, dy = p.y - cy;
      const r2 = dx * dx + dy * dy;
      const r = Math.sqrt(r2) + 1e-4;
      const strength = Settings.forces.vortexStrength / Math.pow(r, Settings.forces.vortexFalloff);
      let tx = -dy / r, ty = dx / r;
      if (!Settings.forces.vortexCW) { tx = -tx; ty = -ty; }
      ax += tx * strength * p.invM;
      ay += ty * strength * p.invM;
      const cent = amp * 0.1 * p.invM;
      ax += -dx / r * cent;
      ay += -dy / r * cent;
    } else if (tm === 'wind') {
      const v = flowNoiseVec(p.x * 0.7, p.y * 0.7, tt, sca * 0.6, (Settings.forces.windVar || 0));
      const gust = flowNoiseVec(p.x * 0.3, p.y * 0.3, tt * 1.7, sca * 0.4, (Settings.forces.windGust || 0));
      ax += (v.x + gust.x) * p.invM;
      ay += (v.y + gust.y) * p.invM;
    } else if (tm === 'jets') {
      const ang = Settings.forces.jetsAngle * DEG;
      const ux = Math.cos(ang), uy = Math.sin(ang);
      const phi = ((p.x * ux + p.y * uy) / Math.max(10, Settings.forces.jetsSpacing)) * Math.PI * 2 + tt * 2.0;
      const band = Math.sin(phi);
      const F = amp * band * p.invM;
      ax += ux * F;
      ay += uy * F;
    } else if (tm === 'swirlgrid') {
      const spacing = Math.max(20, Settings.forces.swirlSpacing);
      const cxg = Math.floor(p.x / spacing) * spacing + spacing * 0.5;
      const cyg = Math.floor(p.y / spacing) * spacing + spacing * 0.5;
      const dx = p.x - cxg, dy = p.y - cyg;
      const r = Math.hypot(dx, dy) + 1e-3;
      let cw = Settings.forces.vortexCW ? 1 : -1;
      if (Settings.forces.swirlAlt) {
        const px = Math.floor(p.x / spacing), py = Math.floor(p.y / spacing);
        if (((px + py) & 1) === 1) cw = -cw;
      }
      const tx = (-dy / r) * cw, ty = (dx / r) * cw;
      const fall = 1 / Math.pow(1 + (r / spacing), Settings.forces.swirlFalloff);
      const F = amp * fall * p.invM;
      ax += tx * F;
      ay += ty * F;
    } else if (tm === 'wells' && wells) {
      const falloff = Settings.forces.wellsFalloff;
      const k = Settings.forces.wellsStrength;
      for (let w = 0; w < wells.length; w++) {
        const wx = wells[w].x, wy = wells[w].y;
        const dx = wx - p.x, dy = wy - p.y;
        const r = Math.hypot(dx, dy) + 1e-3;
        const nx = dx / r, ny = dy / r;
        const sgn = Settings.forces.wellsRepel ? -1 : 1;
        const base = k / Math.pow(r, falloff);
        ax += nx * base * sgn * p.invM;
        ay += ny * base * sgn * p.invM;
        const cw = (w % 2 === 0 ? 1 : -1);
        const tx = -ny * cw, ty = nx * cw;
        const spin = Settings.forces.wellsSpin * base * p.invM;
        ax += tx * spin;
        ay += ty * spin;
      }
    }

    if (ptrActive && Settings.pointer.tool !== 'none') {
      const dx = p.x - State.pointer.x;
      const dy = p.y - State.pointer.y;
      const d2 = dx * dx + dy * dy;
      const rr = Settings.pointer.radius;
      if (d2 < rr * rr) {
        const d = Math.sqrt(d2) + 1e-4;
        const nx = dx / d, ny = dy / d;
        const fall = 1 - d / rr;
        const F = Settings.pointer.strength * fall * fall * p.invM;
        if (Settings.pointer.tool === 'attract') {
          ax += -nx * F;
          ay += -ny * F;
        } else if (Settings.pointer.tool === 'repel') {
          ax += nx * F;
          ay += ny * F;
        } else if (Settings.pointer.tool === 'push') {
          ax += (State.pointer.dx * 60) * fall * p.invM;
          ay += (State.pointer.dy * 60) * fall * p.invM;
        } else if (Settings.pointer.tool === 'spin') {
          ax += (-ny) * F * 0.8;
          ay += (nx) * F * 0.8;
        }
      }
    }

    const drag = Settings.physics.airDrag;
    p.vx += (ax - p.vx * drag) * h;
    p.vy += (ay - p.vy * drag) * h;
    p.x += p.vx * h;
    p.y += p.vy * h;
    if (Settings.particles.colorMode === 'heat') {
      const speed2 = p.vx * p.vx + p.vy * p.vy;
      p.heat = p.heat * State.heatDecay + Math.max(0, Math.min(0.05, speed2 * 0.000001));
    }
  }
}

export function handleCollisions() {
  const mode = Settings.collisions.mode;
  const cap = Settings.performance.collisionCap | 0;
  const rest = Settings.physics.restitution * (mode === 'inelastic' ? (1 - Settings.collisions.inelasticity) : 1);
  for (let i = 0; i < State.particles.length; i++) {
    const p = State.particles[i];
    const neigh = neighbors(i);
    let handled = 0;
    for (let idx = 0; idx < neigh.length; idx++) {
      const j = neigh[idx];
      if (j <= i) continue;
      const q = State.particles[j];
      const dx = q.x - p.x, dy = q.y - p.y;
      const sr = p.r + q.r;
      if (dx * dx + dy * dy <= sr * sr) {
        let d = Math.sqrt(dx * dx + dy * dy);
        let nx: number, ny: number;
        if (d < 1e-4) {
          nx = (Math.random() * 2 - 1);
          ny = (Math.random() * 2 - 1);
          const l = Math.hypot(nx, ny) || 1e-4;
          nx /= l; ny /= l;
          d = 1e-4;
        } else {
          nx = dx / d; ny = dy / d;
        }
        const overlap = sr - d;
        if (mode === 'soft') {
          const k = Settings.collisions.softness;
          const push = overlap * 0.5 * k;
          p.x -= nx * push;
          p.y -= ny * push;
          q.x += nx * push;
          q.y += ny * push;
          const rvx = q.vx - p.vx, rvy = q.vy - p.vy;
          const vn = rvx * nx + rvy * ny;
          const damp = (1 + rest) * 0.5 * vn;
          p.vx += nx * damp * (1 / (p.m + q.m)) * q.m;
          p.vy += ny * damp * (1 / (p.m + q.m)) * q.m;
          q.vx -= nx * damp * (1 / (p.m + q.m)) * p.m;
          q.vy -= ny * damp * (1 / (p.m + q.m)) * p.m;
        } else {
          const correction = overlap * 0.5;
          p.x -= nx * correction;
          p.y -= ny * correction;
          q.x += nx * correction;
          q.y += ny * correction;
          const rvx = q.vx - p.vx, rvy = q.vy - p.vy;
          const vn = rvx * nx + rvy * ny;
          if (vn < 0) {
            const e2 = rest;
            const invMassSum = 1 / p.m + 1 / q.m;
            const jimp = -(1 + e2) * vn / invMassSum;
            const ix = nx * jimp, iy = ny * jimp;
            p.vx -= ix * p.invM;
            p.vy -= iy * p.invM;
            q.vx += ix * q.invM;
            q.vy += iy * q.invM;
            const fr = Settings.physics.particleFriction;
            const tvx = rvx - vn * nx, tvy = rvy - vn * ny;
            const tlen = Math.hypot(tvx, tvy) || 1e-6;
            const tx = tlen ? tvx / tlen : 0, ty = tlen ? tvy / tlen : 0;
            const jt = -fr * jimp;
            p.vx -= tx * jt * p.invM;
            p.vy -= ty * jt * p.invM;
            q.vx += tx * jt * q.invM;
            q.vy += ty * jt * q.invM;
            if (Settings.particles.colorMode === 'heat') {
              const loss = (1 - rest) * Math.abs(vn) * 0.02;
              p.heat = Math.max(0, Math.min(1.2, p.heat + loss));
              q.heat = Math.max(0, Math.min(1.2, q.heat + loss));
            }
          }
        }
        handled++;
        if (handled > cap) break;
      }
    }
  }
}

export function handleBoundaries() {
  const BW = State.canvas!.width / State.DPR, BH = State.canvas!.height / State.DPR;
  const bMode = mapBoundaries(Settings.physics.boundaries);
  const rest = Settings.physics.restitution;
  const wf = Settings.physics.wallFriction;
  const containerRest = rest;
  for (let i = 0; i < State.particles.length; i++) {
    const p = State.particles[i];
    if (bMode === 'screen-bounce') {
      const BW2 = BW, BH2 = BH;
      if (p.x < p.r) {
        p.x = p.r;
        if (p.vx < 0) {
          const vt = p.vy;
          p.vx = -p.vx * rest;
          p.vy = vt * (1 - wf);
        }
      } else if (p.x > BW2 - p.r) {
        p.x = BW2 - p.r;
        if (p.vx > 0) {
          const vt = p.vy;
          p.vx = -p.vx * rest;
          p.vy = vt * (1 - wf);
        }
      }
      if (p.y < p.r) {
        p.y = p.r;
        if (p.vy < 0) {
          const vt = p.vx;
          p.vy = -p.vy * rest;
          p.vx = vt * (1 - wf);
        }
      } else if (p.y > BH2 - p.r) {
        p.y = BH2 - p.r;
        if (p.vy > 0) {
          const vt = p.vx;
          p.vy = -p.vy * rest;
          p.vx = vt * (1 - wf);
        }
      }
    } else if (bMode === 'screen-wrap') {
      if (p.x < -p.r) p.x = BW + p.r;
      if (p.x > BW + p.r) p.x = -p.r;
      if (p.y < -p.r) p.y = BH + p.r;
      if (p.y > BH + p.r) p.y = -p.r;
    } else if (bMode === 'container-circle') {
      const cx = Settings.physics.container.cx * BW;
      const cy = Settings.physics.container.cy * BH;
      const R = Settings.physics.container.radiusN * (Math.min(BW, BH) / 2);
      const dx = p.x - cx, dy = p.y - cy;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const allow = Math.max(2, R - p.r);
      if (dist > allow) {
        const nx = dx / dist, ny = dy / dist;
        p.x = cx + nx * allow;
        p.y = cy + ny * allow;
        const vn = p.vx * nx + p.vy * ny;
        p.vx = p.vx - (1 + containerRest) * vn * nx;
        p.vy = p.vy - (1 + containerRest) * vn * ny;
        const tnx = -ny, tny = nx;
        const vt = p.vx * tnx + p.vy * tny;
        p.vx -= tnx * vt * wf;
        p.vy -= tny * vt * wf;
      }
    } else if (bMode === 'container-square') {
      const cx = Settings.physics.container.cx * BW;
      const cy = Settings.physics.container.cy * BH;
      const half = Settings.physics.container.sizeN * (Math.min(BW, BH) / 2);
      const minX = cx - half + p.r, maxX = cx + half - p.r;
      const minY = cy - half + p.r, maxY = cy + half - p.r;
      if (p.x < minX) {
        p.x = minX;
        if (p.vx < 0) {
          const vt = p.vy;
          p.vx = -p.vx * containerRest;
          p.vy = vt * (1 - wf);
        }
      } else if (p.x > maxX) {
        p.x = maxX;
        if (p.vx > 0) {
          const vt = p.vy;
          p.vx = -p.vx * containerRest;
          p.vy = vt * (1 - wf);
        }
      }
      if (p.y < minY) {
        p.y = minY;
        if (p.vy < 0) {
          const vt = p.vx;
          p.vy = -p.vy * containerRest;
          p.vx = vt * (1 - wf);
        }
      } else if (p.y > maxY) {
        p.y = maxY;
        if (p.vy > 0) {
          const vt = p.vx;
          p.vy = -p.vy * containerRest;
          p.vx = vt * (1 - wf);
        }
      }
    } else {
      if (p.x < -BW) p.x = BW * 2;
      if (p.x > BW * 2) p.x = -BW;
      if (p.y < -BH) p.y = BH * 2;
      if (p.y > BH * 2) p.y = -BH;
    }
  }
}