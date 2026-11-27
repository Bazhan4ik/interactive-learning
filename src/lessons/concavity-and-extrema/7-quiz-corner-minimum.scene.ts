/**
 * Quiz: find a local minimum where the derivative does not exist.
 *
 * g(x) = |x² − 4| / 2 has corners (no derivative) at x = ±2, which are local
 * minima, and a smooth local maximum at 0. The learner slides a point along
 * the curve. Graded by `atLocalMinimum`: within 0.12 of x = −2 or x = 2.
 */
import { clamp, colors, defineScene, dot, handle, type Range } from '#engine';
import { axes, functionGraph, plot } from '#library';

const g = (x: number) => Math.abs(x * x - 4) / 2;
const X: Range = [-3.2, 3.2];
const Y: Range = [-0.6, 3.4];

export default defineScene({
	view: { x: [-6.5, 6.5], y: [-3.7, 3.7] },
	state: { x: 0.6 },
	checks: {
		atLocalMinimum: (s) => Math.abs(Math.abs(s.x) - 2) < 0.12
	},
	draw: ({ state }) => [
		plot({
			x: X,
			y: Y,
			into: { x: [-6, 6], y: [-3.4, 3.4] },
			children: [
				axes({ x: X, y: Y, step: [1, 1], grid: true, xLabel: 'x', yLabel: 'y' }),
				functionGraph({ f: g, x: X, y: Y, color: colors.blue, samples: 400 }),
				dot({ at: [state.x, g(state.x)], color: colors.yellow }),
				handle({
					bind: 'x',
					at: [state.x, g(state.x)],
					constrain: ([x]) => {
						const cx = clamp(x, -3.1, 3.1);
						return [cx, g(cx)];
					},
					map: ([x]) => x,
					color: colors.yellow
				})
			]
		})
	]
});
