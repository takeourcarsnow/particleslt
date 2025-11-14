import { Settings } from './config';
import { State } from './state';

// Utility functions for UI controls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pathGet(obj: unknown, path: string) { return path.split('.').reduce((o: any, k) => o && o[k], obj); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pathSet(obj: unknown, path: string, val: unknown) { const ks = path.split('.'); const last = ks.pop()!; const parent = ks.reduce((o: any, k) => o[k], obj); parent[last] = val; }

function createSvg(iconName: string) {
  const svgMap: Record<string, string> = {
    circle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>',
    square: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>',
    triangle: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>',
    scale: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="m3 7 3 3-3 3"/><path d="M21 7l-3 3 3 3"/></svg>',
    'arrow-up-down': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>',
    'dice-1': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="12" cy="12" r="1.5"/></svg>',
    paintbrush: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14.622 17.897-10.68-2.913"/><path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 0-.707 0l-.944.944a2.41 2.41 0 0 1-3.408 0l-.944-.944a.5.5 0 0 0 0-.707l7.048-7.047a.5.5 0 0 0 0-.707l-.944-.944a1 1 0 0 1 0-1.414l2.828-2.828a1 1 0 0 1 1.414 0l7.07 7.071a.5.5 0 0 0 .708 0z"/><path d="m9 8 2.5 2.5"/><circle cx="6.5" cy="15.5" r="1"/><circle cx="13.5" cy="15.5" r="1"/></svg>',
    wind: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    flame: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    rainbow: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a10 10 0 0 0-20 0"/><path d="M6 17a6 6 0 0 1 12 0"/><path d="M10 17a2 2 0 0 1 4 0"/></svg>',
    snowflake: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 20-1.25-2.5L6 16l2.5-1.25L10 12l1.25 2.5L14 16l-2.5 1.25Z"/><path d="m10 4 1.25 2.5L14 8l-2.5 1.25L10 12l-1.25-2.5L6 8l2.5-1.25Z"/><path d="M20 10l-2.5-1.25L16 6l1.25 2.5L20 10l-1.25 2.5L16 14l2.5-1.25Z"/><path d="M4 10l2.5-1.25L8 6l-1.25 2.5L4 10l1.25 2.5L8 14l-2.5-1.25Z"/><path d="m16.5 7.5 1.25 2.5L20.5 12l-2.25.5-1.25 2.5-1.25-2.5L13.5 12l2.25-.5Z"/><path d="m7.5 7.5-1.25 2.5L3.5 12l2.25.5 1.25 2.5 1.25-2.5L10.5 12l-2.25-.5Z"/></svg>',
    star: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>',
    layers: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5"/><polyline points="22,8.5 12,15.5 2,8.5"/><polyline points="2,15.5 12,22 22,15.5"/><polyline points="12,2 12,15.5"/></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    lightbulb: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .5 2.2 1.5 3.5.7.8 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>',
    'refresh-cw': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    cloud: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
    zap: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>',
    magnet: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L10 19l4-4"/><path d="m5 8 4 4"/><path d="m12 15 4 4"/></svg>',
    shield: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    hand: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.83L7 15"/></svg>',
    'rotate-cw': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M3 12a9 9 0 0 1 9-9c2.52 0 4.93 1 6.74 2.74L21 8"/></svg>'
  };
  return svgMap[iconName] || '';
}

export function group(title: string, expanded = false) {
  const g = document.createElement('div');
  g.className = 'group';
  const h = document.createElement('h3');
  h.textContent = title;
  h.style.cursor = 'pointer';
  h.style.userSelect = 'none';
  h.addEventListener('click', (e) => {
    // Only toggle this group's collapsed state. Prevent accidental toggles when
    // clicking interactive controls inside the group header area by ignoring
    // clicks that originate from interactive elements.
    const path = (e as MouseEvent).composedPath ? (e as MouseEvent).composedPath() : [] as EventTarget[];
    for (const el of path as EventTarget[]) {
      if (!(el instanceof Element)) continue;
      // If an interactive element (button, input, select) was the origin, don't toggle
      if (el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.getAttribute('role') === 'button') {
        return;
      }
    }
    g.classList.toggle('collapsed');
    // persist state by title so UI rebuilds can restore it
    if (!State.groupStates) State.groupStates = {};
    State.groupStates[title] = !g.classList.contains('collapsed');
  });
  g.appendChild(h);
  // initialize collapsed state from persisted State if available, else use expanded param
  const persisted = State.groupStates && Object.prototype.hasOwnProperty.call(State.groupStates, title) ? !!State.groupStates[title] : expanded;
  if (!persisted) g.classList.add('collapsed');
  return g;
}

