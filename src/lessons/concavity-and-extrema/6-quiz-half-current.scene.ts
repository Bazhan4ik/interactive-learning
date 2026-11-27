/**
 * Quiz: when has the current dropped to half its starting value?
 *
 * I(t)/I₀ = e^(−t/τ) with τ = 2 s. The learner slides a point along the curve.
 * Graded by `halfCurrent`: within 0.12 s of t = τ ln 2 ≈ 1.39 s.
 */
import { clamp, colors, defineScene, dot, handle, type Range } from '#engine';
import { axes, functionGraph, plot } from '#library';

const TAU = 2;
const current = (t: number) => Math.exp(-t / TAU);
const X: Range = [0, 8];
const Y: Range = [0, 1.1];

export default defineScene({
	view: { x: [-6.5, 6.5], y: [-3.7, 3.7] },
	state: { t: 5 },
	checks: {
		halfCurrent: (s) => Math.abs(s.t - TAU * Math.LN2) < 0.12
	},
	draw: ({ state }) => [
		plot({
			x: X,
			y: Y,
			into: { x: [-5.6, 6], y: [-3.2, 3.3] },
			children: [
				axes({ x: [0, 8.3], y: [0, 1.08], step: [1, 0.25], decimals: 2, grid: true, xLabel: 't (s)', yLabel: 'I / I₀' }),
				functionGraph({ f: current, x: X, color: colors.orange }),
				dot({ at: [state.t, current(state.t)], color: colors.yellow }),
				handle({
					bind: 't',
					at: [state.t, current(state.t)],
					constrain: ([t]) => {
						const ct = clamp(t, 0, 7.8);
						return [ct, current(ct)];
					},
					map: ([t]) => t,
					color: colors.yellow
				})
			]
		})
	]
});
