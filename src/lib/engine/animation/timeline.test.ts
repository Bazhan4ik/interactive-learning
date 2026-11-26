import { describe, expect, it } from 'vitest';
import { stagger } from './effects';
import { createTimeline } from './timeline';

describe('timeline', () => {
	const tl = createTimeline({
		a: 1,
		b: 2,
		label: { duration: 1, with: 'b' },
		c: { duration: 1, delay: 0.5 },
		bg: { duration: 4, start: 0 },
		d: { duration: 1, after: 'a' }
	});

	const span = (name: string) => {
		const p = tl.phases.find((x) => x.name === name)!;
		return [p.start, p.end];
	};

	it('lays out phases sequentially by default', () => {
		expect(span('a')).toEqual([0, 1]);
		expect(span('b')).toEqual([1, 3]);
	});

	it('supports with / delay / start / after', () => {
		expect(span('label')).toEqual([1, 2]);
		expect(span('c')).toEqual([3.5, 4.5]);
		expect(span('bg')).toEqual([0, 4]);
		expect(span('d')).toEqual([1, 2]);
		expect(tl.duration).toBe(4.5);
	});

	it('reports clamped, eased progress', () => {
		expect(tl.progress('b', 0)).toBe(0);
		expect(tl.progress('b', 2, 'linear')).toBe(0.5);
		expect(tl.progress('b', 2)).toBeCloseTo(0.5); // smooth is symmetric
		expect(tl.progress('b', 99)).toBe(1);
	});

	it('gives helpful errors', () => {
		expect(() => tl.progress('nope', 0)).toThrow(/unknown phase "nope".*"a"/);
		expect(() => createTimeline({ x: { duration: 1, with: 'later' }, later: 1 })).toThrow(/unknown or later phase/);
		expect(() => tl.progress('a', 0, 'bouncy' as never)).toThrow(/Unknown easing/);
	});
});

describe('stagger', () => {
	it('runs items one after another with overlap', () => {
		expect(stagger(0, 0, 3)).toBe(0);
		expect(stagger(1, 2, 3)).toBe(1);
		expect(stagger(0.5, 0, 3, 0)).toBe(1);
		expect(stagger(0.5, 2, 3, 0)).toBe(0);
		expect(stagger(0.5, 1, 3, 1)).toBe(0.5);
	});
});
