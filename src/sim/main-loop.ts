import { Settings } from './config';
import { State } from './state';
import { hexWithAlpha } from './utils';
import { clearBackground, drawParticles } from './renderer';
import { updateHUD } from './hud';
import { buildGrid } from './grid';
import { drawContainerOutline } from './main-loop-rendering';
import { updatePerformanceMetrics, applyAdaptiveSettings } from './main-loop-performance';
import { simulatePhysicsStep, handleCollisions, handleBoundaries } from './main-loop-physics';

export function frame(t: number) {
  const dtRaw = Math.min(1 / 20, (t - State.lastT) / 1000) * Settings.performance.simSpeed;
  State.lastT = t;
  updatePerformanceMetrics(dtRaw);
  applyAdaptiveSettings();
  if (State.running || State.stepOnce) {
    const dt = dtRaw;
    let sub = State.substeps | 0;
    if (sub < 1) sub = 1;
    const h = dt / sub;
    if (Settings.visuals.trail <= 0.001) {
      clearBackground(Settings.visuals.background);
    } else {
      clearBackground(hexWithAlpha(Settings.visuals.background, 1 - Settings.visuals.trail));
    }
    if (Settings.collisions.enable && Settings.collisions.mode !== 'none') { buildGrid(); }
    for (let s = 0; s < sub; s++) {
      const time = (t / 1000);
      simulatePhysicsStep(time, h);
      if (Settings.collisions.enable && Settings.collisions.mode !== 'none') {
        handleCollisions();
      }
      handleBoundaries();
    }
  }
  drawParticles(State.particles);
  State.ctx!.clearRect(0, 0, State.canvas!.width / State.DPR, State.canvas!.height / State.DPR);
  if (Settings.visuals.showContainer) drawContainerOutline(State.ctx!);
  State.stepOnce = false;
  State.frameCount++;
  if (State.frameCount % 10 === 0) updateHUD();
  requestAnimationFrame(frame);
}