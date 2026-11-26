import { describe, expect, it } from 'vitest';
import { create } from '../animation/effects';
import { circle, handle, text } from '../nodes/shapes';
import type { Vec2 } from '../math/vec';
import { renderSvg } from '../render/svg-string';
import { defineScene, evaluateScene, SceneError } from './scene';

describe('scenes', () => {
	const scene = defineScene({
		title: 'test',
		state: { p: [1, 0] as Vec2 },
		timeline: { grow: 2 },
		checks: { right: (s) => s.p[0] > 0 },
		draw: (ctx) => [create(circle({ radius: 1 }), ctx.p('grow')), handle({ bind: 'p' }), ctx.t > 1 && text({ text: 'late', at: [0, 0] })]
	});

	it('derives duration and autoplay from the timeline', () => {
		expect(scene.duration).toBe(2);
		expect(scene.autoplay).toBe(true);
	});

	it('is a pure function of state and time', () => {
		expect(evaluateScene(scene, { t: 0 }).primitives).toHaveLength(0);
		expect(evaluateScene(scene, { t: 2 }).primitives).toHaveLength(2);
		expect(renderSvg(evaluateScene(scene, { t: 1.5 }))).toBe(renderSvg(evaluateScene(scene, { t: 1.5 })));
	});

	it('clamps time into [0, duration]', () => {
		expect(evaluateScene(scene, { t: 50 }).t).toBe(2);
	});

	it('evaluates checks against state', () => {
		expect(evaluateScene(scene).checks).toEqual({ right: true });
		expect(evaluateScene(scene, { state: { p: [-1, 0] } }).checks).toEqual({ right: false });
	});

	it('wraps errors with the scene title and phase', () => {
		const broken = defineScene({
			title: 'broken',
			draw: (ctx) => [create(circle(), ctx.p('missing'))]
		});
		try {
			evaluateScene(broken);
			expect.unreachable();
		} catch (e) {
			expect(e).toBeInstanceOf(SceneError);
			expect((e as SceneError).phase).toBe('draw');
			expect((e as Error).message).toMatch(/\[broken\] draw failed: timeline: unknown phase "missing"/);
		}
	});

	it('validates definitions', () => {
		expect(() => defineScene({ title: 'x', draw: 1 as never })).toThrow(/define failed: `draw` must be a function/);
		expect(() => defineScene({ title: 'x', view: { x: [1, 0], y: [0, 1] }, draw: () => null })).toThrow(/increasing/);
	});
});
