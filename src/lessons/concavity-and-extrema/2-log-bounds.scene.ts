/**
 * Trapping ln(1 + x) between x − x²/2 and x.
 *
 * The picker flips between the three functions ("values") and their
 * derivatives ("slopes"). That's the proof in one picture: the slopes are
 * ordered for x > 0 and all three functions start at 0, so the values end up
 * ordered the same way. Drag the marker on the x-axis to read off all three.
 */
import { clamp, colors, defineScene, dot, handle, line, marker, round, text, geometry, type Range } from '#engine';
import { axes, functionGraph, picker } from '#library';

const X: Range = [-0.8, 3.2];
const Y: Range = [-2.2, 3.2];

const CURVES = {
	values: [
		{ label: 'x', f: (x: number) => x, color: colors.red },
		{ label: 'ln(1 + x)', f: (x: number) => Math.log(1 + x), color: colors.blue },
		{ label: 'x − x²/2', f: (x: number) => x - (x * x) / 2, color: colors.yellow }
	],
	slopes: [
		{ label: '1', f: () => 1, color: colors.red },
		{ label: '1/(1 + x)', f: (x: number) => 1 / (1 + x), color: colors.blue },
		{ label: '1 − x', f: (x: number) => 1 - x, color: colors.yellow }
	]
};

const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(round(v, 3)).toFixed(3);

export default defineScene({
	view: { x: [-1.4, 7.4], y: [-2.6, 3.6] },
	state: { x0: 1, mode: 0 },
	draw: ({ state }) => {
		const mode = state.mode === 0 ? 'values' : 'slopes';
		const curves = CURVES[mode];
		const x0 = state.x0;
		const ys = curves.map((c) => c.f(x0));
		const ring = geometry.circlePath([0, 0], 7);

		return [
			axes({ x: [-1, 3.4], y: Y, step: 1, grid: true }),
			curves.map((c) => [
				// the claim is about x > 0; the part left of 0 is shown faintly
				functionGraph({ f: c.f, x: [X[0], 0], y: Y, color: c.color, opacity: 0.3 }),
				functionGraph({ f: c.f, x: [0, X[1]], y: Y, color: c.color }),
				text({ text: c.label, at: [X[1], clamp(c.f(X[1]), Y[0], Y[1])], offset: [10, 0], anchor: 'start', fontSize: 15, color: c.color })
			]),

			// the shared starting point
			mode === 'values'
				? [
						marker({ at: [0, 0], path: ring, color: colors.foreground, strokeWidth: 2 }),
						text({ text: 'all equal 0 at x = 0', at: [0, 0], offset: [-10, 18], anchor: 'end', fontSize: 13, color: colors.muted })
					]
				: [
						marker({ at: [0, 1], path: ring, color: colors.foreground, strokeWidth: 2 }),
						text({ text: 'all slopes = 1 at x = 0', at: [0, 1], offset: [-10, 18], anchor: 'end', fontSize: 13, color: colors.muted })
					],

			// the reading at x0
			line({ from: [x0, Math.min(0, ...ys)], to: [x0, Math.max(0, ...ys)], color: colors.muted, dash: [4, 5], strokeWidth: 1 }),
			curves.map((c, i) => dot({ at: [x0, ys[i]], color: c.color })),
			handle({ bind: 'x0', at: [x0, 0], constrain: (p) => [clamp(p[0], 0.05, 3), 0], map: ([x]) => x, color: colors.foreground }),

			text({ text: `at x = ${fmt(x0)}`, at: [4.2, 3.1], anchor: 'start', fontSize: 15, color: colors.muted }),
			curves.map((c, i) =>
				text({ text: `${c.label} = ${fmt(ys[i])}`, at: [4.2, 2.55 - i * 0.5], anchor: 'start', fontSize: 16, color: c.color })
			),
			text({ text: mode === 'values' ? 'largest → smallest' : 'steepest → least steep', at: [4.2, 1.05], anchor: 'start', fontSize: 13, color: colors.muted }),

			picker({ bind: 'mode', value: state.mode, options: ['values', 'slopes'], from: [4.5, -1.3], to: [6.6, -1.3] })
		];
	}
});
