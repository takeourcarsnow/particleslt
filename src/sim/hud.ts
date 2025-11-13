import { Settings } from './config';
import { State } from './state';
import { rebuildParticles } from './particles';

export function updateHUD(){
  if(!State.hud.collMode) return; // not bound yet
  State.hud.collMode.textContent = Settings.collisions.mode;
  State.hud.turbMode!.textContent = Settings.forces.turbulenceMode;
  State.hud.tiltState!.textContent = State.tiltEnabled? 'on':'off';
  State.hud.mouseG!.textContent = Settings.controls.mouseSetsGravity? 'on':'off';
  State.hud.gravityVal!.textContent = String(Settings.physics.gravity);
  State.hud.countVal!.textContent = String(Settings.particles.count);
  State.hud.shapeMode!.textContent = Settings.particles.shape;
  State.hud.colorMode!.textContent = Settings.particles.colorMode;
  State.hud.boundMode!.textContent = Settings.physics.boundaries;
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
function updateFullscreenBtn(){ const btn = State.hud.fullscreenBtn; if(!btn) return; btn.textContent = isFullscreen()? 'Exit Fullscreen':'Fullscreen'; }
export function initHUD(){
  State.hud.pauseBtn?.addEventListener('click', ()=>{ State.running=!State.running; if(State.hud.pauseBtn) State.hud.pauseBtn.textContent = State.running?'Pause':'Resume'; });
  State.hud.stepBtn?.addEventListener('click', ()=>{ State.stepOnce=true; State.running=false; if(State.hud.pauseBtn) State.hud.pauseBtn.textContent='Resume'; });
  State.hud.resetBtn?.addEventListener('click', ()=>{ rebuildParticles(false); });
  State.hud.fullscreenBtn?.addEventListener('click', ()=>{ if(!isFullscreen()) requestFullscreen(document.documentElement); else exitFullscreen(); });
  document.addEventListener('fullscreenchange', updateFullscreenBtn); document.addEventListener('webkitfullscreenchange', updateFullscreenBtn); updateFullscreenBtn();
  if(State.hud.gravityVal){ State.hud.gravityVal.title='Click to set gravity'; State.hud.gravityVal.style.cursor='pointer'; State.hud.gravityVal.addEventListener('click', ()=>{ const val = prompt('Set gravity (0-1200):', String(Settings.physics.gravity)); if(val!==null){ const g = Math.max(0, Math.min(1200, parseFloat(val))); Settings.physics.gravity=g; updateHUD(); }}); }
  if(State.hud.countVal){ State.hud.countVal.title='Click to set particle count'; State.hud.countVal.style.cursor='pointer'; State.hud.countVal.addEventListener('click', ()=>{ const val = prompt('Set particle count (1-'+Settings.performance.maxParticles+'):', String(Settings.particles.count)); if(val!==null){ const c = Math.max(1, Math.min(Settings.performance.maxParticles, parseInt(val))); Settings.particles.count = c; rebuildParticles(true); updateHUD(); }}); }
  cycleSetting(State.hud.collMode,['collisions','mode'],['elastic','soft','inelastic','none'],null);
  cycleSetting(State.hud.turbMode,['forces','turbulenceMode'],['none','flow','curl','vortex','wind','jets','swirlgrid','wells'],null);
  cycleSetting(State.hud.tiltState,[],[],()=>{ State.tiltEnabled=!State.tiltEnabled; updateHUD(); });
  cycleSetting(State.hud.mouseG,['controls','mouseSetsGravity'],[true,false],null);
  cycleSetting(State.hud.shapeMode,['particles','shape'],['circle','square','triangle'],()=>{ rebuildParticles(false); });
  cycleSetting(State.hud.colorMode,['particles','colorMode'],['solid','velocity','heat'],null);
  cycleSetting(State.hud.boundMode,['physics','boundaries'],['screen-bounce','screen-wrap','none','container-circle','container-square'],()=>{ rebuildParticles(false); });
  if(State.hud.root) State.hud.root.style.display = Settings.visuals.showHUD? 'block':'none';
  updateHUD();
}
