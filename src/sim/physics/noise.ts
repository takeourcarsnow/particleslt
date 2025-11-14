import type { SettingsType } from '../config/types';
import { lerp } from '../../utils/utils';

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

export function precomputeNoiseFields(BW: number, BH: number, tt: number, sca: number, amp: number, settings: SettingsType) {
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

export function sampleBilinear(arr: Float32Array, x: number, y: number, BW: number, BH: number): number {
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

export function getCurlX(): Float32Array | null { return curlX; }
export function getCurlY(): Float32Array | null { return curlY; }
export function getFlowX(): Float32Array | null { return flowX; }
export function getFlowY(): Float32Array | null { return flowY; }
export function getWindX(): Float32Array | null { return windX; }
export function getWindY(): Float32Array | null { return windY; }
export function getGustX(): Float32Array | null { return gustX; }
export function getGustY(): Float32Array | null { return gustY; }

// Import noise functions from utils
import { curlNoise, flowNoiseVec } from '../../utils/utils';















