import { SettingsType } from './config-types';

const DEFAULTS: SettingsType = {
  particles: {
    count: 1200,
    radiusMin: 2,
    radiusMax: 4,
    radiusRange: 2,
    uniformSize: false,
    shape: 'circle',
    colorMode: 'velocity',
    solidColor: '#66ccff',
    palette: 'plasma',
    blend: 'lighter',
    velocityColorScale: 350,
    opacity: 1.0,
    massMode: 'byArea',
    mass: 1,
    randomMassMin: 0.4,
    randomMassMax: 2.0
  },
  physics: {
    gravity: 40,
    tiltSensitivity: 1.0,
    airDrag: 0.06,
    windX: 0,
    windY: 0,
    boundaries: 'screen-bounce',
    restitution: 0.85,
    wallFriction: 0.02,
    particleFriction: 0.02,
    container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
  },
  collisions: {
    mode: 'elastic',
    softness: 0.6,
    inelasticity: 0.3,
    enable: true,
    adapt: true
  },
  forces: {
    turbulenceMode: 'none',
    amplitude: 140,
    scale: 0.0025,
    timeScale: 0.3,
    curlStrength: 1.0,
    vortexX: 0.5,
    vortexY: 0.5,
    vortexStrength: 480,
    vortexFalloff: 1.2,
    vortexCW: true,
    windVar: 0.0,
    windGust: 0.0,
    jetsAngle: 0,
    jetsSpacing: 140,
    swirlSpacing: 160,
    swirlFalloff: 1.2,
    swirlAlt: true,
    wellsCount: 4,
    wellsStrength: 800,
    wellsFalloff: 1.3,
    wellsSpin: 0.4,
    wellsMove: true,
    wellsRepel: false,
    wellsSeed: 12345
  },
  pointer: {
    enabled: false,
    tool: 'attract',
    strength: 1100,
    radius: 140
  },
  visuals: {
    trail: 0.18,
    background: '#0b0e14',
    showHUD: true,
    wireframe: false,
    showContainer: false
  },
  performance: {
    simSpeed: 1.0,
    substeps: 8,
    adaptive: false,
    lowFpsThreshold: 45,
    maxParticles: 4000,
    collisionCap: 20
  },
  controls: {
    mouseSetsGravity: false
  }
};

export const Config = { Settings: { ...DEFAULTS } };
export { DEFAULTS };
export const Settings = Config.Settings;