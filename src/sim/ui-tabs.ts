import { Settings } from './config';
import { State } from './state';
import { rebuildParticles } from './particles';
import { updateHUD } from './hud';
import { ctrlRange, ctrlSelect, ctrlColor, ctrlCheck, ctrlIconSelect, group } from './ui-controls';

// Tab definitions
interface TabDef { id: string; name: string; }
export const TABS: TabDef[] = [
  { id: 'basics', name: 'Basics' },
  { id: 'dynamics', name: 'Dynamics' },
  { id: 'display', name: 'Display' },
  { id: 'performance', name: 'Performance' }
];

// Function to show tab content
export function showTab(id: string) {
  State.currentTab = id;
  const contentEl = State.els.contentEl!; contentEl.innerHTML = '';
  if (id === 'basics') {
    const g1 = group('Particle Basics', true);
    ctrlRange(g1, 'particles.count', 'Count', 0, Settings.performance.maxParticles, 1, v => v.toString(), () => rebuildParticles(true));
    ctrlRange(g1, 'particles.radiusMin', 'Size', 0.5, 12, 0.5, v => v.toFixed(1), () => { Settings.particles.radiusMax = Settings.particles.radiusMin + Settings.particles.radiusRange; rebuildParticles(true); });
    ctrlRange(g1, 'particles.radiusRange', 'Size difference', 0, 10, 0.5, v => v.toFixed(1), () => { Settings.particles.radiusMax = Settings.particles.radiusMin + Settings.particles.radiusRange; rebuildParticles(true); });
    ctrlIconSelect(g1, 'particles.shape', 'Shape', [
      { value: 'circle', name: 'Circle', iconName: 'circle' },
      { value: 'square', name: 'Square', iconName: 'square' },
      { value: 'triangle', name: 'Triangle', iconName: 'triangle' }
    ]);
    const g2 = group('Mass');
    ctrlIconSelect(g2, 'particles.massMode', 'Mass mode', [
      { value: 'constant', name: 'Constant', iconName: 'scale' },
      { value: 'byArea', name: 'By area', iconName: 'square' },
      { value: 'inverse', name: 'Inverse of area', iconName: 'arrow-up-down' },
      { value: 'random', name: 'Random range', iconName: 'dice-1' }
    ], () => { rebuildParticles(true); showTab('basics'); });
    if (Settings.particles.massMode === 'constant') {
      ctrlRange(g2, 'particles.mass', 'Constant mass', 0.1, 5, 0.1, v => v.toFixed(2), () => rebuildParticles(true));
    }
    if (Settings.particles.massMode === 'random') {
      ctrlRange(g2, 'particles.randomMassMin', 'Random mass min', 0.1, 3, 0.1, v => v.toFixed(2), () => rebuildParticles(true));
      ctrlRange(g2, 'particles.randomMassMax', 'Random mass max', 0.2, 4, 0.1, v => v.toFixed(2), () => rebuildParticles(true));
    }
    const g3 = group('Color & Blend');
    ctrlIconSelect(g3, 'particles.colorMode', 'Color mode', [
      { value: 'solid', name: 'Solid', iconName: 'paintbrush' },
      { value: 'velocity', name: 'Velocity', iconName: 'wind' },
      { value: 'heat', name: 'Heat', iconName: 'flame' }
    ], () => showTab('basics'));
    if (Settings.particles.colorMode === 'solid') {
      ctrlColor(g3, 'particles.solidColor', 'Solid color');
    }
    if (Settings.particles.colorMode === 'velocity' || Settings.particles.colorMode === 'heat') {
      ctrlIconSelect(g3, 'particles.palette', 'Palette', [
        { value: 'plasma', name: 'Plasma', iconName: 'rainbow' },
        { value: 'cool', name: 'Cool', iconName: 'snowflake' },
        { value: 'fire', name: 'Fire', iconName: 'flame' },
        { value: 'aurora', name: 'Aurora', iconName: 'star' }
      ]);
    }
    if (Settings.particles.colorMode === 'velocity') {
      ctrlRange(g3, 'particles.velocityColorScale', 'Velocity color scale', 40, 1200, 10, v => v.toFixed(0));
    }
    ctrlIconSelect(g3, 'particles.blend', 'Blend mode', [
      { value: 'source-over', name: 'Normal', iconName: 'layers' },
      { value: 'lighter', name: 'Additive', iconName: 'plus' },
      { value: 'screen', name: 'Screen', iconName: 'lightbulb' },
      { value: 'multiply', name: 'Multiply', iconName: 'x' }
    ]);
    ctrlRange(g3, 'particles.opacity', 'Particle opacity', 0.1, 1.0, 0.05, v => v.toFixed(2));
    const g4 = group('Forces');
    ctrlRange(g4, 'physics.gravity', 'Gravity', 0, 1200, 10, v => v.toFixed(0));
    ctrlRange(g4, 'physics.tiltSensitivity', 'Tilt sensitivity', 0, 3, 0.05, v => v.toFixed(2));
    ctrlRange(g4, 'physics.airDrag', 'Air drag', 0, 1.2, 0.01, v => v.toFixed(2));
    ctrlRange(g4, 'physics.windX', 'Wind X', -200, 200, 1, v => v.toFixed(0));
    ctrlRange(g4, 'physics.windY', 'Wind Y', -200, 200, 1, v => v.toFixed(0));
    const g5 = group('Boundaries & Materials');
    ctrlIconSelect(g5, 'physics.boundaries', 'Boundaries', [
      { value: 'screen-bounce', name: 'Screen: Bounce', iconName: 'zap' },
      { value: 'screen-wrap', name: 'Screen: Wrap', iconName: 'refresh-cw' },
      { value: 'none', name: 'None', iconName: 'x' },
      { value: 'container-circle', name: 'Container: Circle', iconName: 'circle' },
      { value: 'container-square', name: 'Container: Square', iconName: 'square' }
    ], () => { rebuildParticles(false); showTab('basics'); });
    ctrlRange(g5, 'physics.restitution', 'Bounciness', 0, 1, 0.01, v => v.toFixed(2));
    ctrlRange(g5, 'physics.wallFriction', 'Wall friction', 0, 0.5, 0.01, v => v.toFixed(2));
    ctrlRange(g5, 'physics.particleFriction', 'Particle fric.', 0, 0.5, 0.01, v => v.toFixed(2));
    const mode = Settings.physics.boundaries;
    if (mode === 'container-circle' || mode === 'container-square') {
      const gc = group('Container Settings');
      if (mode === 'container-circle') ctrlRange(gc, 'physics.container.radiusN', 'Radius (norm)', 0.05, 0.8, 0.005, v => v.toFixed(3));
      else ctrlRange(gc, 'physics.container.sizeN', 'Half-size (norm)', 0.05, 0.8, 0.005, v => v.toFixed(3));
      contentEl.append(gc);
    }
    contentEl.append(g1, g2, g3, g4, g5);
  }
  if (id === 'dynamics') {
    const mode = Settings.forces.turbulenceMode;
    const g = group('Turbulence', true);
    ctrlSelect(g, 'forces.turbulenceMode', 'Mode', [
      { value: 'none', name: 'None' }, { value: 'flow', name: 'Flow' }, { value: 'curl', name: 'Curl' }, { value: 'vortex', name: 'Vortex (single)' }, { value: 'wind', name: 'Wind (gusty)' }, { value: 'jets', name: 'Jets (banded)' }, { value: 'swirlgrid', name: 'Swirl Grid' }, { value: 'wells', name: 'Wells (multi-attractor)' }
    ], () => showTab('dynamics'));
    if (mode !== 'none') {
      ctrlRange(g, 'forces.amplitude', 'Amplitude', 0, 300, 1, v => v.toFixed(0));
      ctrlRange(g, 'forces.scale', 'Scale', 0.0005, 0.02, 0.0005, v => v.toFixed(4));
      ctrlRange(g, 'forces.timeScale', 'Time scale', 0, 2, 0.01, v => v.toFixed(2));
    }
    contentEl.append(g);
    if (mode === 'curl') {
      const g2 = group('Curl options'); ctrlRange(g2, 'forces.curlStrength', 'Curl strength', 0, 3, 0.05, v => v.toFixed(2)); contentEl.append(g2);
    }
    if (mode === 'vortex') {
      const g3 = group('Vortex options'); ctrlRange(g3, 'forces.vortexX', 'Center X (norm)', 0, 1, 0.01, v => v.toFixed(2)); ctrlRange(g3, 'forces.vortexY', 'Center Y (norm)', 0, 1, 0.01, v => v.toFixed(2)); ctrlRange(g3, 'forces.vortexStrength', 'Strength', 0, 2000, 10, v => v.toFixed(0)); ctrlRange(g3, 'forces.vortexFalloff', 'Falloff', 0, 3, 0.05, v => v.toFixed(2)); ctrlCheck(g3, 'forces.vortexCW', 'Clockwise'); contentEl.append(g3);
    }
    if (mode === 'wind') {
      const g4 = group('Wind options'); ctrlRange(g4, 'forces.windVar', 'Variability', 0, 200, 1, v => v.toFixed(0)); ctrlRange(g4, 'forces.windGust', 'Gust', 0, 400, 1, v => v.toFixed(0)); contentEl.append(g4);
    }
    if (mode === 'jets') {
      const g5 = group('Jets options'); ctrlRange(g5, 'forces.jetsAngle', 'Angle (deg)', 0, 360, 1, v => v.toFixed(0)); ctrlRange(g5, 'forces.jetsSpacing', 'Band spacing (px)', 30, 400, 1, v => v.toFixed(0)); contentEl.append(g5);
    }
    if (mode === 'swirlgrid') {
      const g6 = group('Swirl Grid options'); ctrlRange(g6, 'forces.swirlSpacing', 'Cell spacing (px)', 40, 400, 1, v => v.toFixed(0)); ctrlRange(g6, 'forces.swirlFalloff', 'Falloff', 0, 3, 0.05, v => v.toFixed(2)); ctrlCheck(g6, 'forces.swirlAlt', 'Alternate CW/CCW'); contentEl.append(g6);
    }
    if (mode === 'wells') {
      const g7 = group('Wells options'); ctrlRange(g7, 'forces.wellsCount', 'Count', 1, 8, 1, v => v.toFixed(0)); ctrlRange(g7, 'forces.wellsStrength', 'Strength', 0, 2000, 10, v => v.toFixed(0)); ctrlRange(g7, 'forces.wellsFalloff', 'Falloff', 0.2, 3, 0.05, v => v.toFixed(2)); ctrlRange(g7, 'forces.wellsSpin', 'Spin', 0, 2, 0.01, v => v.toFixed(2)); ctrlCheck(g7, 'forces.wellsMove', 'Move'); ctrlCheck(g7, 'forces.wellsRepel', 'Repel (instead of attract)'); contentEl.append(g7);
    }
    const g8 = group('Collisions');
    ctrlIconSelect(g8, 'collisions.mode', 'Mode', [
      { value: 'elastic', name: 'Elastic', iconName: 'circle' },
      { value: 'soft', name: 'Soft', iconName: 'cloud' },
      { value: 'inelastic', name: 'Inelastic', iconName: 'zap' },
      { value: 'none', name: 'None', iconName: 'x' }
    ], () => showTab('dynamics'));
    ctrlCheck(g8, 'collisions.enable', 'Enable collisions');
    if (Settings.collisions.mode === 'soft') {
      ctrlRange(g8, 'collisions.softness', 'Softness', 0, 1, 0.01, v => v.toFixed(2));
    }
    if (Settings.collisions.mode === 'inelastic') {
      ctrlRange(g8, 'collisions.inelasticity', 'Inelasticity', 0, 1, 0.01, v => v.toFixed(2));
    }
    ctrlCheck(g8, 'collisions.adapt', 'Adaptive disable at low FPS');
    contentEl.append(g8);
  }
  if (id === 'display') {
    const g = group('Rendering', true);
    ctrlColor(g, 'visuals.background', 'Background', v => { document.body.style.background = v; });
    ctrlRange(g, 'visuals.trail', 'Trail persistence', 0, 0.9, 0.01, v => v.toFixed(2));
    ctrlCheck(g, 'visuals.showContainer', 'Show container outline');
    ctrlCheck(g, 'visuals.showHUD', 'Show HUD', v => { if (State.hud.root) State.hud.root.style.display = v ? 'block' : 'none'; });
    ctrlCheck(g, 'visuals.wireframe', 'Wireframe');
    const g2 = group('Pointer');
    ctrlCheck(g2, 'pointer.enabled', 'Pointer enabled');
    ctrlIconSelect(g2, 'pointer.tool', 'Tool', [
      { value: 'none', name: 'None', iconName: 'x' },
      { value: 'attract', name: 'Attract', iconName: 'magnet' },
      { value: 'repel', name: 'Repel', iconName: 'shield' },
      { value: 'push', name: 'Push (drag)', iconName: 'hand' },
      { value: 'spin', name: 'Spin', iconName: 'rotate-cw' }
    ], () => showTab('display'));
    if (Settings.pointer.tool !== 'none') {
      ctrlRange(g2, 'pointer.strength', 'Tool strength', 0, 3000, 10, v => v.toFixed(0));
      ctrlRange(g2, 'pointer.radius', 'Tool radius', 20, 400, 1, v => v.toFixed(0));
    }
    const g3 = group('Gravity Control');
    ctrlCheck(g3, 'controls.mouseSetsGravity', 'Mouse sets gravity', () => updateHUD());
    const hint = document.createElement('div'); hint.className = 'smallnote'; hint.textContent = 'Click anywhere to tilt toward that point (sticky).'; g3.appendChild(hint);
    contentEl.append(g, g2, g3);
  }
  if (id === 'performance') {
    const g = group('Performance', true);
    ctrlRange(g, 'performance.simSpeed', 'Simulation speed', 0.1, 2, 0.01, v => v.toFixed(2));
    ctrlRange(g, 'performance.substeps', 'Substeps', 1, 9, 1, v => v.toFixed(0), v => { State.substeps = Math.round(v); });
    ctrlCheck(g, 'performance.adaptive', 'Adaptive mode');
    ctrlRange(g, 'performance.lowFpsThreshold', 'Low FPS threshold', 20, 58, 1, v => v.toFixed(0));
    ctrlRange(g, 'performance.collisionCap', 'Neighbor cap', 4, 48, 1, v => v.toFixed(0));
    const note = document.createElement('div'); note.className = 'smallnote'; note.textContent = 'Tip: For 5k–8k particles, set collisions to Soft or None. Adaptive mode reduces cost if FPS drops.'; g.appendChild(note);
    contentEl.appendChild(g);
  }
}