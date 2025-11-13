import { Settings } from './config';
import { State } from './state';
import { clamp, paletteColor } from './utils';
import type { Particle } from './types';

let gl: WebGLRenderingContext | WebGL2RenderingContext;
let program: WebGLProgram;
let quadBuffer: WebGLBuffer;
let instanceBuffer: WebGLBuffer;
let aQuadPos: number;
let aInstancePos: number;
let aInstanceRadius: number;
let aInstanceColor: number;
let uResolution: WebGLUniformLocation;
let uShape: WebGLUniformLocation;
let uWireframe: WebGLUniformLocation;
let ext: { vertexAttribDivisorANGLE: (index: number, divisor: number) => void; drawArraysInstancedANGLE: (mode: number, first: number, count: number, instanceCount: number) => void } | null = null;

// Cached settings
let cachedBlend: string = '';
let cachedShape: number = -1;
let cachedWireframe: boolean = false;

const vertexShaderSource = `
attribute vec2 aQuadPos;
attribute vec2 aInstancePos;
attribute float aInstanceRadius;
attribute vec4 aInstanceColor;

uniform vec2 uResolution;

varying vec2 vPos;
varying float vRadius;
varying vec4 vColor;

void main() {
  vec2 pos = aQuadPos * aInstanceRadius + aInstancePos;
  vec2 clipPos = vec2( (pos.x / uResolution.x) * 2.0 - 1.0, - ((pos.y / uResolution.y) * 2.0 - 1.0) );
  gl_Position = vec4(clipPos, 0.0, 1.0);
  vPos = aQuadPos;
  vRadius = aInstanceRadius;
  vColor = aInstanceColor;
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform int uShape;
uniform bool uWireframe;

varying vec2 vPos;
varying float vRadius;
varying vec4 vColor;

void main() {
  float dist = length(vPos);
  if (uShape == 0) { // circle
    if (dist > 1.0) discard;
  } else if (uShape == 1) { // square
    // already a quad
  } else if (uShape == 2) { // triangle
    if (abs(vPos.x) > 1.0 || vPos.y > 1.0 || vPos.y < 2.0 * abs(vPos.x) - 1.0) discard;
  }
  if (uWireframe) {
    float edge = 0.1;
    if (dist < 1.0 - edge) discard;
  }
  gl_FragColor = vColor;
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error('Shader compilation failed');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error('Program linking failed');
  }
  return program;
}

export function initRenderer() {
  gl = State.gl!;
  const isWebGL2 = gl instanceof WebGL2RenderingContext;
  if (!isWebGL2) {
    ext = gl.getExtension('ANGLE_instanced_arrays') as { vertexAttribDivisorANGLE: (index: number, divisor: number) => void; drawArraysInstancedANGLE: (mode: number, first: number, count: number, instanceCount: number) => void } | null;
    if (!ext) throw new Error('Instanced arrays not supported');
  }
  program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  gl.useProgram(program);

  // Quad vertices for a square
  const quadVertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ]);
  quadBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

  aQuadPos = gl.getAttribLocation(program, 'aQuadPos');
  gl.enableVertexAttribArray(aQuadPos);
  gl.vertexAttribPointer(aQuadPos, 2, gl.FLOAT, false, 0, 0);

  instanceBuffer = gl.createBuffer()!;

  aInstancePos = gl.getAttribLocation(program, 'aInstancePos');
  aInstanceRadius = gl.getAttribLocation(program, 'aInstanceRadius');
  aInstanceColor = gl.getAttribLocation(program, 'aInstanceColor');

  uResolution = gl.getUniformLocation(program, 'uResolution')!;
  uShape = gl.getUniformLocation(program, 'uShape')!;
  uWireframe = gl.getUniformLocation(program, 'uWireframe')!;

  gl.enable(gl.BLEND);
  setBlendMode();
}

function setBlendMode() {
  const blend = Settings.particles.blend;
  if (blend === cachedBlend) return;
  cachedBlend = blend;
  if (blend === 'lighter') {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  } else if (blend === 'multiply') {
    gl.blendFunc(gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA);
  } else if (blend === 'screen') {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_COLOR);
  } else {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }
}

function applyOpacityToColor(col: string, alpha: number): [number, number, number, number] {
  let r = 0, g = 0, b = 0;
  if (col.startsWith('#')) {
    r = parseInt(col.slice(1, 3), 16) / 255;
    g = parseInt(col.slice(3, 5), 16) / 255;
    b = parseInt(col.slice(5, 7), 16) / 255;
  } else if (col.startsWith('rgb')) {
    const match = col.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      r = parseInt(match[1]) / 255;
      g = parseInt(match[2]) / 255;
      b = parseInt(match[3]) / 255;
    }
  }
  return [r, g, b, alpha];
}

export function drawParticles(particles: Particle[]) {
  if (!particles.length) return;

  setBlendMode();

  const instanceData: number[] = [];
  const opacity = Settings.particles.opacity;
  const cm = Settings.particles.colorMode;

  for (const p of particles) {
    let color: [number, number, number, number];
    if (cm === 'solid') {
      color = applyOpacityToColor(Settings.particles.solidColor, opacity);
    } else if (cm === 'velocity') {
      const spd = Math.hypot(p.vx, p.vy);
      const t = clamp(spd / Settings.particles.velocityColorScale, 0, 1);
      const col = paletteColor(t, Settings.particles.palette);
      color = applyOpacityToColor(col, opacity);
    } else if (cm === 'heat') {
      const t = clamp(p.heat, 0, 1);
      const col = paletteColor(t, 'fire');
      color = applyOpacityToColor(col, opacity);
    } else {
      color = [1, 1, 1, opacity];
    }
    instanceData.push(p.x, p.y, p.r, color[0], color[1], color[2], color[3]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceData), gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(aInstancePos);
  gl.vertexAttribPointer(aInstancePos, 2, gl.FLOAT, false, 7 * 4, 0);
  if (ext) ext.vertexAttribDivisorANGLE(aInstancePos, 1);
  else (gl as WebGL2RenderingContext).vertexAttribDivisor(aInstancePos, 1);

  gl.enableVertexAttribArray(aInstanceRadius);
  gl.vertexAttribPointer(aInstanceRadius, 1, gl.FLOAT, false, 7 * 4, 2 * 4);
  if (ext) ext.vertexAttribDivisorANGLE(aInstanceRadius, 1);
  else (gl as WebGL2RenderingContext).vertexAttribDivisor(aInstanceRadius, 1);

  gl.enableVertexAttribArray(aInstanceColor);
  gl.vertexAttribPointer(aInstanceColor, 4, gl.FLOAT, false, 7 * 4, 3 * 4);
  if (ext) ext.vertexAttribDivisorANGLE(aInstanceColor, 1);
  else (gl as WebGL2RenderingContext).vertexAttribDivisor(aInstanceColor, 1);

  // Pass logical (CSS) pixel resolution to the shader. Physics uses logical coords
  // (canvas.width / DPR), while GL viewport uses device pixels. Use the same
  // logical units the physics worker uses so positions map correctly.
  const logicalW = (State.canvas!.width) / State.DPR;
  const logicalH = (State.canvas!.height) / State.DPR;
  gl.uniform2f(uResolution, logicalW, logicalH);

  const shapeIndex = Settings.particles.shape === 'circle' ? 0 : Settings.particles.shape === 'square' ? 1 : 2;
  if (shapeIndex !== cachedShape) {
    cachedShape = shapeIndex;
    gl.uniform1i(uShape, shapeIndex);
  }
  const wireframe = Settings.visuals.wireframe;
  if (wireframe !== cachedWireframe) {
    cachedWireframe = wireframe;
    gl.uniform1i(uWireframe, wireframe ? 1 : 0);
  }

  if (ext) ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, 4, particles.length);
  else (gl as WebGL2RenderingContext).drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, particles.length);
}

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  // Fallback or for compatibility, but we'll use drawParticles instead
  drawParticles([p]);
}

export function clearBackground(color: string) {
  let r = 0, g = 0, b = 0;
  const a = 1;
  if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16) / 255;
    g = parseInt(color.slice(3, 5), 16) / 255;
    b = parseInt(color.slice(5, 7), 16) / 255;
  }
  gl.clearColor(r, g, b, a);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
