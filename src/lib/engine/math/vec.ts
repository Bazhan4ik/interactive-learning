/**
 * 2D vectors as plain tuples: `[x, y]`.
 *
 * Tuples (rather than classes) keep scene code short (`[1, 2]`), make every
 * value JSON-serialisable and trivially comparable in tests.
 */

export type Vec2 = readonly [number, number];

export const ZERO: Vec2 = [0, 0];

export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
export const scale = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];
export const neg = (a: Vec2): Vec2 => [-a[0], -a[1]];
export const dot = (a: Vec2, b: Vec2): number => a[0] * b[0] + a[1] * b[1];
/** z-component of the 3D cross product; > 0 when `b` is counter-clockwise from `a`. */
export const cross = (a: Vec2, b: Vec2): number => a[0] * b[1] - a[1] * b[0];
export const len = (a: Vec2): number => Math.hypot(a[0], a[1]);
export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Angle of `a` in radians, measured counter-clockwise from +x, in (-π, π]. */
export const angle = (a: Vec2): number => Math.atan2(a[1], a[0]);
export const fromAngle = (theta: number, r = 1): Vec2 => [r * Math.cos(theta), r * Math.sin(theta)];
/** Rotate 90° counter-clockwise. */
export const perp = (a: Vec2): Vec2 => [-a[1], a[0]];
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => [
	a[0] + (b[0] - a[0]) * t,
	a[1] + (b[1] - a[1]) * t
];
export const midpoint = (a: Vec2, b: Vec2): Vec2 => lerp(a, b, 0.5);

/** Unit vector in the direction of `a` (returns `[0, 0]` for the zero vector). */
export function normalize(a: Vec2): Vec2 {
	const l = len(a);
	return l === 0 ? ZERO : [a[0] / l, a[1] / l];
}

/** Rotate `a` counter-clockwise by `theta` radians around `about`. */
export function rotate(a: Vec2, theta: number, about: Vec2 = ZERO): Vec2 {
	const c = Math.cos(theta);
	const s = Math.sin(theta);
	const x = a[0] - about[0];
	const y = a[1] - about[1];
	return [about[0] + x * c - y * s, about[1] + x * s + y * c];
}

export const equals = (a: Vec2, b: Vec2, eps = 1e-9): boolean =>
	Math.abs(a[0] - b[0]) <= eps && Math.abs(a[1] - b[1]) <= eps;

export const isVec2 = (v: unknown): v is Vec2 =>
	Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number';

/** Quadrant of a point (1–4), or 0 if it lies on an axis. */
export function quadrant(a: Vec2): 0 | 1 | 2 | 3 | 4 {
	const [x, y] = a;
	if (x === 0 || y === 0) return 0;
	if (x > 0) return y > 0 ? 1 : 4;
	return y > 0 ? 2 : 3;
}
