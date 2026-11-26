/**
 * Paths: the engine's universal geometry.
 *
 * A `Path` is a list of subpaths. A subpath is a chain of cubic Béziers stored
 * as a flat point list `[p0, c1, c2, p1, c1, c2, p2, ...]` (length 3n + 1).
 *
 * Invariant: a `closed` subpath always ends exactly where it starts (the
 * closing edge is an explicit segment). This keeps slicing and morphing simple.
 */
import * as bz from '../math/bezier';
import type { Cubic } from '../math/bezier';
import { apply, type Mat } from '../math/matrix';
import { lerp as lerpVec, type Vec2 } from '../math/vec';

export interface Subpath {
	readonly points: readonly Vec2[];
	readonly closed: boolean;
}

export type Path = readonly Subpath[];

export interface Bounds {
	readonly min: Vec2;
	readonly max: Vec2;
}

export const segmentCount = (sp: Subpath): number => Math.max(0, (sp.points.length - 1) / 3);

export function segments(sp: Subpath): Cubic[] {
	const out: Cubic[] = [];
	const p = sp.points;
	for (let i = 0; i + 3 < p.length; i += 3) out.push([p[i], p[i + 1], p[i + 2], p[i + 3]]);
	return out;
}

export function fromSegments(cubics: readonly Cubic[], closed = false): Subpath {
	if (cubics.length === 0) return { points: [], closed: false };
	const points: Vec2[] = [cubics[0][0]];
	for (const c of cubics) points.push(c[1], c[2], c[3]);
	return { points, closed };
}

export function transformPath(path: Path, m: Mat): Path {
	return path.map((sp) => ({ points: sp.points.map((p) => apply(m, p)), closed: sp.closed }));
}

export function pathLength(path: Path): number {
	let total = 0;
	for (const sp of path) for (const c of segments(sp)) total += bz.length(c);
	return total;
}

export function pathBounds(path: Path): Bounds | null {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const sp of path) {
		if (sp.points.length === 1) {
			const [x, y] = sp.points[0];
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		}
		for (const c of segments(sp)) {
			const b = bz.bounds(c);
			minX = Math.min(minX, b.min[0]);
			minY = Math.min(minY, b.min[1]);
			maxX = Math.max(maxX, b.max[0]);
			maxY = Math.max(maxY, b.max[1]);
		}
	}
	return minX === Infinity ? null : { min: [minX, minY], max: [maxX, maxY] };
}

/**
 * The portion of the path between arc-length fractions `from` and `to` (0..1),
 * measured over all subpaths in order. This powers "draw the stroke" animations.
 */
export function slicePath(path: Path, from: number, to: number): Path {
	if (from <= 0 && to >= 1) return path;
	if (to <= from) return [];
	const all = path.map((sp) => segments(sp).map((c) => ({ c, len: bz.length(c) })));
	const total = all.flat().reduce((s, x) => s + x.len, 0);
	if (total === 0) return [];
	const start = from * total;
	const end = to * total;

	const out: Subpath[] = [];
	let acc = 0;
	for (const segs of all) {
		const kept: Cubic[] = [];
		for (const { c, len } of segs) {
			const s0 = acc;
			const s1 = acc + len;
			acc = s1;
			if (s1 <= start || s0 >= end || len === 0) continue;
			const t0 = s0 >= start ? 0 : bz.tAtLengthFraction(c, (start - s0) / len);
			const t1 = s1 <= end ? 1 : bz.tAtLengthFraction(c, (end - s0) / len);
			kept.push(bz.subCurve(c, t0, t1));
		}
		if (kept.length > 0) out.push(fromSegments(kept, false));
	}
	return out;
}

/** Point and unit-free tangent at the very end (or start) of a path. */
export function pathEnd(path: Path, which: 'start' | 'end'): { point: Vec2; tangent: Vec2 } | null {
	const sps = path.filter((sp) => sp.points.length >= 4);
	if (sps.length === 0) return null;
	if (which === 'end') {
		const segs = segments(sps[sps.length - 1]);
		for (let i = segs.length - 1; i >= 0; i--) {
			const t = bz.tangentAt(segs[i], 1);
			if (t[0] !== 0 || t[1] !== 0) return { point: segs[segs.length - 1][3], tangent: t };
		}
		return null;
	}
	const segs = segments(sps[0]);
	for (const s of segs) {
		const t = bz.tangentAt(s, 0);
		if (t[0] !== 0 || t[1] !== 0) return { point: segs[0][0], tangent: [-t[0], -t[1]] };
	}
	return null;
}

