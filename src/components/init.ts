import { Settings, PRESETS } from '../sim/config/index';
import { State } from '../sim/state';
import { rand, randInt } from '../utils/utils';
import { rebuildParticles } from '../sim/particles';
import { TABS, showTab } from './tabs';

// Function to create tabs
export function makeTabs() {
  const tabsEl = State.els.tabsEl!; tabsEl.innerHTML = '';
  TABS.forEach((t, i) => {
    const b = document.createElement('button');
    b.textContent = t.name;
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', () => {
      [...tabsEl.children].forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      showTab(t.id);
    });
    tabsEl.appendChild(b);
  });
  showTab('basics');
}

// Function to initialize header buttons
export function initHeaderButtons() {
  State.els.randomizeBtn?.addEventListener('click', () => {
    Settings.particles.count = Math.round(rand(300, 2800));
    Settings.particles.uniformSize = Math.random() < 0.35;
    Settings.particles.radiusMin = rand(1, 4);
    Settings.particles.radiusRange = rand(0, 4);
    Settings.particles.radiusMax = Settings.particles.radiusMin + Settings.particles.radiusRange;
    Settings.particles.shape = ['circle', 'square', 'triangle'][randInt(0, 2)] as typeof Settings.particles.shape;
    Settings.particles.colorMode = ['solid', 'velocity', 'heat'][randInt(0, 2)] as typeof Settings.particles.colorMode;
    Settings.particles.palette = ['plasma', 'cool', 'fire', 'aurora'][randInt(0, 3)] as typeof Settings.particles.palette;
    Settings.particles.blend = ['source-over', 'lighter', 'screen', 'multiply'][randInt(0, 3)] as typeof Settings.particles.blend;
    Settings.physics.gravity = rand(0, 800);
    Settings.physics.airDrag = rand(0.01, 0.4);
    Settings.physics.restitution = rand(0.1, 0.9);
    Settings.collisions.mode = ['elastic', 'soft', 'inelastic', 'none'][randInt(0, 3)] as typeof Settings.collisions.mode;
    Settings.forces.turbulenceMode = ['none', 'vortex', 'jets', 'swirlgrid', 'wells', 'perlin', 'clusters', 'waves'][randInt(0, 7)];
    Settings.forces.amplitude = rand(0, 800);
    Settings.forces.scale = rand(0.001, 0.008);
    Settings.forces.timeScale = rand(0, 1.2);
    Settings.physics.boundaries = ['screen-bounce', 'screen-wrap', 'none', 'container-circle', 'container-square'][randInt(0, 4)];
    rebuildParticles(false);
    makeTabs();
  });
  State.els.presetMenuBtn?.addEventListener('click', () => {
    const names = Object.keys(PRESETS);
    const menu = document.createElement('div');
    menu.className = 'preset-menu';
    menu.style.position = 'absolute';
    menu.style.background = '#fff';
    menu.style.border = '1px solid #ccc';
    menu.style.zIndex = '1000';
    menu.style.padding = '4px';
    menu.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    names.forEach(name => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.padding = '4px 8px';
      btn.style.border = 'none';
      btn.style.background = 'none';
      btn.style.cursor = 'pointer';
      btn.style.textAlign = 'left';
      btn.style.color = '#000';
      btn.addEventListener('click', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const presetFn = (PRESETS as Record<string, () => any>)[name];
        if (presetFn) {
          const p = presetFn();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.keys(p).forEach(section => { Object.assign((Settings as any)[section], (p as any)[section]); });
          Settings.particles.radiusRange = Settings.particles.radiusMax - Settings.particles.radiusMin;
          rebuildParticles(false);
          makeTabs();
        }
        menu.remove();
      });
      menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    const rect = State.els.presetMenuBtn!.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';
    // Close menu on click outside
    const closeMenu = (e: Event) => {
      if (!menu.contains(e.target as Node) && e.target !== State.els.presetMenuBtn) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  });
  State.els.aboutBtn?.addEventListener('click', () => {
    alert('Container boundaries (circle/square), turbulence modes (Jets, Swirl Grid, Wells), and Uniform Size option.\n\n• Mobile: Enable Tilt then roll your phone.\n• Desktop: Click to set gravity direction.\n• Keyboard: Space=pause, C=controls, G=mouse gravity, R=reset.');
  });
}

// Main UI initialization function
export function initUI() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (document.body as any).style.background = Settings.visuals.background;
  State.els.togglePanel?.addEventListener('click', () => State.els.panel?.classList.toggle('hidden'));
  makeTabs();
  initHeaderButtons();
}














