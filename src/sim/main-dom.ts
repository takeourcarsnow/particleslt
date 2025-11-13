import { State } from './state';

export function bindDOM() {
  State.canvas = document.getElementById('c') as HTMLCanvasElement;
  State.gl = State.canvas.getContext('webgl2') || State.canvas.getContext('webgl', { alpha: true });
  if (!State.gl) {
    throw new Error('WebGL not supported');
  }
  const get = (id: string) => document.getElementById(id);
  State.hud.root = get('hud');
  State.hud.fps = get('fps');
  State.hud.collMode = get('collMode');
  State.hud.turbMode = get('turbMode');
  State.hud.tiltState = get('tiltState');
  State.hud.mouseG = get('mouseG');
  State.hud.gravityVal = get('gravityVal');
  State.hud.countVal = get('countVal');
  State.hud.shapeMode = get('shapeMode');
  State.hud.colorMode = get('colorMode');
  State.hud.boundMode = get('boundMode');
  State.hud.pauseBtn = get('pauseBtn') as HTMLButtonElement;
  State.hud.stepBtn = get('stepBtn') as HTMLButtonElement;
  State.hud.resetBtn = get('resetBtn') as HTMLButtonElement;
  State.hud.fullscreenBtn = get('fullscreenBtn') as HTMLButtonElement;
  State.els.panel = get('panel');
  State.els.tabsEl = get('tabs');
  State.els.contentEl = get('content');
  State.els.togglePanel = get('togglePanel');
  State.els.randomizeBtn = get('randomize');
  State.els.presetMenuBtn = get('presetMenu');
  State.els.tiltPrompt = get('tiltPrompt');
  State.els.tiltBtn = get('enableTilt');
  State.els.tiltBtnTop = get('enableTiltTop');
  State.els.dismissTilt = get('dismissTilt');
}