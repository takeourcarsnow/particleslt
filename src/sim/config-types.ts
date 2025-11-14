export interface SettingsType {
  particles: {
    count: number;
    radiusMin: number;
    radiusMax: number;
    radiusRange: number;
    uniformSize: boolean;
    shape: 'circle' | 'square' | 'triangle';
    colorMode: 'solid' | 'velocity' | 'heat';
    solidColor: string;
    palette: 'plasma' | 'cool' | 'fire' | 'aurora';
    blend: string;
    velocityColorScale: number;
    opacity: number;
    massMode: 'constant' | 'byArea' | 'inverse' | 'random';
    mass: number;
    randomMassMin: number;
    randomMassMax: number;
  };
  physics: {
    gravity: number;
    tiltSensitivity: number;
    airDrag: number;
    windX: number;
    windY: number;
    boundaries: string;
    restitution: number;
    wallFriction: number;
    particleFriction: number;
    container: { cx: number; cy: number; radiusN: number; sizeN: number };
  };
  collisions: {
    mode: 'elastic' | 'soft' | 'inelastic' | 'none';
    softness: number;
    inelasticity: number;
    enable: boolean;
    adapt: boolean;
  };
  forces: {
    turbulenceMode: string;
    amplitude: number;
    scale: number;
    timeScale: number;
    curlStrength: number;
    vortexX: number;
    vortexY: number;
    vortexStrength: number;
    vortexFalloff: number;
    vortexCW: boolean;
    windVar: number;
    windGust: number;
    jetsAngle: number;
    jetsSpacing: number;
    swirlSpacing: number;
    swirlFalloff: number;
    swirlAlt: boolean;
    wellsCount: number;
    wellsStrength: number;
    wellsFalloff: number;
    wellsSpin: number;
    wellsMove: boolean;
    wellsRepel: boolean;
    wellsSeed: number;
  };
  pointer: {
    enabled: boolean;
    tool: string;
    strength: number;
    radius: number;
  };
  visuals: {
    trail: number;
    background: string;
    showHUD: boolean;
    wireframe: boolean;
    showContainer: boolean;
  };
  performance: {
    simSpeed: number;
    substeps: number;
    adaptive: boolean;
    lowFpsThreshold: number;
    maxParticles: number;
    collisionCap: number;
  };
  controls: {
    mouseSetsGravity: boolean;
  };
}

export type SettingsSections = {
  particles?: Partial<SettingsType['particles']>;
  physics?: Partial<SettingsType['physics']>;
  collisions?: Partial<SettingsType['collisions']>;
  forces?: Partial<SettingsType['forces']>;
  pointer?: Partial<SettingsType['pointer']>;
  visuals?: Partial<SettingsType['visuals']>;
  performance?: Partial<SettingsType['performance']>;
  controls?: Partial<SettingsType['controls']>;
};