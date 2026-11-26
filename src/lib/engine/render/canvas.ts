/**
 * Frame → Canvas 2D. Browser only. Used for PNG export and could back a
 * high-performance live view for very large scenes.
 */
import { toSvgPathData } from '../geometry/path';
import type { Frame } from '../core/scene';
import type { TextBaseline } from '../style/style';

const CANVAS_BASELINE: Record<TextBaseline, CanvasTextBaseline> = {
	top: 'top',
	middle: 'middle',
	bottom: 'bottom',
	alphabetic: 'alphabetic'
};

const CANVAS_ALIGN = { start: 'left', middle: 'center', end: 'right' } as const;

/** Draw a frame into a 2D context. `scale` = device pixels per logical px. */
export function drawFrame(ctx: CanvasRenderingContext2D, frame: Frame, scale = 1): void {
	ctx.save();
	ctx.setTransform(scale, 0, 0, scale, 0, 0);
	ctx.fillStyle = frame.background;
	ctx.fillRect(0, 0, frame.width, frame.height);

	for (const p of frame.primitives) {
		ctx.save();
		ctx.globalAlpha = p.opacity;
		if (p.kind === 'path') {
			const s = p.style;
			const path2d = new Path2D(toSvgPathData(p.path, 3));
			if (s.fill !== 'none') {
				ctx.globalAlpha = p.opacity * s.fillOpacity;
				ctx.fillStyle = s.fill;
				ctx.fill(path2d);
			}
			if (s.stroke !== 'none' && s.strokeWidth > 0) {
				ctx.globalAlpha = p.opacity * s.strokeOpacity;
				ctx.strokeStyle = s.stroke;
				ctx.lineWidth = s.strokeWidth;
				ctx.lineCap = s.lineCap;
				ctx.lineJoin = s.lineJoin;
				ctx.setLineDash(s.dash ? [...s.dash] : []);
				ctx.stroke(path2d);
			}
		} else {
			const s = p.style;
			ctx.fillStyle = s.fill;
			ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize}px ${s.fontFamily}`;
			ctx.textAlign = CANVAS_ALIGN[s.anchor];
			ctx.textBaseline = CANVAS_BASELINE[s.baseline];
			ctx.fillText(p.text, p.at[0], p.at[1]);
		}
		ctx.restore();
	}
	ctx.restore();
}

/** Render a frame to a PNG blob at `scale`× the logical size. */
export async function renderPng(frame: Frame, scale = 2): Promise<Blob> {
	const canvas = document.createElement('canvas');
	canvas.width = Math.round(frame.width * scale);
	canvas.height = Math.round(frame.height * scale);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('renderPng: 2D canvas is not available');
	drawFrame(ctx, frame, scale);
	return new Promise((resolve, reject) =>
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('renderPng: encoding failed'))), 'image/png')
	);
}
