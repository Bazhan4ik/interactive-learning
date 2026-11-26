/**
 * Cubic Bézier curve operations. A cubic is `[p0, c1, c2, p1]`.
 *
 * Cubics are the engine's single geometric primitive: every line, arc, circle,
 * spring and graph is ultimately a list of cubics. That uniformity is what makes
 * partial drawing (`create`) and shape morphing (`morph`) work for any object.
 */
import { lerp as lerpVec, type Vec2 } from './vec';

export type Cubic = readonly [Vec2, Vec2, Vec2, Vec2];

/** Straight line from `a` to `b` expressed as a cubic. */
export function lineCubic(a: Vec2, b: Vec2): Cubic {
	return [a, lerpVec(a, b, 1 / 3), lerpVec(a, b, 2 / 3), b];
}

export function pointAt(c: Cubic, t: number): Vec2 {
	const mt = 1 - t;
	const a = mt * mt * mt;
	const b = 3 * mt * mt * t;
	const d = 3 * mt * t * t;
	const e = t * t * t;
	return [
		a * c[0][0] + b * c[1][0] + d * c[2][0] + e * c[3][0],
		a * c[0][1] + b * c[1][1] + d * c[2][1] + e * c[3][1]
	];
}

/** First derivative (tangent, not normalised). */
export function tangentAt(c: Cubic, t: number): Vec2 {
	const mt = 1 - t;
	const a = 3 * mt * mt;
	const b = 6 * mt * t;
	const d = 3 * t * t;
	return [
		a * (c[1][0] - c[0][0]) + b * (c[2][0] - c[1][0]) + d * (c[3][0] - c[2][0]),
		a * (c[1][1] - c[0][1]) + b * (c[2][1] - c[1][1]) + d * (c[3][1] - c[2][1])
	];
}

/** Split at parameter `t` (de Casteljau). */
export function split(c: Cubic, t: number): [Cubic, Cubic] {
	const [p0, p1, p2, p3] = c;
	const a = lerpVec(p0, p1, t);
	const b = lerpVec(p1, p2, t);
	const d = lerpVec(p2, p3, t);
	const e = lerpVec(a, b, t);
	const f = lerpVec(b, d, t);
	const m = lerpVec(e, f, t);
	return [
		[p0, a, e, m],
		[m, f, d, p3]
	];
}

/** The part of the curve between parameters `t0` and `t1`. */
export function subCurve(c: Cubic, t0: number, t1: number): Cubic {
	if (t0 <= 0 && t1 >= 1) return c;
	const right = t0 <= 0 ? c : split(c, t0)[1];
	if (t1 >= 1) return right;
	const t = (t1 - t0) / (1 - t0);
	return split(right, t)[0];
}

const LENGTH_SAMPLES = 24;

/** Cumulative arc length table at `LENGTH_SAMPLES + 1` evenly spaced parameters. */
function lengthTable(c: Cubic): number[] {
	const table = [0];
	let prev = c[0];
	for (let i = 1; i <= LENGTH_SAMPLES; i++) {
		const p = pointAt(c, i / LENGTH_SAMPLES);
		table.push(table[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
		prev = p;
	}
	return table;
}

export function length(c: Cubic): number {
	return lengthTable(c)[LENGTH_SAMPLES];
}

/** Parameter `t` at which the arc length from the start equals `fraction` of the total. */
export function tAtLengthFraction(c: Cubic, fraction: number): number {
	if (fraction <= 0) return 0;
	if (fraction >= 1) return 1;
	const table = lengthTable(c);
	const target = fraction * table[LENGTH_SAMPLES];
	if (target === 0) return fraction;
	let i = 1;
	while (i < LENGTH_SAMPLES && table[i] < target) i++;
	const span = table[i] - table[i - 1];
	const local = span === 0 ? 0 : (target - table[i - 1]) / span;
	return (i - 1 + local) / LENGTH_SAMPLES;
}

/** Exact axis-aligned bounding box (uses the derivative's roots). */
export function bounds(c: Cubic): { min: Vec2; max: Vec2 } {
	const ts = [0, 1];
	for (const axis of [0, 1] as const) {
		const [p0, p1, p2, p3] = c.map((p) => p[axis]);
		// derivative coefficients: a t² + b t + k
		const a = -p0 + 3 * p1 - 3 * p2 + p3;
		const b = 2 * (p0 - 2 * p1 + p2);
		const k = p1 - p0;
		if (Math.abs(a) < 1e-12) {
			if (Math.abs(b) > 1e-12) ts.push(-k / b);
		} else {
			const disc = b * b - 4 * a * k;
			if (disc >= 0) {
				const sq = Math.sqrt(disc);
				ts.push((-b + sq) / (2 * a), (-b - sq) / (2 * a));
			}
		}
	}
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const t of ts) {
		if (t < 0 || t > 1) continue;
		const [x, y] = pointAt(c, t);
		minX = Math.min(minX, x);
		minY = Math.min(minY, y);
		maxX = Math.max(maxX, x);
		maxY = Math.max(maxY, y);
	}
	return { min: [minX, minY], max: [maxX, maxY] };
}
