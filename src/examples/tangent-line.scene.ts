/**
 * Tangent line
 *
 * Drag the point along the curve; the tangent line shows the derivative there.
 *
 * A handle constrained to a curve: drag the point along y = f(x) and the
 * tangent line and slope readout follow. Shows `constrain` + `map`.
 */
import { clamp, colors, defineScene, dot, handle, line, round, text } from '#engine';
import { axes, functionGraph, slider } from '#library';

const X_RANGE = [-6, 6] as const;

export default defineScene({
	view: { x: [-7, 7], y: [-4, 4] },
	state: { x0: 1, b: 1 },
	draw: ({ state }) => {
		const f = (x: number) => 1.8 * Math.sin(state.b * x) + 0.1 * x * x - 1;
		const df = (x: number) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4;
		const x0 = state.x0;
		const p0: [number, number] = [x0, f(x0)];
		const slope = df(x0);
		const reach = 1.6 / Math.sqrt(1 + slope * slope);

		return [
			axes({ x: [-6.5, 6.5], y: [-3.5, 3.5], grid: true, numbers: false }),
			functionGraph({ f, x: X_RANGE, y: [-4, 4], color: colors.blue }),
			line({ from: [x0 - reach, f(x0) - slope * reach], to: [x0 + reach, f(x0) + slope * reach], color: colors.yellow, strokeWidth: 2.5 }),
			dot({ at: p0, color: colors.yellow }),
			handle({
				bind: 'x0',
				at: p0,
				// stay on the curve, store just the x coordinate
				constrain: ([x]) => {
					const cx = clamp(x, X_RANGE[0], X_RANGE[1]);
					return [cx, f(cx)];
				},
				map: ([x]) => x,
				color: colors.yellow
			}),
			text({ text: `f′(${round(x0, 2)}) = ${round(slope, 2)}`, at: p0, offset: [0, 26], fontSize: 16, color: colors.yellow }),
			slider({ bind: 'b', value: state.b, min: 0.2, max: 3, from: [-6.5, -3.6], to: [-3.5, -3.6], label: 'b', decimals: 2 })
		];
	}
});
