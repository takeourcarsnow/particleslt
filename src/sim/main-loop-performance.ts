import { Settings } from './config';
import { State } from './state';
import { updateHUD } from './hud';

export function updatePerformanceMetrics(dtRaw: number) {
  const fps = 1 / Math.max(1e-6, dtRaw);
  State.fpsSmooth = State.fpsSmooth * 0.9 + fps * 0.1;
  if (State.hud.fps) State.hud.fps.textContent = Math.min(99, State.fpsSmooth).toFixed(0);
  State.recentFps.push(fps);
  if (State.recentFps.length > 30) State.recentFps.shift();
}

export function applyAdaptiveSettings() {
  if (Settings.performance.adaptive && State.frameCount % 30 === 0) {
    const avgFps = State.recentFps.reduce((a, b) => a + b, 0) / Math.max(1, State.recentFps.length);
    Settings.collisions.enable = avgFps >= Settings.performance.lowFpsThreshold;
    updateHUD();
  }
}