import { defineObject, group, line, type Child, type Mat, type Range } from '#engine';

export interface PlotParams {
	/** Data range along x, e.g. time `[0, 10]` seconds. */
	x: Range;
	/** Data range along y. */
	y: Range;
	/** The rectangle of the scene (world units) the data range is stretched onto. */
	into: { x: Range; y: Range };
	/** Contents, drawn in data coordinates: axes, graphs, dots, handles... */
	children: Child;
}

/** The transform from data coordinates to the `into` box. */
export function plotTransform(x: Range, y: Range, into: { x: Range; y: Range }): Mat {
	const sx = (into.x[1] - into.x[0]) / (x[1] - x[0]);
	const sy = (into.y[1] - into.y[0]) / (y[1] - y[0]);
	return [sx, 0, 0, sy, into.x[0] - sx * x[0], into.y[0] - sy * y[0]];
}

export const plot = defineObject<PlotParams>(
	{
		name: 'plot',
		category: 'math',
		description:
			'A coordinate system with its own units, placed in a box of the scene. Children are drawn in data coordinates, so x and y can have different scales (seconds vs. coulombs, n = 1…40 vs. 2.5…2.8). Use several plots to put graphs side by side or stacked. Handles inside work in data coordinates too.',
		usage: `plot({
  x: [0, 10], y: [0, 1.2], into: { x: [0, 6], y: [-3, 3] },
  children: [axes({ x: [0, 10], y: [0, 1.2], step: [2, 0.5] }), functionGraph({ f: Q, x: [0, 10] })]
})`,
		example: (plot) => plot({ x: [0, 40], y: [0, 4], into: { x: [-3, 3], y: [-2, 2] }, children: [line({ from: [0, 0], to: [40, 4] })] })
	},
	({ x, y, into, children }) => {
		if (!(x[1] > x[0] && y[1] > y[0])) throw new Error('`x` and `y` ranges must be increasing');
		return group(children, { transform: plotTransform(x, y, into) });
	}
);
