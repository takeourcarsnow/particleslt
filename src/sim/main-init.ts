import { rebuildParticles } from './particles';
import { initUI } from './ui';
import { initHUD } from './hud';
import { initInput } from './input';
import { bindDOM } from './main-dom';
import { resize } from './main-resize';
import { frame } from './main-loop';
import { initRenderer, drawParticles } from './renderer';
import { State } from './state';

export function startSimulation() {
  if (typeof window === 'undefined') return; // safety (should only run client-side)
  bindDOM();
  initRenderer();
  resize();
  initUI();
  initHUD();
  rebuildParticles(false);
  initInput();
  State.worker = new Worker(new URL('./physics-worker.ts', import.meta.url));
  State.worker.onmessage = (e) => {
    State.particles = e.data.particles;
    drawParticles(State.particles);
    State.stepOnce = false;
    State.frameCount++;
    requestAnimationFrame(frame);
  };
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(frame);
}