import type { SettingsType } from '../config/types';
import { State } from '../state';
import { Particle, PARTICLE_SIZE } from '../../types/types';
import { particlesToFloat32Array } from './utils';
import { precomputeNoiseFields } from './noise';
import { buildGrid, neighbors } from './grid';
import { computeWellsPositions, applyForces, applyIntegration } from './forces';
import { handleCollisions } from './collisions';
import { handleBoundaries } from './boundaries';
import { DEG, LCG, lerp, mapBoundaries } from '../../utils/utils';

let settings: SettingsType;
let state: typeof State;
let noiseFields: Float32Array[] = [];
let grid: Map<number, number[]> = new Map();
let gridSize = 0;
let gridCellSize = 0;
let BW = 800;
let BH = 600;

function computeForces(particles: Particle[], settings: SettingsType, state: typeof State, noiseFields: Float32Array[], deltaTime: number) {
  const tt = performance.now() * 0.001 * settings.forces.timeScale;
  const amp = settings.forces.amplitude;
  const sca = settings.forces.scale;
  const tm = settings.forces.turbulenceMode;
  const wells = tm === 'wells' ? computeWellsPositions(tt, settings, BW, BH) : null;
  const ptrActive = state.pointer.active;
  const h = deltaTime;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const { ax, ay } = applyForces(
      particlesToFloat32Array(particles), i, settings, tt, state.pointer, BW, BH, tm, amp, sca, settings.forces.timeScale, tt, ptrActive, wells, h, state
    );
    applyIntegration(particlesToFloat32Array(particles), i, ax, ay, h, settings, state);
  }
}

onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      settings = data.settings;
      state = data.state;
      BW = data.width || 800;
      BH = data.height || 600;
      gridSize = Math.ceil(Math.sqrt(settings.particles.count) * 0.5);
      gridCellSize = (BW + BH) / 2 / gridSize;
      noiseFields = [];
      precomputeNoiseFields(BW, BH, performance.now() * 0.001 * settings.forces.timeScale, settings.forces.scale, settings.forces.amplitude, settings);
      break;

    case 'update':
      if (!settings || !state) return;

      const { particles, deltaTime } = data;

      // Build spatial grid for collision detection
      buildGrid(particlesToFloat32Array(particles), Math.max(...particles.map(p => p.r)));

      // Compute forces
      computeForces(particles, settings, state, noiseFields, deltaTime);

      // Handle collisions
      handleCollisions(particlesToFloat32Array(particles), particles.length, Math.max(...particles.map(p => p.r)), settings, deltaTime);

      // Handle boundaries
      handleBoundaries(particlesToFloat32Array(particles), particles.length, settings, BW, BH);

      // Send updated particles back
      postMessage({
        type: 'particles',
        data: particlesToFloat32Array(particles)
      });
      break;
  }
};

















