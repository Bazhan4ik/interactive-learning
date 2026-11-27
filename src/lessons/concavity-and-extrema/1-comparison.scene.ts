/**
 * Comparison through derivatives, and why the shared anchor matters.
 *
 * f′ ≤ g′ everywhere. The learner drags the anchor a (where the graphs are
 * pinned together) and changes the offset g(a) − f(a) with the slider. The
 * gap between the graphs is green where f ≤ g and red where f > g: with
 * offset 0 the ordering flips exactly at a; with any offset it flips elsewhere.
 */
import { clamp, colors, defineScene, dot, handle, line, polygon, text, type Range, type Vec2 } from '#engine';
import { axes, functionGraph, signRuns, slider } from '#library';

const X: Range = [-5.5, 5.5];
const Y: Range = [-3.8, 3.8];
// g′ = 0.6 and f′ = 0.3 + 0.3 cos(1.2x) ≤ 0.6, so f′ ≤ g′ everywhere
const F = (x: number) => 0.3 * x + 0.25 * Math.sin(1.2 * x);
const G = (x: number) => 0.6 * x;

/** Filled region between two curves over [x0, x1], clamped to the visible y range. */
function between(f: (x: number) => number, g: (x: number) => number, x0: number, x1: number, color: string) {
	const n = Math.max(2, Math.ceil((x1 - x0) * 12));
	const xs = Array.from({ length: n + 1 }, (_, i) => x0 + ((x1 - x0) * i) / n);
	const clampY = (v: number) => clamp(v, Y[0], Y[1]);
	const points: Vec2[] = [...xs.map((x): Vec2 => [x, clampY(f(x))]), ...[...xs].reverse().map((x): Vec2 => [x, clampY(g(x))])];
	return polygon({ points, fill: color, fillOpacity: 0.16, stroke: 'none' });
}

export default defineScene({
	view: { x: [-6.2, 6.2], y: [-4.9, 4.1] },
	state: { a: 0, offset: 0 },
	draw: ({ state }) => {
		const { a, offset } = state;
		const f = (x: number) => F(x) - F(a);
		const g = (x: number) => G(x) - G(a) + offset;
		const labelAt = (h: (x: number) => number): Vec2 => [X[1], clamp(h(X[1]), Y[0], Y[1])];

		return [
			axes({ x: X, y: Y, grid: true, numbers: false }),
			signRuns((x) => g(x) - f(x), X).map((r) => between(f, g, r.from, r.to, r.sign >= 0 ? colors.green : colors.red)),
			line({ from: [a, Y[0]], to: [a, Y[1]], color: colors.muted, dash: [4, 6], strokeWidth: 1 }),
			text({ text: 'a', at: [a, 0], offset: [10, -16], fontFamily: 'serif', fontStyle: 'italic', color: colors.muted }),
			functionGraph({ f: g, x: X, y: Y, color: colors.orange }),
			functionGraph({ f, x: X, y: Y, color: colors.blue }),
			text({ text: 'g', at: labelAt(g), offset: [14, 0], color: colors.orange, fontFamily: 'serif', fontStyle: 'italic' }),
			text({ text: 'f', at: labelAt(f), offset: [14, 0], color: colors.blue, fontFamily: 'serif', fontStyle: 'italic' }),
			dot({ at: [a, g(a)], color: colors.orange }),
			handle({
				bind: 'a',
				at: [a, 0],
				constrain: (p) => [clamp(p[0], -3, 3), 0],
				map: ([x]) => Math.round(x * 10) / 10,
				color: colors.blue
			}),

			text({ text: 'f′ ≤ g′ everywhere', at: [-5.9, 3.75], anchor: 'start', fontSize: 15, color: colors.muted }),
			text({ text: '■ f ≤ g', at: [-5.9, 3.3], anchor: 'start', fontSize: 15, color: colors.green }),
			text({ text: '■ f > g', at: [-4.5, 3.3], anchor: 'start', fontSize: 15, color: colors.red }),
			slider({
				bind: 'offset',
				value: offset,
				min: -2,
				max: 2,
				step: 0.1,
				from: [-5.5, -4.45],
				to: [-1.5, -4.45],
				label: 'g(a) − f(a)',
				decimals: 1
			})
		];
	}
});
