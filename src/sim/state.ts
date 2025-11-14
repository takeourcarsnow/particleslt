import { Settings } from './config';
import type { Particle, PointerState, HUDRefs, ElementRefs } from './types';

interface SimState {
  canvas: HTMLCanvasElement|null;
  gl: WebGLRenderingContext|null;
  overlayCanvas: HTMLCanvasElement|null;
  ctx: CanvasRenderingContext2D|null;
  W:number; H:number; DPR:number;
  particles: Particle[];
  heatDecay:number;
  running:boolean; stepOnce:boolean;
  gDir:{x:number;y:number}; mouseGravity:{x:number;y:number}; tiltEnabled:boolean;
  lastT:number; fpsSmooth:number; substeps:number;
  grid: Map<number,number[]>; gridCell:number; frameCount:number; recentFps:number[];
  pointer: PointerState;
  hud: HUDRefs;
  els: ElementRefs;
  haveDeviceOrientation:boolean;
  worker: Worker|null;
  currentTab: string;
  // persist group collapsed state between UI rebuilds
  groupStates?: Record<string, boolean>;
}

export const State: SimState = {
  canvas:null, gl:null, overlayCanvas:null, ctx:null, W:0, H:0, DPR:1,
  particles:[], heatDecay:0.97, running:true, stepOnce:false,
  gDir:{x:0,y:1}, mouseGravity:{x:0,y:1}, tiltEnabled:false,
  lastT: (typeof performance!=='undefined'? performance.now():0), fpsSmooth:60, substeps:Settings.performance.substeps,
  grid:new Map(), gridCell:16, frameCount:0, recentFps:[],
  pointer:{ x:0,y:0,dx:0,dy:0,down:false,id:null,lastX:0,lastY:0,active:false },
  hud:{ root:null,fps:null,collMode:null,turbMode:null,tiltState:null,mouseG:null,gravityVal:null,countVal:null,shapeMode:null,colorMode:null,boundMode:null,resetBtn:null,fullscreenBtn:null },
  els:{ panel:null,tabsEl:null,contentEl:null,togglePanel:null,randomizeBtn:null,presetMenuBtn:null,aboutBtn:null,tiltPrompt:null,tiltBtn:null,tiltBtnTop:null,dismissTilt:null },
  haveDeviceOrientation: typeof window!=='undefined' && (('DeviceOrientationEvent' in window) || ('DeviceMotionEvent' in window)),
  worker: null,
  currentTab: 'particles',
  groupStates: {}
};
