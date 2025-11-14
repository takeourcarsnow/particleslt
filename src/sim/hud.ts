import { Config, DEFAULTS, Settings } from './config';
import { State } from './state';
import { rebuildParticles } from './particles';
import { showTab } from './ui-tabs';

export function updateHUD(){
  if(!State.hud.collMode) return; // not bound yet
  const collNames: Record<string, string> = {
    'elastic': 'Elastic',
    'soft': 'Soft',
    'inelastic': 'Inelastic',
    'none': 'None'
  };
  State.hud.collMode.textContent = collNames[Settings.collisions.mode] || Settings.collisions.mode;
  const turbNames: Record<string, string> = {
    'none': 'None',
    'vortex': 'Vortex',
    'jets': 'Jets',
    'swirlgrid': 'Swirl Grid',
    'wells': 'Wells',
    'perlin': 'Perlin Flow',
    'clusters': 'Vortex Clusters',
    'waves': 'Harmonic Waves'
  };
  State.hud.turbMode!.textContent = turbNames[Settings.forces.turbulenceMode] || Settings.forces.turbulenceMode;
  State.hud.tiltState!.textContent = State.tiltEnabled? 'on':'off';
  State.hud.mouseG!.textContent = Settings.controls.mouseSetsGravity? 'on':'off';
  State.hud.gravityVal!.textContent = String(Settings.physics.gravity);
  State.hud.countVal!.textContent = String(Settings.particles.count);
  const shapeIcons: Record<string, string> = {
    'circle': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
    'square': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
    'triangle': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18L12 4z"/></svg>'
  };
  State.hud.shapeMode!.innerHTML = shapeIcons[Settings.particles.shape] || Settings.particles.shape;
  const colorNames: Record<string, string> = {
    'solid': 'Solid',
    'velocity': 'Velocity',
    'heat': 'Heat'
  };
  State.hud.colorMode!.textContent = colorNames[Settings.particles.colorMode] || Settings.particles.colorMode;
  const boundaryIcons: Record<string, string> = {
    'screen-bounce': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="2"/></svg>',
    'screen-wrap': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/></svg>',
    'none': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    'container-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
    'container-square': '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>'
  };
  State.hud.boundMode!.innerHTML = boundaryIcons[Settings.physics.boundaries] || Settings.physics.boundaries;
}
function cycleSetting(el:HTMLElement|null, path:string[], options:unknown[], onChange:((next:unknown)=>void)|null){
  if(!el) return;
  el.addEventListener('click', ()=>{
    if(path.length){
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const val = path.reduce((a: any, k: string) => a[k], Settings as any);
      const idx = options.indexOf(val as unknown);
      const next = options[(idx + 1) % options.length] as unknown;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let target: any = Settings; for(let i=0;i<path.length-1;i++) target = target[path[i]];
      target[path[path.length-1]] = next;
      if(onChange) onChange(next);
    }else{ if(onChange) onChange(null); }
    updateHUD();
    if(path[0]==='particles') rebuildParticles(false);
    if(path[0]==='physics' && path[1]==='boundaries') rebuildParticles(false);
  });
  el.title = 'Click to cycle'; (el as HTMLElement).style.cursor='pointer';
}
function isFullscreen(){
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
}
function requestFullscreen(elem:HTMLElement){ if(elem.requestFullscreen) return elem.requestFullscreen(); // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (elem as any).webkitRequestFullscreen?.(); }
function exitFullscreen(){ if(document.exitFullscreen) return document.exitFullscreen(); // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (document as any).webkitExitFullscreen?.(); }
function updateFullscreenBtn(){ const btn = State.hud.fullscreenBtn; if(!btn) return; const isFull = isFullscreen(); btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>'; btn.title = isFull ? 'Exit Fullscreen' : 'Fullscreen'; }
export function initHUD(){
  State.hud.resetBtn?.addEventListener('click', ()=>{ Config.Settings = { ...DEFAULTS }; rebuildParticles(false); showTab(State.currentTab); updateHUD(); });
  State.hud.fullscreenBtn?.addEventListener('click', ()=>{ if(!isFullscreen()) requestFullscreen(document.documentElement); else exitFullscreen(); });
  document.addEventListener('fullscreenchange', updateFullscreenBtn); document.addEventListener('webkitfullscreenchange', updateFullscreenBtn); updateFullscreenBtn();
  if(State.hud.gravityVal){ State.hud.gravityVal.title='Click to set gravity'; State.hud.gravityVal.style.cursor='pointer'; State.hud.gravityVal.addEventListener('click', ()=>{ const val = prompt('Set gravity (0-1200):', String(Settings.physics.gravity)); if(val!==null){ const g = Math.max(0, Math.min(1200, parseFloat(val))); Settings.physics.gravity=g; updateHUD(); }}); }
  if(State.hud.countVal){ State.hud.countVal.title='Click to set particle count'; State.hud.countVal.style.cursor='pointer'; State.hud.countVal.addEventListener('click', ()=>{ const val = prompt('Set particle count (1-'+Settings.performance.maxParticles+'):', String(Settings.particles.count)); if(val!==null){ const c = Math.max(1, Math.min(Settings.performance.maxParticles, parseInt(val))); Settings.particles.count = c; rebuildParticles(true); updateHUD(); }}); }
  cycleSetting(State.hud.collMode,['collisions','mode'],['elastic','soft','inelastic','none'], () => showTab('dynamics'));
  cycleSetting(State.hud.turbMode,['forces','turbulenceMode'],['none','vortex','jets','swirlgrid','wells','perlin','clusters','waves'], () => showTab('dynamics'));
  cycleSetting(State.hud.tiltState,[],[],()=>{ State.tiltEnabled=!State.tiltEnabled; updateHUD(); });
  cycleSetting(State.hud.mouseG,['controls','mouseSetsGravity'],[true,false],null);
  cycleSetting(State.hud.shapeMode,['particles','shape'],['circle','square','triangle'],()=>{ rebuildParticles(false); showTab('basics'); });
  cycleSetting(State.hud.colorMode,['particles','colorMode'],['solid','velocity','heat'], () => showTab('basics'));
  cycleSetting(State.hud.boundMode,['physics','boundaries'],['screen-bounce','screen-wrap','none','container-circle','container-square'],()=>{ rebuildParticles(false); showTab('basics'); });
  if(State.hud.root) State.hud.root.style.display = Settings.visuals.showHUD? 'block':'none';
  updateHUD();
}
