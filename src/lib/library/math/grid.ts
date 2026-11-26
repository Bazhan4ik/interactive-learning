import { colors, defineObject, group, line, type Range, type Vec2 } from '#engine';

export interface GridParams {
	x?: Range;
	y?: Range;
	/** Spacing between lines (world units), or `[stepX, stepY]`. */
	step?: number | Vec2;
}

/** Multiples of `step` inside `[min, max]`, computed without float drift. */
export function gridValues([min, max]: Range, step: number): number[] {
	if (!(step > 0)) throw new Error(`step must be > 0, got ${step}`);
	const out: number[] = [];
	for (let i = Math.ceil(min / step - 1e-9); i * step <= max + 1e-9; i++) out.push(+(i * step).toFixed(10));
	return out;
}

export const grid = defineObject<GridParams>(
	{
		name: 'grid',
		category: 'math',
		description: 'Faint background grid lines at regular spacing. Usually used through `axes({ grid: true })`.',
		usage: `grid({ x: [-5, 5], y: [-3, 3], step: 1 })`,
		example: (grid) => grid({ x: [-4, 4], y: [-3, 3], step: 1 })
	},
	({ x = [-5, 5], y = [-3, 3], step = 1, color = colors.faint, strokeWidth = 1 }) => {
		const [sx, sy] = typeof step === 'number' ? [step, step] : step;
		return group(
			[
				...gridValues(x, sx).map((v) => line({ from: [v, y[0]], to: [v, y[1]] })),
				...gridValues(y, sy).map((v) => line({ from: [x[0], v], to: [x[1], v] }))
			],
			{ color, strokeWidth }
		);
	}
);