/** Split the longest segments until the subpath has exactly `n` segments. */
function subdivideTo(sp: Subpath, n: number): Subpath {
	const segs = segments(sp);
	if (segs.length === 0) {
		const p = sp.points[0] ?? [0, 0];
		return fromSegments(Array.from({ length: n }, () => [p, p, p, p] as Cubic), sp.closed);
	}
	while (segs.length < n) {
		let longest = 0;
		let best = -1;
		for (let i = 0; i < segs.length; i++) {
			const l = bz.length(segs[i]);
			if (l > best) {
				best = l;
				longest = i;
			}
		}
		const [a, b] = bz.split(segs[longest], 0.5);
		segs.splice(longest, 1, a, b);
	}
	return fromSegments(segs, sp.closed);
}

/** A degenerate (zero-size) subpath at the centre of `sp`, used to pad morph targets. */
function collapsed(sp: Subpath | undefined, fallback: Vec2): Subpath {
	const b = sp ? pathBounds([sp]) : null;
	const p = b ? lerpVec(b.min, b.max, 0.5) : fallback;
	return { points: [p], closed: false };
}

/**
 * Segments per subpath when aligning. Finer subdivision lets `bestRotation`
 * match points evenly, e.g. so a circle → square morph doesn't twist 45°.
 */
const MIN_MORPH_SEGMENTS = 16;

/**
 * Make two paths structurally identical (same subpath count, same segment
 * count per subpath) without changing their shapes, so they can be lerped.
 */
export function alignPaths(a: Path, b: Path): [Path, Path] {
	const n = Math.max(a.length, b.length, 1);
	const outA: Subpath[] = [];
	const outB: Subpath[] = [];
	for (let i = 0; i < n; i++) {
		const sa = a[i] ?? collapsed(b[i], [0, 0]);
		const sb = b[i] ?? collapsed(a[i], [0, 0]);
		const k = Math.max(segmentCount(sa), segmentCount(sb), MIN_MORPH_SEGMENTS);
		const da = subdivideTo(sa, k);
		const db = subdivideTo(sb, k);
		outA.push(da);
		outB.push(da.closed && db.closed ? bestRotation(da, db) : db);
	}
	return [outA, outB];
}

/**
 * For two closed subpaths with equal segment counts, re-start (and if needed
 * reverse) `b` so its anchors line up with `a`'s. Without this, morphing e.g.
 * a circle into a square twists and collapses mid-way.
 */
function bestRotation(a: Subpath, b: Subpath): Subpath {
	const segsB = segments(b);
	const n = segsB.length;
	const anchorsA = segments(a).map((c) => c[0]);
	const candidates = [segsB, segsB.map((c) => [c[3], c[2], c[1], c[0]] as Cubic).reverse()];
	let best = segsB;
	let bestCost = Infinity;
	for (const segs of candidates) {
		for (let shift = 0; shift < n; shift++) {
			let cost = 0;
			for (let i = 0; i < n && cost < bestCost; i++) {
				const p = segs[(i + shift) % n][0];
				cost += (p[0] - anchorsA[i][0]) ** 2 + (p[1] - anchorsA[i][1]) ** 2;
			}
			if (cost < bestCost) {
				bestCost = cost;
				best = [...segs.slice(shift), ...segs.slice(0, shift)];
			}
		}
	}
	return fromSegments(best, true);
}

/** Interpolate between two arbitrary paths. `t = 0` gives `a`, `t = 1` gives `b`. */
export function lerpPath(a: Path, b: Path, t: number): Path {
	if (t <= 0) return a;
	if (t >= 1) return b;
	const [pa, pb] = alignPaths(a, b);
	return pa.map((sa, i) => ({
		points: sa.points.map((p, j) => lerpVec(p, pb[i].points[j], t)),
		closed: t < 0.5 ? sa.closed : pb[i].closed
	}));
}

const fmt = (x: number, precision: number): string => {
	const s = x.toFixed(precision);
	// trim trailing zeros: "1.500" -> "1.5", "2.000" -> "2"
	return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
};

/** SVG path data string. Also accepted by the Canvas `Path2D` constructor. */
export function toSvgPathData(path: Path, precision = 2): string {
	const parts: string[] = [];
	for (const sp of path) {
		if (sp.points.length < 4) continue;
		const p = sp.points;
		parts.push(`M${fmt(p[0][0], precision)} ${fmt(p[0][1], precision)}`);
		for (let i = 1; i + 2 < p.length; i += 3) {
			parts.push(
				`C${[p[i], p[i + 1], p[i + 2]].map((q) => `${fmt(q[0], precision)} ${fmt(q[1], precision)}`).join(' ')}`
			);
		}
		if (sp.closed) parts.push('Z');
	}
	return parts.join('');
}
