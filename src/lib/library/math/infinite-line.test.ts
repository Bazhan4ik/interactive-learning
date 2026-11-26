import { describe, expect, it } from 'vitest';
import { clipToBox } from './infinite-line';

describe('clipToBox', () => {
	it('clips a line through the origin to the box edges', () => {
		expect(clipToBox([0, 0], [1, 0], [-3, 3], [-2, 2])).toEqual([-3, 3]);
		expect(clipToBox([0, 0], [2, 1], [-4, 4], [-1, 1])).toEqual([-1, 1]); // hits y edges first
	});

	it('handles axis-parallel lines outside the box', () => {
		expect(clipToBox([0, 5], [1, 0], [-3, 3], [-2, 2])).toBeNull();
	});

	it('returns null for lines that miss the box', () => {
		expect(clipToBox([10, 0], [1, 1], [-1, 1], [-1, 1])).toBeNull();
	});
});
