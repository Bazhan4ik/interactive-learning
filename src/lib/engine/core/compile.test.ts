import { describe, expect, it } from 'vitest';
import { arrow, circle, dot, group, handle, line, text } from '../nodes/shapes';
import { translate } from '../nodes/transform';
import type { Node } from '../nodes/types';
import { defaultTheme } from '../style/theme';
import { compile } from './compile';
import type { PathPrimitive, TextPrimitive } from './primitives';
import { createViewport } from './viewport';

// 100 px per unit, origin in the centre of a 800×400 canvas
const viewport = createViewport(800, 400, { x: [-4, 4], y: [-2, 2] });
const run = (nodes: Node[], state = {}) => compile(nodes, { viewport, theme: defaultTheme, state });

describe('viewport', () => {
	it('maps world (+y up) to screen (+y down)', () => {
		expect(viewport.unit).toBe(100);
		expect(viewport.toScreen([0, 0])).toEqual([400, 200]);
		expect(viewport.toScreen([1, 1])).toEqual([500, 100]);
		expect(viewport.toWorld([500, 100])).toEqual([1, 1]);
	});

	it('fits non-matching aspect ratios uniformly', () => {
		const v = createViewport(800, 400, { x: [-1, 1], y: [-1, 1] });
		expect(v.unit).toBe(200);
		expect(v.visible.x).toEqual([-2, 2]);
	});
});

describe('compile', () => {
	it('cascades group color to path strokes and text fills', () => {
		const { primitives } = run([group([line({ from: [0, 0], to: [1, 0] }), text({ text: 'hi', at: [0, 0] })], { color: '#ff0000' })]);
		expect((primitives[0] as PathPrimitive).style.stroke).toBe('#ff0000');
		expect((primitives[1] as TextPrimitive).style.fill).toBe('#ff0000');
	});

	it('lets a child color override an inherited stroke', () => {
		const { primitives } = run([group([line({ from: [0, 0], to: [1, 0], color: '#00ff00' })], { stroke: '#ff0000' })]);
		expect((primitives[0] as PathPrimitive).style.stroke).toBe('#00ff00');
	});

	it('resolves fill currentColor and theme defaults', () => {
		const [p] = run([circle({ fill: 'currentColor' })]).primitives as PathPrimitive[];
		expect(p.style.fill).toBe(defaultTheme.foreground);
		expect(p.style.strokeWidth).toBe(defaultTheme.strokeWidth);
	});

	it('multiplies opacity and skips invisible nodes', () => {
		const { primitives } = run([group([circle({ opacity: 0.5 }), circle({ opacity: 0 })], { opacity: 0.5 })]);
		expect(primitives).toHaveLength(1);
		expect(primitives[0].opacity).toBe(0.25);
	});

	it('applies node transforms before the viewport', () => {
		const [t] = run([translate(text({ text: 'x', at: [0, 0] }), [1, 1])]).primitives as TextPrimitive[];
		expect(t.at).toEqual([500, 100]);
	});

	it('applies text px offsets in screen space (+y up)', () => {
		const [t] = run([text({ text: 'x', at: [0, 0], offset: [10, 20] })]).primitives as TextPrimitive[];
		expect(t.at).toEqual([410, 180]);
	});

	it('expands arrow tips into a filled triangle at the end', () => {
		const prims = run([arrow({ from: [0, 0], to: [2, 0] })]).primitives as PathPrimitive[];
		expect(prims).toHaveLength(2);
		const [shaft, tip] = prims;
		expect(tip.style.fill).toBe(shaft.style.stroke);
		const shaftEnd = shaft.path[0].points.at(-1)!;
		expect(shaftEnd[0]).toBeLessThan(600); // shortened so the cap hides under the tip
		expect(tip.path[0].points[0]).toEqual([600, 200]); // apex at the true endpoint
	});

	it('draws markers in px regardless of world scale', () => {
		const [p] = run([dot({ at: [1, 0], radius: 5 })]).primitives as PathPrimitive[];
		const xs = p.path[0].points.map((q) => q[0]);
		expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(10);
	});

	it('resolves handles from state and maps screen px back to local space', () => {
		const { handles } = run([translate(handle({ bind: 'p' }), [1, 0])], { p: [1, 1] });
		expect(handles[0].at).toEqual([600, 100]);
		expect(handles[0].local).toEqual([1, 1]);
		const back = handles[0].toLocal;
		expect(back[0] * 600 + back[2] * 100 + back[4]).toBeCloseTo(1);
	});

	it('explains missing handle positions', () => {
		expect(() => run([group([handle({ bind: 'nope' })], { id: 'g' })])).toThrow(/handle bound to "nope" at group#g > handle/);
	});
});
