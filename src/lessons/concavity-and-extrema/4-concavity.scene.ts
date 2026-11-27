/**
 * Concavity is about how slopes change.
 *
 * Top: f(x) = (x³ − 9x)/6 with a draggable point, its tangent, and a chord
 * around it. Bottom: f′. Both curves are coloured by the sign of f″ = x:
 * purple where f is concave down (f′ decreasing), teal where it's concave up
 * (f′ increasing). Dragging across x = 0 shows the chord flip from below the
 * graph to above it while the tangent's slope starts increasing.
 */
import { clamp, colors, defineScene, dot, handle, line, round, text, type Range } from '#engine';
import { axes, functionGraph, plot } from '#library';

const f = (x: number) => (x ** 3 - 9 * x) / 6;
const fp = (x: number) => (x * x - 3) / 2;
const fpp = (x: number) => x;

const X: Range = [-3.6, 3.6];
const TOP_Y: Range = [-2.6, 2.6];
const BOTTOM_Y: Range = [-1.9, 5];
const CHORD = 1.3;
const TANGENT = 0.9;
const concavity = { of: fpp, positive: colors.teal, negative: colors.purple };
const num = (v: number) => String(round(v, 2)).replace('-', '−');

export default defineScene({
	view: { x: [-7, 7], y: [-4.6, 4.6] },
	state: { x0: -2 },
	draw: ({ state }) => {
		const x0 = state.x0;
		const slope = fp(x0);
		const a = clamp(x0 - CHORD, X[0], X[1]);
		const b = clamp(x0 + CHORD, X[0], X[1]);

		return [
			plot({
				x: X,
				y: TOP_Y,
				into: { x: [-6.3, 6.3], y: [0.3, 4.4] },
				children: [
					axes({ x: [-3.5, 3.5], y: [-2.5, 2.5], numbers: false, tips: false }),
					text({ text: 'f(x)', at: [0, 2.5], offset: [10, -4], anchor: 'start', fontFamily: 'serif', fontStyle: 'italic' }),
					// below the curve on the left, so it never collides with the slope label near the peak
					text({ text: 'concave down', at: [-2.2, -2.35], fontSize: 14, color: colors.purple }),
					text({ text: 'concave up', at: [2.2, 2.4], fontSize: 14, color: colors.teal }),
					functionGraph({ f, x: X, y: TOP_Y, colorBySign: concavity }),
					line({ from: [a, f(a)], to: [b, f(b)], color: colors.foreground, dash: [5, 5], strokeWidth: 1.5, opacity: 0.8 }),
					line({ from: [x0 - TANGENT, f(x0) - slope * TANGENT], to: [x0 + TANGENT, f(x0) + slope * TANGENT], color: colors.yellow, strokeWidth: 2.5 }),
					dot({ at: [x0, f(x0)], color: colors.yellow }),
					text({ text: `slope ${num(slope)}`, at: [x0, f(x0)], offset: [0, 24], fontSize: 14, color: colors.yellow }),
					handle({
						bind: 'x0',
						at: [x0, f(x0)],
						constrain: ([x]) => {
							const cx = clamp(x, -3.3, 3.3);
							return [cx, f(cx)];
						},
						map: ([x]) => x,
						color: colors.yellow
					})
				]
			}),
			plot({
				x: X,
				y: BOTTOM_Y,
				into: { x: [-6.3, 6.3], y: [-4.4, -0.4] },
				children: [
					axes({ x: [-3.5, 3.5], y: [-1.8, 4.9], numbers: false, tips: false }),
					text({ text: 'f′(x)', at: [0, 4.9], offset: [10, -4], anchor: 'start', fontFamily: 'serif', fontStyle: 'italic' }),
					text({ text: 'f′ decreasing', at: [-2.2, -1.45], fontSize: 14, color: colors.purple }),
					text({ text: 'f′ increasing', at: [2.2, 4.4], fontSize: 14, color: colors.teal }),
					functionGraph({ f: fp, x: X, y: BOTTOM_Y, colorBySign: concavity }),
					line({ from: [x0, 0], to: [x0, slope], color: colors.yellow, dash: [3, 4], strokeWidth: 1.5 }),
					dot({ at: [x0, slope], color: colors.yellow })
				]
			})
		];
	}
});
