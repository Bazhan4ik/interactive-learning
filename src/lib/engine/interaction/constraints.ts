/**
 * Drag constraints for `handle()` nodes. A constraint maps the raw pointer
 * position (world units, in the handle's local space) to an allowed position.
 * Combine several with `constraints.all(...)`.
 */
import { clamp, snap } from '../math/scalar';
import * as v from '../math/vec';
import type { Vec2 } from '../math/vec';
import type { Constraint } from '../nodes/types';

/** Snap to a grid of `step` (or `[stepX, stepY]`). */
export const snapToGrid = (step: number | Vec2 = 1): Constraint => {
	const [sx, sy] = typeof step === 'number' ? [step, step] : step;
	return (p) => [snap(p[0], sx), snap(p[1], sy)];
};

/** Keep inside the box `x ∈ [x0, x1]`, `y ∈ [y0, y1]`. */
export const inBox =
	(x: readonly [number, number], y: readonly [number, number]): Constraint =>
	(p) => [clamp(p[0], x[0], x[1]), clamp(p[1], y[0], y[1])];

/** Project onto the segment from `a` to `b`. */
export const onSegment =
	(a: Vec2, b: Vec2): Constraint =>
	(p) => {
		const ab = v.sub(b, a);
		const l2 = v.dot(ab, ab);
		const t = l2 === 0 ? 0 : clamp(v.dot(v.sub(p, a), ab) / l2, 0, 1);
		return v.add(a, v.scale(ab, t));
	};

/** Project onto the circle of radius `r` around `center`. */
export const onCircle =
	(center: Vec2, r: number): Constraint =>
	(p) => {
		const d = v.sub(p, center);
		return v.len(d) === 0 ? v.add(center, [r, 0]) : v.add(center, v.scale(v.normalize(d), r));
	};

/** Keep the distance from `center` between `min` and `max`. */
export const inRing =
	(center: Vec2, min: number, max: number): Constraint =>
	(p) => {
		const d = v.sub(p, center);
		const l = v.len(d);
		if (l === 0) return v.add(center, [min, 0]);
		return v.add(center, v.scale(d, clamp(l, min, max) / l));
	};

export const horizontal = (y: number): Constraint => (p) => [p[0], y];
export const vertical = (x: number): Constraint => (p) => [x, p[1]];

/** Apply constraints left to right. */
export const all =
	(...cs: Constraint[]): Constraint =>
	(p) =>
		cs.reduce((q, c) => c(q), p);

export const constraints = { snapToGrid, inBox, onSegment, onCircle, inRing, horizontal, vertical, all };
