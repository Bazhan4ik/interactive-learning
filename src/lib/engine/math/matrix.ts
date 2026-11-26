/**
 * 2D affine transforms, using the SVG convention `[a, b, c, d, e, f]`:
 *
 *   x' = a·x + c·y + e
 *   y' = b·x + d·y + f
 */
import type { Vec2 } from './vec';

export type Mat = readonly [number, number, number, number, number, number];

export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];

/** `multiply(m, n)` applies `n` first, then `m` (like `m ∘ n`). */
export function multiply(m: Mat, n: Mat): Mat {
	return [
		m[0] * n[0] + m[2] * n[1],
		m[1] * n[0] + m[3] * n[1],
		m[0] * n[2] + m[2] * n[3],
		m[1] * n[2] + m[3] * n[3],
		m[0] * n[4] + m[2] * n[5] + m[4],
		m[1] * n[4] + m[3] * n[5] + m[5]
	];
}

export const translation = (dx: number, dy: number): Mat => [1, 0, 0, 1, dx, dy];

export function rotation(theta: number, about?: Vec2): Mat {
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	const r: Mat = [c, s, -s, c, 0, 0];
	return about ? around(r, about) : r;
}

export function scaling(sx: number, sy: number = sx, about?: Vec2): Mat {
	const m: Mat = [sx, 0, 0, sy, 0, 0];
	return about ? around(m, about) : m;
}

/** Conjugate `m` so it acts around point `p` instead of the origin. */
function around(m: Mat, p: Vec2): Mat {
	return multiply(translation(p[0], p[1]), multiply(m, translation(-p[0], -p[1])));
}

export function apply(m: Mat, p: Vec2): Vec2 {
	return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

export const determinant = (m: Mat): number => m[0] * m[3] - m[1] * m[2];

export function invert(m: Mat): Mat {
	const det = determinant(m);
	if (det === 0) throw new Error('matrix: cannot invert a singular (zero-area) transform');
	const [a, b, c, d, e, f] = m;
	return [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
}

/** Average linear scale factor of a transform (used to scale e.g. line widths). */
export const scaleFactor = (m: Mat): number => Math.sqrt(Math.abs(determinant(m)));
