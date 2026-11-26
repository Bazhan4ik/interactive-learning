/**
 * Smoke tests for every scene file (`*.scene.ts`) in the project: engine
 * examples and lesson scenes. This is also the validation step for
 * LLM-generated scenes: a generated file must pass these before it is shown
 * to a learner.
 */
import { describe, expect, it } from 'vitest';
import { evaluateScene, renderSvg, type Scene } from '#engine';

const modules = import.meta.glob<{ default: unknown }>('./**/*.scene.ts', { eager: true });

const isScene = (x: unknown): x is Scene => typeof x === 'object' && x !== null && 'definition' in x && 'viewport' in x;

describe('scenes', () => {
	it('found scene files', () => {
		expect(Object.keys(modules).length).toBeGreaterThan(0);
	});

	for (const [file, mod] of Object.entries(modules)) {
		describe(file, () => {
			it('default-exports a scene', () => {
				expect(isScene(mod.default)).toBe(true);
			});
			if (!isScene(mod.default)) return;
			const scene = mod.default;
			const times = scene.duration > 0 ? [0, scene.duration * 0.25, scene.duration * 0.5, scene.duration * 0.75, scene.duration] : [0];

			it('renders at every sampled time', () => {
				for (const t of times) {
					const svg = renderSvg(evaluateScene(scene, { t }));
					expect(svg, `t=${t}`).not.toMatch(/NaN|undefined|Infinity/);
				}
			});

			it('binds handles only to keys declared in state', () => {
				for (const t of times) {
					for (const h of evaluateScene(scene, { t }).handles) {
						expect(Object.keys(scene.initialState), `handle "${h.bind}" at t=${t}`).toContain(h.bind);
					}
				}
			});

			it('has JSON-serialisable state (so it can be saved and restored)', () => {
				expect(JSON.parse(JSON.stringify(scene.initialState))).toEqual(scene.initialState);
			});
		});
	}
});
