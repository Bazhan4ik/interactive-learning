/**
 * Quiz scene: point to the global minimum
 *
 * Example of a graph question: the learner slides a point along y = f(x) on
 * the interval [−3, 3]. `atGlobalMinimum` grades the answer; `atLocalMinimum`
 * lets a lesson give a more helpful hint ("that's only a local minimum").
 * Use from a lesson as `{ type: 'scene', scene, check: 'atGlobalMinimum' }`.
 */
import { clamp, colors, defineScene, dot, handle, line, type Range } from '#engine';
import { axes, functionGraph } from '#library';

const f = (x: number) => 0.12 * x ** 4 - 0.9 * x ** 2 + 0.35 * x + 0.5;
const INTERVAL: Range = [-3, 3];
const TOLERANCE = 0.15;

/** Local minima of f on the interval, found by dense sampling (fine for a smooth 1D f). */
function minima(): number[] {
	const n = 3000;
	const xs = Array.from({ length: n + 1 }, (_, i) => INTERVAL[0] + ((INTERVAL[1] - INTERVAL[0]) * i) / n);
	return xs.filter((x, i) => i > 0 && i < n && f(x) <= f(xs[i - 1]) && f(x) <= f(xs[i + 1]));
}
const LOCAL_MINIMA = minima();
const GLOBAL_MINIMUM = LOCAL_MINIMA.reduce((best, x) => (f(x) < f(best) ? x : best));

export default defineScene({
	view: { x: [-4.5, 4.5], y: [-2.2, 2.8] },
	state: { x: 0 },
	checks: {
		atGlobalMinimum: (s) => Math.abs(s.x - GLOBAL_MINIMUM) < TOLERANCE,
		atLocalMinimum: (s) => LOCAL_MINIMA.some((m) => Math.abs(s.x - m) < TOLERANCE)
	},
	draw: ({ state }) => {
		const p: [number, number] = [state.x, f(state.x)];
		return [
			axes({ x: [-4, 4], y: [-2, 2.5], numbers: true, xLabel: 'x', yLabel: 'y' }),
			// the interval
			line({ from: [INTERVAL[0], -2], to: [INTERVAL[0], 2.5], color: colors.muted, dash: [4, 6], strokeWidth: 1 }),
			line({ from: [INTERVAL[1], -2], to: [INTERVAL[1], 2.5], color: colors.muted, dash: [4, 6], strokeWidth: 1 }),
			functionGraph({ f, x: [-3.6, 3.6], y: [-2, 2.5], color: colors.faint }),
			functionGraph({ f, x: INTERVAL, y: [-2, 2.5], color: colors.blue }),
			dot({ at: p, color: colors.yellow }),
			handle({
				bind: 'x',
				at: p,
				constrain: ([x]) => {
					const cx = clamp(x, INTERVAL[0], INTERVAL[1]);
					return [cx, f(cx)];
				},
				map: ([x]) => x,
				color: colors.yellow
			})
		];
	}
});
