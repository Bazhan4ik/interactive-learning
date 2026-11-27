/**
 * The first derivative test on f(x) = x³/3 − 3x²/2 + 2x + 1.
 *
 * Top: f, green where it increases and red where it decreases, with the local
 * max (1, 11/6) and local min (2, 5/3) marked. The learner drags a point; its
 * tangent turns green/red with the sign of f′. Bottom: the sign chart of
 * f′ = (x − 1)(x − 2), aligned with the graph, with the same point tracked.
 */
import { clamp, colors, defineScene, dot, handle, line, round, text, type Range } from '#engine';
import { axes, functionGraph, plot, plotTransform, signChart } from '#library';

const f = (x: number) => x ** 3 / 3 - (3 * x * x) / 2 + 2 * x + 1;
const fp = (x: number) => (x - 1) * (x - 2);

const X: Range = [0, 3.1];
const Y: Range = [0.95, 2.6];
const TOP = { x: [-6.2, 6.2] as Range, y: [-1.2, 4.2] as Range };
const BOTTOM = { x: TOP.x, y: [-3.6, -2.6] as Range };
const TANGENT = 0.35;
const num = (v: number) => String(round(v, 2)).replace('-', '−');

/** World y of a point on the top graph, to draw guides that span both plots. */
const worldY = (x: number) => {
	const m = plotTransform(X, Y, TOP);
	return m[3] * f(x) + m[5];
};
const worldX = (x: number) => {
	const m = plotTransform(X, Y, TOP);
	return m[0] * x + m[4];
};

export default defineScene({
	view: { x: [-7, 7], y: [-4.3, 4.5] },
	state: { x0: 0.4 },
	draw: ({ state }) => {
		const x0 = state.x0;
		const slope = fp(x0);
		const slopeColor = Math.abs(slope) < 0.02 ? colors.foreground : slope > 0 ? colors.green : colors.red;

		return [
			// guides from the critical points down to the sign chart
			[1, 2].map((c) => line({ from: [worldX(c), worldY(c)], to: [worldX(c), BOTTOM.y[1] - 0.5], color: colors.muted, dash: [3, 5], strokeWidth: 1 })),
			plot({
				x: X,
				y: Y,
				into: TOP,
				children: [
					axes({ x: [0, 3.1], y: [0.95, 2.55], step: [0.5, 0.25], decimals: 2, tips: false }),
					functionGraph({ f, x: X, y: Y, colorBySign: { of: fp, positive: colors.green, negative: colors.red } }),
					dot({ at: [1, f(1)], radius: 6, color: colors.foreground }),
					text({ text: 'local max (1, 11/6)', at: [1, f(1)], offset: [0, 22], fontSize: 14 }),
					dot({ at: [2, f(2)], radius: 6, color: colors.foreground }),
					text({ text: 'local min (2, 5/3)', at: [2, f(2)], offset: [0, -24], fontSize: 14 }),
					line({ from: [x0 - TANGENT, f(x0) - slope * TANGENT], to: [x0 + TANGENT, f(x0) + slope * TANGENT], color: slopeColor, strokeWidth: 3 }),
					dot({ at: [x0, f(x0)], color: colors.yellow }),
					// in the quadrant the tangent doesn't pass through: below-right when rising, above-right when falling
					text({ text: `f′ = ${num(slope)}`, at: [x0, f(x0)], offset: [14, slope >= 0 ? -18 : 18], anchor: 'start', fontSize: 14, color: slopeColor }),
					handle({
						bind: 'x0',
						at: [x0, f(x0)],
						constrain: ([x]) => {
							const cx = clamp(x, 0.1, 3.0);
							return [cx, f(cx)];
						},
						map: ([x]) => x,
						color: colors.yellow
					})
				]
			}),
			plot({
				x: X,
				y: [0, 1],
				into: BOTTOM,
				children: [signChart({ f: fp, x: X, at: 0.5, label: 'f′' }), dot({ at: [x0, 0.5], color: colors.yellow, radius: 5 })]
			})
		];
	}
});
