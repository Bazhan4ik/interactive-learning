/**
 * Pure geometry constructors: produce `Path`s from simple descriptions.
 * These know nothing about styling or scenes; `nodes/shapes.ts` wraps them.
 */
import { lineCubic, type Cubic } from '../math/bezier';
import { TAU } from '../math/scalar';
import { add, fromAngle, lerp, scale, sub, type Vec2 } from '../math/vec';
import { fromSegments, type Path, type Subpath } from './path';

export function linePath(a: Vec2, b: Vec2): Path {
	return [fromSegments([lineCubic(a, b)])];
}

export function polylinePath(points: readonly Vec2[], closed = false): Path {
	if (points.length < 2) return [];
	const segs: Cubic[] = [];
	for (let i = 0; i + 1 < points.length; i++) segs.push(lineCubic(points[i], points[i + 1]));
	if (closed) segs.push(lineCubic(points[points.length - 1], points[0]));
	return [fromSegments(segs, closed)];
}

/**
 * Elliptical arc from angle `start` to `end` (radians, counter-clockwise when
 * `end > start`). Split into pieces of at most 90° for an accurate fit.
 */
export function ellipticalArcSubpath(
	center: Vec2,
	rx: number,
	ry: number,
	start: number,
	end: number
): Subpath {
	const sweep = end - start;
	const pieces = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 2) - 1e-9));
	const step = sweep / pieces;
	const k = (4 / 3) * Math.tan(step / 4);
	const at = (theta: number): Vec2 => [
		center[0] + rx * Math.cos(theta),
		center[1] + ry * Math.sin(theta)
	];
	const d = (theta: number): Vec2 => [-rx * Math.sin(theta), ry * Math.cos(theta)];
	const segs: Cubic[] = [];
	for (let i = 0; i < pieces; i++) {
		const a0 = start + i * step;
		const a1 = a0 + step;
		const p0 = at(a0);
		const p3 = i === pieces - 1 && Math.abs(sweep) >= TAU - 1e-9 ? at(start) : at(a1);
		segs.push([p0, add(p0, scale(d(a0), k)), sub(p3, scale(d(a1), k)), p3]);
	}
	return fromSegments(segs, Math.abs(sweep) >= TAU - 1e-9);
}

export function arcPath(center: Vec2, radius: number, start: number, end: number): Path {
	return [ellipticalArcSubpath(center, radius, radius, start, end)];
}

export function ellipsePath(center: Vec2, rx: number, ry: number): Path {
	return [ellipticalArcSubpath(center, rx, ry, 0, TAU)];
}

export function circlePath(center: Vec2, radius: number): Path {
	return ellipsePath(center, radius, radius);
}

/** Axis-aligned rectangle centred on `center`, optionally with rounded corners. */
export function rectPath(center: Vec2, width: number, height: number, cornerRadius = 0): Path {
	const hw = width / 2;
	const hh = height / 2;
	const [cx, cy] = center;
	const r = Math.min(Math.max(0, cornerRadius), hw, hh);
	if (r === 0) {
		return polylinePath(
			[
				[cx - hw, cy - hh],
				[cx + hw, cy - hh],
				[cx + hw, cy + hh],
				[cx - hw, cy + hh]
			],
			true
		);
	}
	const corner = (c: Vec2, a0: number) => ellipticalArcSubpath(c, r, r, a0, a0 + Math.PI / 2);
	const pieces: Subpath[] = [
		corner([cx + hw - r, cy - hh + r], -Math.PI / 2),
		corner([cx + hw - r, cy + hh - r], 0),
		corner([cx - hw + r, cy + hh - r], Math.PI / 2),
		corner([cx - hw + r, cy - hh + r], Math.PI)
	];
	const segs: Cubic[] = [];
	pieces.forEach((arc, i) => {
		const pts = arc.points;
		for (let j = 0; j + 3 < pts.length; j += 3) segs.push([pts[j], pts[j + 1], pts[j + 2], pts[j + 3]]);
		const next = pieces[(i + 1) % pieces.length].points[0];
		segs.push(lineCubic(pts[pts.length - 1], next));
	});
	return [fromSegments(segs, true)];
}

