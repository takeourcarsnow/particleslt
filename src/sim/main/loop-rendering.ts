import { Settings } from '../config/index';
import { State } from '../state';
import { mapBoundaries } from '../../utils/utils';

export function drawContainerOutline(ctx: CanvasRenderingContext2D) {
  const BW = State.canvas!.width / State.DPR, BH = State.canvas!.height / State.DPR;
  const bMode = mapBoundaries(Settings.physics.boundaries);
  ctx.save();
  ctx.strokeStyle = 'rgba(106,227,255,0.6)';
  ctx.lineWidth = 2;
  if (bMode === 'container-circle') {
    const cx = Settings.physics.container.cx * BW;
    const cy = Settings.physics.container.cy * BH;
    const R = Settings.physics.container.radiusN * (Math.min(BW, BH) / 2);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
  } else if (bMode === 'container-square') {
    const cx = Settings.physics.container.cx * BW;
    const cy = Settings.physics.container.cy * BH;
    const half = Settings.physics.container.sizeN * (Math.min(BW, BH) / 2);
    const x = cx - half;
    const y = cy - half;
    const w = half * 2;
    const h = half * 2;
    ctx.strokeRect(x, y, w, h);
  }
  ctx.restore();
}
















