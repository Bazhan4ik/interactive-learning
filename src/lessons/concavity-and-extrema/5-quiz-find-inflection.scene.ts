/**
 * Quiz: point to the inflection point of g(x) = x³ + 2x² − 1.
 *
 * A plain curve (no concavity colours, which would give the answer away) with
 * a point the learner slides along it. Graded by `atInflection`: within 0.12
 * of x = −2/3.
 */
import { clamp, colors, defineScene, dot, handle, type Range } from '#engine';
import { axes, functionGraph, plot } from '#library';

const g = (x: number) => x ** 3 + 2 * x * x - 1;
const X: Range = [-2.6, 1.3];
const Y: Range = [-4.2, 3.2];

export default defineScene({
	view: { x: [-6.5, 6.5], y: [-3.7, 3.7] },
	state: { x: 0.8 },
	checks: {
		atInflection: (s) => Math.abs(s.x + 2 / 3) < 0.12
	},
	draw: ({ state }) => [
		plot({
			x: X,
			y: Y,
			into: { x: [-6, 6], y: [-3.4, 3.4] },
			children: [
				axes({ x: X, y: Y, step: [0.5, 1], decimals: 1, grid: true, xLabel: 'x', yLabel: 'y' }),
				functionGraph({ f: g, x: X, y: Y, color: colors.blue }),
				dot({ at: [state.x, g(state.x)], color: colors.yellow }),
				handle({
					bind: 'x',
					at: [state.x, g(state.x)],
					constrain: ([x]) => {
						const cx = clamp(x, -2.4, 1.1);
						return [cx, g(cx)];
					},
					map: ([x]) => x,
					color: colors.yellow
				})
			]
		})
	]
});