export function ctrlRange(parent: HTMLElement, path: string, label: string, min: number, max: number, step: number, fmtFn: (v: number) => string = (v) => String(v), onChange: ((v: number) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const right = document.createElement('div'); right.className = 'rowline'; right.style.position = 'relative';
  const input = document.createElement('input'); input.type = 'range'; input.min = String(min); input.max = String(max); input.step = String(step); input.value = pathGet(Settings, path);
  const tooltip = document.createElement('div'); tooltip.style.position = 'absolute'; tooltip.style.display = 'none'; tooltip.style.background = '#333'; tooltip.style.color = '#fff'; tooltip.style.padding = '2px 4px'; tooltip.style.borderRadius = '3px'; tooltip.style.fontSize = '12px'; tooltip.style.pointerEvents = 'none'; tooltip.style.zIndex = '10'; tooltip.style.top = '-25px';
  input.addEventListener('input', () => { 
    const num = parseFloat(input.value); 
    pathSet(Settings, path, num); 
    tooltip.textContent = fmtFn(num); 
    const percent = ((num - min) / (max - min)) * 100;
    tooltip.style.left = `calc(${percent}% - 10px)`;
    tooltip.style.display = 'block';
    if (onChange) onChange(num); 
  });
  input.addEventListener('mousedown', () => {
    const num = parseFloat(input.value);
    tooltip.textContent = fmtFn(num);
    const percent = ((num - min) / (max - min)) * 100;
    tooltip.style.left = `calc(${percent}% - 10px)`;
    tooltip.style.display = 'block';
  });
  input.addEventListener('mouseup', () => { tooltip.style.display = 'none'; });
  input.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
  right.appendChild(input); right.appendChild(tooltip); wrap.appendChild(lab); wrap.appendChild(right); parent.appendChild(wrap); return input;
}

export function ctrlLogRange(parent: HTMLElement, path: string, label: string, min: number, max: number, steps: number, fmtFn: (v: number) => string = (v) => String(v), onChange: ((v: number) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const right = document.createElement('div'); right.className = 'rowline'; right.style.position = 'relative';
  const input = document.createElement('input'); input.type = 'range'; input.min = '0'; input.max = String(steps); input.step = '1';
  
  // Convert stored value to slider position (clamp to valid range)
  const storedValue = Math.max(min, Math.min(max, pathGet(Settings, path)));
  const ratio = Math.log(Math.max(storedValue, min + 0.001) / min) / Math.log(max / min);
  const position = Math.round(Math.max(0, Math.min(steps, ratio * steps)));
  input.value = String(position);
  
  const tooltip = document.createElement('div'); tooltip.style.position = 'absolute'; tooltip.style.display = 'none'; tooltip.style.background = '#333'; tooltip.style.color = '#fff'; tooltip.style.padding = '2px 4px'; tooltip.style.borderRadius = '3px'; tooltip.style.fontSize = '12px'; tooltip.style.pointerEvents = 'none'; tooltip.style.zIndex = '10'; tooltip.style.top = '-25px';
  
  input.addEventListener('input', () => { 
    const position = parseFloat(input.value) / steps;
    const logValue = min * Math.pow(max / min, position);
    const clampedValue = Math.max(min, Math.min(max, logValue));
    pathSet(Settings, path, clampedValue); 
    tooltip.textContent = fmtFn(clampedValue); 
    const percent = (parseFloat(input.value) / steps) * 100;
    tooltip.style.left = `calc(${percent}% - 10px)`;
    tooltip.style.display = 'block';
    if (onChange) onChange(clampedValue); 
  });
  
  input.addEventListener('mousedown', () => {
    const position = parseFloat(input.value) / steps;
    const logValue = min * Math.pow(max / min, position);
    const clampedValue = Math.max(min, Math.min(max, logValue));
    tooltip.textContent = fmtFn(clampedValue);
    const percent = (parseFloat(input.value) / steps) * 100;
    tooltip.style.left = `calc(${percent}% - 10px)`;
    tooltip.style.display = 'block';
  });
  
  input.addEventListener('mouseup', () => { tooltip.style.display = 'none'; });
  input.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
  
  right.appendChild(input); right.appendChild(tooltip); wrap.appendChild(lab); wrap.appendChild(right); parent.appendChild(wrap); return input;
}

export function ctrlNumber(parent: HTMLElement, path: string, label: string, step = 1, onChange: ((v: number) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const input = document.createElement('input'); input.type = 'number'; input.value = pathGet(Settings, path); input.step = String(step);
  input.addEventListener('change', () => { const v = parseFloat(input.value); pathSet(Settings, path, v); if (onChange) onChange(v); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap); return input;
}

export function ctrlSelect(parent: HTMLElement, path: string, label: string, options: { value: string; name: string }[], onChange: ((v: string) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const sel = document.createElement('select');
  options.forEach(o => { const opt = document.createElement('option'); opt.value = o.value; opt.textContent = o.name; sel.appendChild(opt); });
  sel.value = pathGet(Settings, path);
  sel.addEventListener('change', () => { pathSet(Settings, path, sel.value); if (onChange) onChange(sel.value); });
  wrap.appendChild(lab); wrap.appendChild(sel); parent.appendChild(wrap); return sel;
}

export function ctrlColor(parent: HTMLElement, path: string, label: string, onChange: ((v: string) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const input = document.createElement('input'); input.type = 'color'; input.value = pathGet(Settings, path);
  input.addEventListener('input', () => { pathSet(Settings, path, input.value); if (onChange) onChange(input.value); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap); return input;
}

export function ctrlCheck(parent: HTMLElement, path: string, label: string, onChange: ((v: boolean) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const input = document.createElement('input'); input.type = 'checkbox'; input.checked = pathGet(Settings, path);
  input.addEventListener('change', () => { pathSet(Settings, path, input.checked); if (onChange) onChange(input.checked); });
  wrap.appendChild(lab); wrap.appendChild(input); parent.appendChild(wrap); return input;
}

export function ctrlIconSelect(parent: HTMLElement, path: string, label: string, options: { value: string; name: string; iconName: string }[], onChange: ((v: string) => void) | null = null) {
  const wrap = document.createElement('div'); wrap.className = 'ctrl';
  const lab = document.createElement('label'); lab.textContent = label;
  const btns = document.createElement('div'); btns.className = 'icon-buttons';
  const currentValue = pathGet(Settings, path);
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.innerHTML = createSvg(opt.iconName);
    btn.title = opt.name;
    if (opt.value === currentValue) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      // Prevent the click from bubbling up to group headers or other handlers
      // that might toggle/close sections inadvertently.
      e.stopPropagation();
      pathSet(Settings, path, opt.value);
      [...btns.children].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(opt.value);
    });
    btns.appendChild(btn);
  });
  wrap.appendChild(lab); wrap.appendChild(btns); parent.appendChild(wrap); return btns;
}