import { SettingsSections } from './config-types';
import { Settings } from './config-defaults';

export const PRESETS: Record<string, () => SettingsSections> = {
  Marbles: () => ({
    particles: {
      count: 800,
      shape: 'circle',
      radiusMin: 3,
      radiusMax: 6,
      uniformSize: false,
      colorMode: 'solid',
      solidColor: '#88d0ff',
      blend: 'source-over',
      massMode: 'byArea',
      opacity: 1,
      palette: 'plasma',
      velocityColorScale: 350,
      mass: 1,
      randomMassMin: 0.4,
      randomMassMax: 2.0
    },
    physics: {
      gravity: 400,
      tiltSensitivity: 1.2,
      airDrag: 0.02,
      windX: 0,
      windY: 0,
      boundaries: 'screen-bounce',
      restitution: 0.85,
      wallFriction: 0.1,
      particleFriction: 0.03,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'elastic',
      softness: 0.5,
      inelasticity: 0.2,
      enable: true,
      adapt: true
    },
    forces: {
      turbulenceMode: 'none',
      amplitude: 0,
      scale: Settings.forces.scale,
      timeScale: Settings.forces.timeScale,
      curlStrength: Settings.forces.curlStrength,
      vortexX: Settings.forces.vortexX,
      vortexY: Settings.forces.vortexY,
      vortexStrength: Settings.forces.vortexStrength,
      vortexFalloff: Settings.forces.vortexFalloff,
      vortexCW: Settings.forces.vortexCW,
      windVar: 0,
      windGust: 0,
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
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.0,
      background: Settings.visuals.background,
      showContainer: true,
      showHUD: true,
      wireframe: false
    }
  }),
  CircleBowl: () => ({
    particles: {
      count: 900,
      radiusMin: 3,
      radiusMax: 5,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'cool',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      solidColor: '#66ccff',
      velocityColorScale: 350,
      mass: 1,
      randomMassMin: 0.4,
      randomMassMax: 2.0
    },
    physics: {
      gravity: 300,
      tiltSensitivity: 1.0,
      airDrag: 0.06,
      boundaries: 'container-circle',
      restitution: 0.85,
      wallFriction: 0.08,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.44, sizeN: 0.45 }
    },
    collisions: {
      mode: 'soft',
      softness: 0.75,
      enable: true,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'vortex',
      amplitude: 100,
      scale: 0.002,
      timeScale: 0.3,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
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
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.06,
      background: '#0b0e14',
      showContainer: true,
      showHUD: true,
      wireframe: false
    }
  }),
  SwirlGrid: () => ({
    particles: {
      count: 1500,
      radiusMin: 2,
      radiusMax: 3.5,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'aurora',
      blend: 'lighter',
      massMode: 'constant',
      mass: 0.7,
      opacity: 0.95,
      solidColor: '#66ccff',
      velocityColorScale: 350,
      randomMassMin: 0.4,
      randomMassMax: 2.0
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.7,
      airDrag: 0.06,
      boundaries: 'screen-wrap',
      restitution: 0.5,
      wallFriction: 0.05,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      softness: 0.6,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'swirlgrid',
      amplitude: 160,
      swirlSpacing: 160,
      swirlFalloff: 1.2,
      scale: 0.0025,
      timeScale: 0.3,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
      jetsAngle: 0,
      jetsSpacing: 140,
      swirlAlt: true,
      wellsCount: 4,
      wellsStrength: 800,
      wellsFalloff: 1.3,
      wellsSpin: 0.4,
      wellsMove: true,
      wellsRepel: false,
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.22,
      background: '#07101a',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  }),
  WellsDance: () => ({
    particles: {
      count: 1200,
      radiusMin: 2,
      radiusMax: 4,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'plasma',
      blend: 'lighter',
      massMode: 'random',
      randomMassMin: 0.5,
      randomMassMax: 1.4,
      opacity: 0.95,
      solidColor: '#66ccff',
      velocityColorScale: 420,
      mass: 1
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.5,
      airDrag: 0.05,
      boundaries: 'screen-wrap',
      restitution: 0.6,
      wallFriction: 0.02,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      softness: 0.6,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'wells',
      amplitude: 0,
      wellsCount: 5,
      wellsStrength: 900,
      wellsFalloff: 1.2,
      wellsSpin: 0.5,
      wellsMove: true,
      wellsRepel: false,
      scale: 0.0025,
      timeScale: 0.3,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
      jetsAngle: 0,
      jetsSpacing: 140,
      swirlSpacing: 160,
      swirlFalloff: 1.2,
      swirlAlt: true,
      wellsSeed: 2025
    },
    visuals: {
      trail: 0.18,
      background: '#05070d',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  }),
  Jelly: () => ({
    particles: {
      count: 1000,
      radiusMin: 5,
      radiusMax: 5,
      uniformSize: true,
      shape: 'circle',
      colorMode: 'solid',
      solidColor: '#ffd580',
      blend: 'source-over',
      massMode: 'byArea',
      opacity: 1.0,
      palette: 'plasma',
      velocityColorScale: 350,
      mass: 1,
      randomMassMin: 0.4,
      randomMassMax: 2.0
    },
    physics: {
      gravity: 90,
      tiltSensitivity: 0.9,
      airDrag: 0.08,
      boundaries: 'container-square',
      restitution: 0.2,
      wallFriction: 0.15,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.43 }
    },
    collisions: {
      mode: 'soft',
      softness: 0.85,
      enable: true,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'none',
      amplitude: 0,
      scale: 0.0025,
      timeScale: 0.3,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
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
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.03,
      background: '#0b0e14',
      showContainer: true,
      showHUD: true,
      wireframe: false
    }
  })
  ,
  CalmVortex: () => ({
    particles: {
      count: 600,
      radiusMin: 2.5,
      radiusMax: 4,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'cool',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      velocityColorScale: 300
    },
    physics: {
      gravity: 60,
      tiltSensitivity: 0.9,
      airDrag: 0.05,
      boundaries: 'container-circle',
      restitution: 0.85,
      wallFriction: 0.06,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'soft',
      softness: 0.65,
      enable: true,
      inelasticity: 0.25,
      adapt: true
    },
    forces: {
      turbulenceMode: 'vortex',
      amplitude: 90,
      scale: 0.002,
      timeScale: 0.25,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 380,
      vortexFalloff: 1.4,
      vortexCW: true,
      wellsCount: 3,
      wellsStrength: 600,
      wellsFalloff: 1.4,
      wellsSpin: 0.2,
      wellsMove: false,
      wellsRepel: false,
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.12,
      background: '#071028',
      showContainer: true,
      showHUD: true,
      wireframe: false
    }
  }),
  JetBands: () => ({
    particles: {
      count: 1400,
      radiusMin: 1.8,
      radiusMax: 3.2,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'plasma',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      velocityColorScale: 380
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.7,
      airDrag: 0.06,
      boundaries: 'screen-wrap',
      restitution: 0.6,
      wallFriction: 0.03,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      adapt: true
    },
    forces: {
      turbulenceMode: 'jets',
      amplitude: 220,
      scale: 0.002,
      timeScale: 0.45,
      jetsAngle: 20,
      jetsSpacing: 100,
      wellsCount: 0,
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.06,
      background: '#050816',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  }),
  DenseSwarm: () => ({
    particles: {
      count: 3000,
      radiusMin: 1.6,
      radiusMax: 2.6,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'aurora',
      blend: 'lighter',
      massMode: 'random',
      randomMassMin: 0.6,
      randomMassMax: 1.2,
      opacity: 0.9,
      velocityColorScale: 420
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.6,
      airDrag: 0.07,
      boundaries: 'screen-wrap',
      restitution: 0.4,
      wallFriction: 0.02,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: false,
      adapt: true
    },
    forces: {
      turbulenceMode: 'wells',
      amplitude: 0,
      wellsCount: 6,
      wellsStrength: 1200,
      wellsFalloff: 1.1,
      wellsSpin: 0.6,
      wellsMove: true,
      wellsRepel: false,
      timeScale: 0.35,
      scale: 0.0025,
      wellsSeed: 90909
    },
    visuals: {
      trail: 0.14,
      background: '#041018',
      showContainer: false,
      showHUD: true,
      wireframe: false
    },
    performance: {
      simSpeed: 0.9,
      substeps: 4,
      adaptive: true
    }
  }),
  StormWells: () => ({
    particles: {
      count: 1400,
      radiusMin: 2,
      radiusMax: 3.5,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'plasma',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      velocityColorScale: 380
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.6,
      airDrag: 0.06,
      boundaries: 'screen-wrap',
      restitution: 0.5,
      wallFriction: 0.02,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      adapt: true
    },
    forces: {
      turbulenceMode: 'wells',
      amplitude: 0,
      wellsCount: 6,
      wellsStrength: 1600,
      wellsFalloff: 1.0,
      wellsSpin: 0.9,
      wellsMove: true,
      wellsRepel: true,
      timeScale: 0.6,
      scale: 0.0025,
      wellsSeed: 424242
    },
    visuals: {
      trail: 0.18,
      background: '#0b0710',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  }),
  PerformanceBoost: () => ({
    particles: {
      count: 800,
      radiusMin: 2,
      radiusMax: 3,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'cool',
      blend: 'source-over',
      massMode: 'byArea',
      opacity: 1
    },
    physics: {
      gravity: 20,
      tiltSensitivity: 1.0,
      airDrag: 0.06,
      boundaries: 'screen-bounce',
      restitution: 0.8,
      wallFriction: 0.02,
      particleFriction: 0.02
    },
    collisions: {
      mode: 'soft',
      softness: 0.6,
      enable: true,
      adapt: true
    },
    forces: {
      turbulenceMode: 'none',
      amplitude: 0,
      scale: 0.0025,
      timeScale: 0.3,
      wellsSeed: Settings.forces.wellsSeed
    },
    performance: {
      simSpeed: 1.0,
      substeps: 2,
      adaptive: true
    },
    visuals: {
      trail: 0.06,
      background: '#071026',
      showHUD: true,
      wireframe: false
    }
  }),
  PerlinFlow: () => ({
    particles: {
      count: 1200,
      radiusMin: 2,
      radiusMax: 3.5,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'aurora',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      velocityColorScale: 350
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.7,
      airDrag: 0.05,
      boundaries: 'screen-wrap',
      restitution: 0.6,
      wallFriction: 0.02,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      softness: 0.6,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'perlin',
      amplitude: 180,
      scale: 0.003,
      timeScale: 0.4,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
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
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.12,
      background: '#0a0f1c',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  }),
  VortexClusters: () => ({
    particles: {
      count: 1400,
      radiusMin: 2,
      radiusMax: 3.2,
      uniformSize: false,
      shape: 'circle',
      colorMode: 'velocity',
      palette: 'plasma',
      blend: 'lighter',
      massMode: 'byArea',
      opacity: 0.95,
      velocityColorScale: 400
    },
    physics: {
      gravity: 0,
      tiltSensitivity: 0.6,
      airDrag: 0.06,
      boundaries: 'screen-wrap',
      restitution: 0.5,
      wallFriction: 0.02,
      windX: 0,
      windY: 0,
      particleFriction: 0.02,
      container: { cx: 0.5, cy: 0.5, radiusN: 0.45, sizeN: 0.45 }
    },
    collisions: {
      mode: 'none',
      enable: true,
      softness: 0.6,
      inelasticity: 0.3,
      adapt: true
    },
    forces: {
      turbulenceMode: 'clusters',
      amplitude: 160,
      scale: 0.004,
      timeScale: 0.5,
      curlStrength: 1,
      vortexX: 0.5,
      vortexY: 0.5,
      vortexStrength: 480,
      vortexFalloff: 1.2,
      vortexCW: true,
      windVar: 0,
      windGust: 0,
      jetsAngle: 0,
      jetsSpacing: 140,
      swirlSpacing: 120,
      swirlFalloff: 1.2,
      swirlAlt: true,
      wellsCount: 4,
      wellsStrength: 800,
      wellsFalloff: 1.3,
      wellsSpin: 0.4,
      wellsMove: true,
      wellsRepel: false,
      wellsSeed: Settings.forces.wellsSeed
    },
    visuals: {
      trail: 0.15,
      background: '#0d0a1a',
      showContainer: false,
      showHUD: true,
      wireframe: false
    }
  })
};
export const EXTRA_PRESET_NOTES = 'Added presets: CalmVortex, JetBands, DenseSwarm, StormWells, PerformanceBoost, PerlinFlow, VortexClusters';