export const clamp = (x:number,a:number,b:number)=>x<a?a:(x>b?b:x);
export const lerp = (a:number,b:number,t:number)=>a+(b-a)*t;
export const rand = (a=0,b=1)=>a + Math.random()*(b-a);
export const randInt=(a:number,b:number)=>Math.floor(rand(a,b+1));
export const TAU = Math.PI*2;
export const DEG = Math.PI/180;

export function hexWithAlpha(hex:string, a:number){
  if(!hex || hex[0]!=='#') return hex;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

export function paletteColor(t:number, name:string){
  t = clamp(t,0,1);
  switch(name){
    case 'plasma': {
      const r = Math.round(255 * clamp(Math.sin((t)*Math.PI)*0.8 + t*0.2 + 0.1,0,1));
      const g = Math.round(255 * clamp(Math.pow(t,0.5)*0.9,0,1));
      const b = Math.round(255 * clamp(1 - Math.pow(t,0.7),0,1));
      return `rgb(${r},${g},${b})`;
    }
    case 'cool': {
      const r = Math.round(255 * (1-t));
      const g = Math.round(255 * (0.5+0.5*t));
      const b = Math.round(255 * (t));
      return `rgb(${r},${g},${b})`;
    }
    case 'fire': {
      const r = Math.round(255 * clamp(1.2*t,0,1));
      const g = Math.round(255 * clamp(1.2*t-0.2,0,1));
      const b = Math.round(255 * clamp(0.8*t-0.5,0,1));
      return `rgb(${r},${g},${b})`;
    }
    case 'aurora':
    default: {
      const r = Math.round(255 * clamp(0.6*(1-t) + 0.1,0,1));
      const g = Math.round(255 * clamp(0.2 + t*0.8,0,1));
      const b = Math.round(255 * clamp(0.9 - t*0.6,0,1));
      return `rgb(${r},${g},${b})`;
    }
  }
}

export function hash(n:number){ n = (n<<13)^n; return 1.0 - ((n*(n*n*15731 + 789221) + 1376312589) & 0x7fffffff)/1073741824.0; }
export function noise2D(x:number,y:number){
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const s = (t:number)=>t*t*(3-2*t);
  const h = (ix:number,iy:number)=>hash(ix*374761393 + iy*668265263);
  const v00 = h(xi,yi), v10 = h(xi+1,yi), v01 = h(xi,yi+1), v11 = h(xi+1,yi+1);
  const u = s(xf), v = s(yf);
  return lerp(lerp(v00,v10,u), lerp(v01,v11,u), v)*0.5+0.5;
}
export function curlNoise(x:number,y:number,t:number,scale=0.003, amp=1.0){
  // Finite-difference approximation of partial derivatives.
  // Note: noise2D is sampled at coordinates scaled by `scale`, so the
  // change in the noise input for a pixel offset eps is eps*scale. We
  // therefore divide by (2*eps*scale) to get the derivative w.r.t. x/y
  // in screen-space. Return the 2D curl vector perpendicular to the
  // gradient: (-d/dy, d/dx) which produces rotational flow.
  const eps = 2.5;
  const nx1 = noise2D((x+eps)*scale, y*scale + t);
  const nx2 = noise2D((x-eps)*scale, y*scale + t);
  const ny1 = noise2D(x*scale, (y+eps)*scale + t);
  const ny2 = noise2D(x*scale, (y-eps)*scale + t);
  const denom = 2 * eps * Math.max(1e-9, scale);
  const dx = (nx1 - nx2) / denom;
  const dy = (ny1 - ny2) / denom;
  return { x: amp * (-dy), y: amp * (dx) };
}
export function flowNoiseVec(x:number,y:number,t:number,scale=0.002, amp=1.0){
  // New "fresh" flow mode: blend an angle field (from scalar noise)
  // with a small local curl component to introduce richer swirling
  // behavior. This produces more organic flowing motion than a pure
  // angle field while remaining divergence-free-ish when curl mixes in.
  const baseTheta = noise2D(x*scale + t*0.31, y*scale - t*0.17) * TAU * 2;
  const baseX = Math.cos(baseTheta);
  const baseY = Math.sin(baseTheta);
  // small local curl to add eddies
  const swirl = curlNoise(x, y, t, scale * 0.75, 0.6);
  // mix factor controls how much curl perturbs the base flow
  const swirlMix = 0.35;
  let fx = (1 - swirlMix) * baseX + swirlMix * swirl.x;
  let fy = (1 - swirlMix) * baseY + swirlMix * swirl.y;
  // normalize and scale by amp
  const len = Math.hypot(fx, fy) || 1e-9;
  fx = (fx / len) * amp;
  fy = (fy / len) * amp;
  return { x: fx, y: fy };
}
export function LCG(seed:number){
  let s = (seed>>>0) || 1;
  return ()=>{ s = (1664525*s + 1013904223)>>>0; return s/4294967296; };
}
export function mapBoundaries(v:string){
  if(v==='bounce') return 'screen-bounce';
  if(v==='wrap') return 'screen-wrap';
  return v;
}
