/**
 * Squeezing (1 + 1/n)^n towards e.
 *
 * The terms of the sequence appear one by one, trapped between the lower
 * bound e^(1 − 1/(2n)) and the ceiling e. The slider picks one n to read off.
 */
import { colors, defineScene, dot, fadeIn, line, round, stagger, text } from '#engine';
import { axes, functionGraph, plot, slider } from '#library';

const N = 40;
const term = (n: number) => (1 + 1 / n) ** n;
const lower = (n: number) => Math.exp(1 - 1 / (2 * n));
const DATA_Y: [number, number] = [1.9, 2.82];

export default defineScene({
	view: { x: [-7, 7], y: [-4.1, 3.9] },
	state: { n: 10 },
	timeline: { dots: 2.5 },
	draw: (ctx) => {
		const n = ctx.state.n;
		const shown = ctx.p('dots', 'linear');

		return [
			plot({
				x: [0, N + 1],
				y: DATA_Y,
				into: { x: [-6.2, 6.4], y: [-2.3, 3.5] },
				children: [
					axes({ x: [0, N + 1], y: DATA_Y, step: [5, 0.1], decimals: 1, xLabel: 'n' }),
					line({ from: [0, Math.E], to: [N + 1, Math.E], color: colors.green, dash: [6, 6], strokeWidth: 1.5 }),
					text({ text: 'e ≈ 2.718', at: [N + 1, Math.E], offset: [-4, 14], anchor: 'end', fontSize: 14, color: colors.green }),
					functionGraph({ f: lower, x: [0.5, N + 1], y: DATA_Y, color: colors.purple, strokeWidth: 2 }),
					text({ text: 'e^(1 − 1/(2n))', at: [N + 1, lower(N + 1)], offset: [-4, -16], anchor: 'end', fontSize: 14, color: colors.purple }),
					line({ from: [n, DATA_Y[0]], to: [n, term(n)], color: colors.muted, dash: [3, 5], strokeWidth: 1 }),
					Array.from({ length: N }, (_, i) => fadeIn(dot({ at: [i + 1, term(i + 1)], radius: 3.5, color: colors.blue }), stagger(shown, i, N, 0.9))),
					shown >= 1 && dot({ at: [n, term(n)], radius: 6, color: colors.yellow })
				]
			}),
			text({ text: `n = ${n}`, at: [1.2, -3.0], anchor: 'start', fontSize: 16, color: colors.yellow }),
			text({ text: `(1 + 1/n)ⁿ = ${round(term(n), 4).toFixed(4)}`, at: [1.2, -3.5], anchor: 'start', fontSize: 16, color: colors.blue }),
			text({ text: `e − (1 + 1/n)ⁿ = ${round(Math.E - term(n), 4).toFixed(4)}`, at: [1.2, -4.0], anchor: 'start', fontSize: 16, color: colors.muted }),
			slider({ bind: 'n', value: n, min: 1, max: N, step: 1, from: [-6.0, -3.6], to: [-1.2, -3.6], label: 'n', decimals: 0 })
		];
	}
});
