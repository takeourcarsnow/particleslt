export interface Particle {
  x: number; y: number; vx: number; vy: number; r: number; m: number; invM: number; heat: number; color: string;
}
export interface PointerState { x:number; y:number; dx:number; dy:number; down:boolean; id:number|null; lastX:number; lastY:number; active:boolean; }
export interface HUDRefs { root:HTMLElement|null; fps:HTMLElement|null; collMode:HTMLElement|null; turbMode:HTMLElement|null; tiltState:HTMLElement|null; mouseG:HTMLElement|null; gravityVal:HTMLElement|null; countVal:HTMLElement|null; shapeMode:HTMLElement|null; colorMode:HTMLElement|null; boundMode:HTMLElement|null; pauseBtn:HTMLButtonElement|null; stepBtn:HTMLButtonElement|null; resetBtn:HTMLButtonElement|null; fullscreenBtn:HTMLButtonElement|null; }
export interface ElementRefs { panel:HTMLElement|null; tabsEl:HTMLElement|null; contentEl:HTMLElement|null; togglePanel:HTMLElement|null; randomizeBtn:HTMLElement|null; presetMenuBtn:HTMLElement|null; aboutBtn:HTMLButtonElement|null; tiltPrompt:HTMLElement|null; tiltBtn:HTMLElement|null; tiltBtnTop:HTMLElement|null; dismissTilt:HTMLElement|null; }

export const PARTICLE_SIZE = 8;
export const X = 0, Y = 1, VX = 2, VY = 3, R = 4, M = 5, INV_M = 6, HEAT = 7;