export function regularPolygonPath(center: Vec2, radius: number, sides: number, rotation = 0): Path {
	const pts = Array.from({ length: sides }, (_, i) =>
		add(center, fromAngle(rotation + Math.PI / 2 + (i * TAU) / sides, radius))
	);
	return polylinePath(pts, true);
}

/**
 * Smooth curve through all `points` (Catmull–Rom spline converted to cubics).
 * `tension` 0 gives straight lines, 1 gives the classic Catmull–Rom curve.
 */
export function smoothPath(points: readonly Vec2[], closed = false, tension = 1): Path {
	const n = points.length;
	if (n < 2) return [];
	if (n === 2 && !closed) return linePath(points[0], points[1]);
	const get = (i: number): Vec2 => {
		if (closed) return points[((i % n) + n) % n];
		if (i < 0) return sub(scale(points[0], 2), points[1]);
		if (i >= n) return sub(scale(points[n - 1], 2), points[n - 2]);
		return points[i];
	};
	const k = tension / 6;
	const segs: Cubic[] = [];
	const count = closed ? n : n - 1;
	for (let i = 0; i < count; i++) {
		const p0 = get(i - 1);
		const p1 = get(i);
		const p2 = get(i + 1);
		const p3 = get(i + 2);
		segs.push([p1, add(p1, scale(sub(p2, p0), k)), sub(p2, scale(sub(p3, p1), k)), p2]);
	}
	return [fromSegments(segs, closed)];
}

/**
 * Sample a parametric curve `f(t)` for `t` in `[t0, t1]` and fit a smooth path.
 * Non-finite samples (e.g. `tan` near its asymptotes) break the curve into
 * separate subpaths instead of drawing a spike.
 */
export function parametricPath(
	f: (t: number) => Vec2,
	t0: number,
	t1: number,
	samples = 100,
	breakDistance = Infinity
): Path {
	const runs: Vec2[][] = [[]];
	for (let i = 0; i <= samples; i++) {
		const p = f(t0 + ((t1 - t0) * i) / samples);
		const run = runs[runs.length - 1];
		const ok = Number.isFinite(p[0]) && Number.isFinite(p[1]);
		const jump = ok && run.length > 0 && Math.hypot(p[0] - run[run.length - 1][0], p[1] - run[run.length - 1][1]) > breakDistance;
		if (!ok || jump) {
			if (run.length > 0) runs.push([]);
			if (!ok) continue;
		}
		runs[runs.length - 1].push(p);
	}
	return runs.filter((r) => r.length >= 2).flatMap((r) => smoothPath(r, false, 1));
}

/** Imperative builder for custom paths, handy inside library objects. */
export class PathBuilder {
	private subpaths: Subpath[] = [];
	private current: Cubic[] = [];
	private start: Vec2 | null = null;
	private cursor: Vec2 | null = null;

	moveTo(p: Vec2): this {
		this.flush(false);
		this.start = p;
		this.cursor = p;
		return this;
	}

	lineTo(p: Vec2): this {
		this.current.push(lineCubic(this.requireCursor('lineTo'), p));
		this.cursor = p;
		return this;
	}

	cubicTo(c1: Vec2, c2: Vec2, p: Vec2): this {
		this.current.push([this.requireCursor('cubicTo'), c1, c2, p]);
		this.cursor = p;
		return this;
	}

	quadTo(c: Vec2, p: Vec2): this {
		const from = this.requireCursor('quadTo');
		this.current.push([from, lerp(from, c, 2 / 3), lerp(p, c, 2 / 3), p]);
		this.cursor = p;
		return this;
	}

	close(): this {
		if (this.start && this.cursor) {
			const [sx, sy] = this.start;
			const [cx, cy] = this.cursor;
			if (sx !== cx || sy !== cy) this.current.push(lineCubic(this.cursor, this.start));
		}
		this.flush(true);
		return this;
	}

	build(): Path {
		this.flush(false);
		return this.subpaths;
	}

	private requireCursor(op: string): Vec2 {
		if (!this.cursor) throw new Error(`PathBuilder.${op}: call moveTo() first`);
		return this.cursor;
	}

	private flush(closed: boolean) {
		if (this.current.length > 0) this.subpaths.push(fromSegments(this.current, closed));
		this.current = [];
		if (closed) this.cursor = this.start;
	}
}
