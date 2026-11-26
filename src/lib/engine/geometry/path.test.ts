import { describe, expect, it } from 'vitest';
import { circlePath, linePath, parametricPath, polylinePath, rectPath, smoothPath, PathBuilder } from './construct';
import { alignPaths, lerpPath, pathBounds, pathLength, segmentCount, slicePath, toSvgPathData } from './path';

describe('path construction', () => {
	it('closed shapes end where they start (path invariant)', () => {
		for (const p of [circlePath([1, 2], 3), rectPath([0, 0], 2, 1), rectPath([0, 0], 2, 1, 0.3), polylinePath([[0, 0], [1, 0], [0, 1]], true)]) {
			const pts = p[0].points;
			expect(p[0].closed).toBe(true);
			expect(pts[pts.length - 1][0]).toBeCloseTo(pts[0][0]);
			expect(pts[pts.length - 1][1]).toBeCloseTo(pts[0][1]);
		}
	});

	it('approximates a circle accurately', () => {
		expect(pathLength(circlePath([0, 0], 1))).toBeCloseTo(2 * Math.PI, 3);
		const b = pathBounds(circlePath([0, 0], 2))!;
		expect(b.min[0]).toBeCloseTo(-2);
		expect(b.max[1]).toBeCloseTo(2);
	});

	it('smoothPath passes through every point', () => {
		const pts = [[0, 0], [1, 1], [2, 0], [3, 1]] as const;
		const p = smoothPath(pts);
		expect(segmentCount(p[0])).toBe(3);
		pts.forEach((q, i) => expect(p[0].points[i * 3]).toEqual(q));
	});

	it('parametricPath breaks at non-finite samples', () => {
		const p = parametricPath((t) => [t, t === 0 ? NaN : 1 / t], -1, 1, 20);
		expect(p.length).toBe(2);
	});

	it('PathBuilder builds subpaths and closes them', () => {
		const p = new PathBuilder().moveTo([0, 0]).lineTo([1, 0]).lineTo([1, 1]).close().moveTo([5, 5]).lineTo([6, 5]).build();
		expect(p.length).toBe(2);
		expect(p[0].closed).toBe(true);
		expect(segmentCount(p[0])).toBe(3);
		expect(() => new PathBuilder().lineTo([1, 1])).toThrow(/moveTo/);
	});
});

describe('path operations', () => {
	it('slices by arc length across subpaths', () => {
		const p = [...linePath([0, 0], [10, 0]), ...linePath([0, 1], [10, 1])];
		const half = slicePath(p, 0, 0.5);
		expect(half.length).toBe(1);
		expect(pathLength(half)).toBeCloseTo(10);
		const quarter = slicePath(p, 0.25, 0.75);
		expect(pathLength(quarter)).toBeCloseTo(10);
		expect(quarter.length).toBe(2);
	});

	it('aligns paths to identical structure', () => {
		const [a, b] = alignPaths(circlePath([0, 0], 1), [...rectPath([0, 0], 1, 1), ...linePath([2, 2], [3, 3])]);
		expect(a.length).toBe(b.length);
		a.forEach((sp, i) => expect(sp.points.length).toBe(b[i].points.length));
	});

	it('lerpPath returns the endpoints exactly at t = 0 and 1', () => {
		const a = circlePath([0, 0], 1);
		const b = rectPath([0, 0], 2, 2);
		expect(lerpPath(a, b, 0)).toBe(a);
		expect(lerpPath(a, b, 1)).toBe(b);
		const mid = pathBounds(lerpPath(a, b, 0.5))!;
		expect(mid.max[0]).toBeCloseTo(1);
	});

	it('serialises to compact SVG path data', () => {
		expect(toSvgPathData(linePath([0, 0], [3, 1.5]))).toBe('M0 0C1 0.5 2 1 3 1.5');
		expect(toSvgPathData(polylinePath([[0, 0], [1, 0], [0, 1]], true))).toMatch(/Z$/);
	});
});
