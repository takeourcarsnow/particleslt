import { State } from '../state';

export function resize() {
  if (typeof window === 'undefined') return; // SSR guard
  State.DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const w = window.innerWidth, h = window.innerHeight;
  State.canvas!.width = Math.floor(w * State.DPR);
  State.canvas!.height = Math.floor(h * State.DPR);
  State.canvas!.style.width = w + 'px';
  State.canvas!.style.height = h + 'px';
  State.overlayCanvas!.width = Math.floor(w * State.DPR);
  State.overlayCanvas!.height = Math.floor(h * State.DPR);
  State.overlayCanvas!.style.width = w + 'px';
  State.overlayCanvas!.style.height = h + 'px';
  State.ctx!.scale(State.DPR, State.DPR);
  State.W = State.canvas!.width;
  State.H = State.canvas!.height;
  State.gl!.viewport(0, 0, State.W, State.H);
}
















