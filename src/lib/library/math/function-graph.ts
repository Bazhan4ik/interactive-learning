import { colors, defineObject, geometry, path, type Range } from '#engine';

export interface FunctionGraphParams {
	/** The function to plot, `y = f(x)`. */
	f: (x: number) => number;
	/** Domain to plot. */
	x: Range;
	/**
	 * Visible y range. Values far outside it are treated as gaps, so
	 * asymptotes (e.g. `Math.tan`) don't draw vertical spikes.
	 */
	y?: Range;
	samples?: number;
}

export const functionGraph = defineObject<FunctionGraphParams>(
	{
		name: 'functionGraph',
		category: 'math',
		description: 'Plot of y = f(x) over a domain. Handles discontinuities and asymptotes by leaving gaps.',
		usage: `functionGraph({ f: (x) => Math.sin(state.k * x), x: [-5, 5], y: [-3, 3], color: colors.yellow })`,
		example: (functionGraph) => functionGraph({ f: Math.tan, x: [-4, 4], y: [-3, 3] })
	},
	({ f, x, y, samples = 240, color = colors.yellow }) => {
		const margin = y ? (y[1] - y[0]) * 0.5 : 0;
		const inRange = (v: number) => !y || (v >= y[0] - margin && v <= y[1] + margin);
		const p = geometry.parametricPath(
			(t) => {
				const v = f(t);
				return [t, Number.isFinite(v) && inRange(v) ? v : NaN];
			},
			x[0],
			x[1],
			samples
		);
		return path({ path: p, color });
	}
);
