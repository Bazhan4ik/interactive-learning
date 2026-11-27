import { describe, expect, it } from 'vitest';
import { pathBounds, type PathNode } from '#engine';
import { functionGraph, signChanges, signRuns } from './function-graph';
import { plotTransform } from './plot';

describe('signRuns', () => {
	it('finds sign changes precisely', () => {
		const [a, b] = signChanges((x) => 12 * x * x - 12, [-3, 3]);
		expect(a).toBeCloseTo(-1, 8);
		expect(b).toBeCloseTo(1, 8);
		expect(signRuns((x) => 12 * x * x - 12, [-3, 3]).map((r) => r.sign)).toEqual([1, -1, 1]);
	});

	it('ignores zeros without a sign change (x⁴ has f″ = 0 at 0)', () => {
		expect(signRuns((x) => 12 * x * x, [-2, 2])).toEqual([{ from: -2, to: 2, sign: 1 }]);
	});

	it('splits at poles', () => {
		const runs = signRuns((x) => 2 / x ** 3, [-4, 4]);
		expect(runs.map((r) => r.sign)).toEqual([-1, 1]);
		expect(runs[0].to).toBeCloseTo(0, 8);
	});
});

describe('functionGraph', () => {
	it('clips exactly at the y range', () => {
		const node = functionGraph({ f: (x) => x * x, x: [-3, 3], y: [0, 4] }) as PathNode;
		const b = pathBounds(node.path)!;
		expect(b.max[1]).toBeLessThanOrEqual(4.05);
		expect(b.min[0]).toBeCloseTo(-2, 1); // the curve leaves the box at x = ±2
		expect(b.max[0]).toBeCloseTo(2, 1);
	});
});

describe('plotTransform', () => {
	it('maps the data box onto the target box', () => {
		const [sx, , , sy, tx, ty] = plotTransform([0, 10], [0, 1], { x: [-2, 3], y: [1, 3] });
		expect([0 * sx + tx, 0 * sy + ty]).toEqual([-2, 1]);
		expect([10 * sx + tx, 1 * sy + ty]).toEqual([3, 3]);
	});
});
