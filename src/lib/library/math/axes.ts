import { clamp, colors, defineObject, geometry, group, line, marker, round, text, type Range, type Vec2 } from '#engine';
import { grid, gridValues } from './grid';

export interface AxesParams {
	/** Extent of the x axis in world units. Default `[-5, 5]`. */
	x?: Range;
	/** Extent of the y axis in world units. Default `[-3, 3]`. */
	y?: Range;
	/** Tick spacing, or `[stepX, stepY]`. Default 1. */
	step?: number | Vec2;
	ticks?: boolean;
	/** Number labels at the ticks. */
	numbers?: boolean;
	/** Faint grid lines behind the axes. */
	grid?: boolean;
	xLabel?: string;
	yLabel?: string;
	/** Arrow tips at the positive ends. */
	tips?: boolean;
	/** Decimal places for number labels. */
	decimals?: number;
}

const TICK_PX = 5;

export const axes = defineObject<AxesParams>(
	{
		name: 'axes',
		category: 'math',
		description:
			'Cartesian x/y axes with ticks, number labels and optional grid. World coordinates map 1:1, so draw other objects (vectors, graphs) directly at their math coordinates.',
		usage: `axes({ x: [-5, 5], y: [-3, 3], step: 1, grid: true, xLabel: 'x', yLabel: 'y' })`,
		example: (axes) => axes({ x: [-4, 4], y: [-3, 3], grid: true, xLabel: 'x', yLabel: 'y' })
	},
	({
		x = [-5, 5],
		y = [-3, 3],
		step = 1,
		ticks = true,
		numbers = true,
		grid: showGrid = false,
		xLabel,
		yLabel,
		tips = true,
		decimals = 2,
		color = colors.muted
	}) => {
		const [sx, sy] = typeof step === 'number' ? [step, step] : step;
		// Axes cross at the origin, or at the nearest edge if the origin is out of range.
		const ox = clamp(0, x[0], x[1]);
		const oy = clamp(0, y[0], y[1]);
		const tip = tips ? 'end' : undefined;
		const fmt = (v: number) => String(round(v, decimals));
		const tickX = geometry.linePath([0, -TICK_PX], [0, TICK_PX]);
		const tickY = geometry.linePath([-TICK_PX, 0], [TICK_PX, 0]);
		const xs = gridValues(x, sx).filter((v) => v !== ox && v < x[1]);
		const ys = gridValues(y, sy).filter((v) => v !== oy && v < y[1]);

		return group(
			[
				showGrid && grid({ x, y, step }),
				line({ id: 'x-axis', from: [x[0], oy], to: [x[1], oy], tip, strokeWidth: 2 }),
				line({ id: 'y-axis', from: [ox, y[0]], to: [ox, y[1]], tip, strokeWidth: 2 }),
				ticks && xs.map((v) => marker({ at: [v, oy], path: tickX, strokeWidth: 1.5 })),
				ticks && ys.map((v) => marker({ at: [ox, v], path: tickY, strokeWidth: 1.5 })),
				numbers && xs.map((v) => text({ text: fmt(v), at: [v, oy], offset: [0, -18], fontSize: 14 })),
				numbers && ys.map((v) => text({ text: fmt(v), at: [ox, v], offset: [-12, 0], fontSize: 14, anchor: 'end' })),
				xLabel && text({ text: xLabel, at: [x[1], oy], offset: [0, 18], anchor: 'end', fontStyle: 'italic', fontFamily: 'serif' }),
				yLabel && text({ text: yLabel, at: [ox, y[1]], offset: [14, -4], anchor: 'start', fontStyle: 'italic', fontFamily: 'serif' })
			],
			{ color }
		);
	}
);
