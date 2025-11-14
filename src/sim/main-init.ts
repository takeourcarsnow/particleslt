import { rebuildParticles } from './particles';
import { initUI } from './ui';
import { initHUD } from './hud';
import { initInput } from './input';
import { bindDOM } from './main-dom';
import { resize } from './main-resize';
import { frame } from './main-loop';
import { initRenderer } from './renderer';

export function startSimulation() {
  if (typeof window === 'undefined') return; // safety (should only run client-side)
  bindDOM();
  initRenderer();
  resize();
  initUI();
  initHUD();
  rebuildParticles(false);
  initInput();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(frame);
}