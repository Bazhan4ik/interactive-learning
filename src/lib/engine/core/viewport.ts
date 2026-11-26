/**
 * Viewport: maps world coordinates (math convention, +y up) to screen pixels
 * (+y down) of the scene's logical size. The requested `view` is fitted
 * inside the canvas with a uniform scale and centred, so circles stay round.
 */
import * as m from '../math/matrix';
import type { Mat } from '../math/matrix';
import type { Vec2 } from '../math/vec';

export type Range = readonly [number, number];

export interface ViewSpec {
	readonly x: Range;
	readonly y: Range;
}

export interface Viewport {
	readonly width: number;
	readonly height: number;
	/** The world region actually visible (≥ the requested view, due to aspect ratio). */
	readonly visible: ViewSpec;
	/** Pixels per world unit. */
	readonly unit: number;
	/** World → screen px. */
	readonly matrix: Mat;
	toScreen(p: Vec2): Vec2;
	toWorld(p: Vec2): Vec2;
}

export function createViewport(width: number, height: number, view: ViewSpec): Viewport {
	const [x0, x1] = view.x;
	const [y0, y1] = view.y;
	if (!(x1 > x0) || !(y1 > y0)) {
		throw new Error(`viewport: view ranges must be increasing, got x=[${x0}, ${x1}] y=[${y0}, ${y1}]`);
	}
	const unit = Math.min(width / (x1 - x0), height / (y1 - y0));
	const cx = (x0 + x1) / 2;
	const cy = (y0 + y1) / 2;
	const matrix: Mat = [unit, 0, 0, -unit, width / 2 - unit * cx, height / 2 + unit * cy];
	const inverse = m.invert(matrix);
	const hw = width / unit / 2;
	const hh = height / unit / 2;
	return {
		width,
		height,
		visible: { x: [cx - hw, cx + hw], y: [cy - hh, cy + hh] },
		unit,
		matrix,
		toScreen: (p) => m.apply(matrix, p),
		toWorld: (p) => m.apply(inverse, p)
	};
}
