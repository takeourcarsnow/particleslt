import { rebuildParticles } from '../particles';
import { initUI } from '../../components/ui';
import { initHUD } from '../../components/hud';
import { initInput } from '../input';
import { bindDOM } from './dom';
import { resize } from './resize';
import { frame } from './loop';
import { initRenderer } from '../renderer';

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


















