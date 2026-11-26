import { describe, expect, it } from 'vitest';
import { compile } from '../core/compile';
import { createViewport } from '../core/viewport';
import { handle } from '../nodes/shapes';
import { rotate } from '../nodes/transform';
import type { Node } from '../nodes/types';
import { defaultTheme } from '../style/theme';
import { constraints } from './constraints';
import { dragTarget, moveHandle, startDrag } from './drag';

const viewport = createViewport(800, 400, { x: [-4, 4], y: [-2, 2] });
const handlesOf = (nodes: Node[], state: Record<string, unknown>) =>
	compile(nodes, { viewport, theme: defaultTheme, state }).handles;

describe('dragging', () => {
	it('keeps the grab offset so the handle does not jump', () => {
		const [h] = handlesOf([handle({ bind: 'p' })], { p: [1, 1] });
		const session = startDrag(h, [505, 105]); // grabbed 5px right/down of centre
		const target = dragTarget(h, session, [605, 105]); // moved 100px = 1 unit right
		expect(target[0]).toBeCloseTo(2);
		expect(target[1]).toBeCloseTo(1);
	});

	it('works inside transformed groups', () => {
		const [h] = handlesOf([rotate(handle({ bind: 'p' }), Math.PI / 2)], { p: [1, 0] });
		expect(h.at[0]).toBeCloseTo(400); // rotated to world [0, 1]
		expect(h.at[1]).toBeCloseTo(100);
		const target = dragTarget(h, startDrag(h, h.at), [400, 0]); // world [0, 2]
		expect(target[0]).toBeCloseTo(2); // local x grows along rotated axis
		expect(target[1]).toBeCloseTo(0);
	});

	it('applies constrain then map when writing state', () => {
		const [h] = handlesOf([handle({ bind: 'x', at: [0, 0], constrain: constraints.horizontal(0), map: (p) => p[0] })], { x: 0 });
		expect(moveHandle({ x: 0, other: 1 }, h, [1.5, 3])).toEqual({ x: 1.5, other: 1 });
	});
});

describe('constraints', () => {
	it('snap, clamp and project', () => {
		expect(constraints.snapToGrid(0.5)([1.26, -0.74])).toEqual([1.5, -0.5]);
		expect(constraints.inBox([0, 1], [0, 1])([2, -1])).toEqual([1, 0]);
		expect(constraints.onSegment([0, 0], [2, 0])([1, 5])).toEqual([1, 0]);
		const c = constraints.onCircle([0, 0], 2)([3, 4]);
		expect(c[0]).toBeCloseTo(1.2);
		expect(c[1]).toBeCloseTo(1.6);
		expect(constraints.all(constraints.snapToGrid(1), constraints.inBox([0, 2], [0, 2]))([5.4, 0.6])).toEqual([2, 1]);
	});
});
