import { describe, expect, it } from 'vitest';
import { bounds, length, lineCubic, pointAt, split, subCurve, tAtLengthFraction, type Cubic } from './bezier';

const curve: Cubic = [
	[0, 0],
	[1, 2],
	[3, 2],
	[4, 0]
];

describe('bezier', () => {
	it('evaluates endpoints', () => {
		expect(pointAt(curve, 0)).toEqual([0, 0]);
		expect(pointAt(curve, 1)).toEqual([4, 0]);
	});

	it('split halves meet at the split point and preserve the curve', () => {
		const [a, b] = split(curve, 0.3);
		expect(a[3]).toEqual(b[0]);
		expect(a[3][0]).toBeCloseTo(pointAt(curve, 0.3)[0]);
		expect(pointAt(b, 0.5)[1]).toBeCloseTo(pointAt(curve, 0.65)[1]);
	});

	it('subCurve extracts a parameter range', () => {
		const s = subCurve(curve, 0.25, 0.75);
		expect(s[0][0]).toBeCloseTo(pointAt(curve, 0.25)[0]);
		expect(s[3][0]).toBeCloseTo(pointAt(curve, 0.75)[0]);
	});

	it('measures straight lines exactly', () => {
		expect(length(lineCubic([0, 0], [3, 4]))).toBeCloseTo(5);
	});

	it('maps length fractions to parameters', () => {
		expect(tAtLengthFraction(lineCubic([0, 0], [10, 0]), 0.3)).toBeCloseTo(0.3, 2);
	});

	it('computes tight bounds including the curve extremum', () => {
		const b = bounds(curve);
		expect(b.min).toEqual([0, 0]);
		expect(b.max[0]).toBeCloseTo(4);
		expect(b.max[1]).toBeCloseTo(1.5); // peak of the curve, not the control points (2)
	});
});
