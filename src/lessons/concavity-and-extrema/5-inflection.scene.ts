/**
 * Inflection points: real ones, fake candidates and excluded inputs.
 *
 * The picker switches between three functions from the lecture. The curve is
 * coloured by concavity and the sign chart of f″ sits underneath:
 *  - x⁴ − 6x²: f″ changes sign at ±1 → two inflection points (−1, −5), (1, −5)
 *  - x⁴: f″(0) = 0 but f″ ≥ 0 on both sides → no inflection
 *  - 1/x: concavity changes across 0, but 0 is not in the domain → no inflection
 */
import { colors, defineScene, dot, geometry, line, marker, text, type Range } from '#engine';
import { axes, functionGraph, picker, plot, signChart } from '#library';

interface Case {
	f: (x: number) => number;
	f2: (x: number) => number;
	name: string;
	x: Range;
	y: Range;
	step: [number, number];
	candidates: { x: number; kind: 'inflection' | 'no change' | 'not in domain'; label: string }[];
}

const CASES: Case[] = [
	{
		name: 'f(x) = x⁴ − 6x²',
		f: (x) => x ** 4 - 6 * x * x,
		f2: (x) => 12 * x * x - 12,
		x: [-3, 3],
		y: [-10, 8],
		step: [1, 2],
		candidates: [
			{ x: -1, kind: 'inflection', label: '(−1, −5)' },
			{ x: 1, kind: 'inflection', label: '(1, −5)' }
		]
	},
	{
		name: 'f(x) = x⁴',
		f: (x) => x ** 4,
		f2: (x) => 12 * x * x,
		x: [-2, 2],
		y: [-2, 8],
		step: [1, 2],
		candidates: [{ x: 0, kind: 'no change', label: 'f″(0) = 0, but no change: not an inflection' }]
	},
	{
		name: 'f(x) = 1/x',
		f: (x) => 1 / x,
		f2: (x) => 2 / x ** 3,
		x: [-4, 4],
		y: [-4, 4],
		step: [1, 1],
		candidates: [{ x: 0, kind: 'not in domain', label: 'changes across 0, but 0 is not in the domain' }]
	}
];

const BOX = { x: [-5.6, 5.6] as Range, y: [-2.2, 3.7] as Range };
const ring = geometry.circlePath([0, 0], 6);

export default defineScene({
	view: { x: [-6.8, 6.8], y: [-5.2, 4.3] },
	state: { which: 0 },
	draw: ({ state }) => {
		const c = CASES[state.which] ?? CASES[0];
		const [y0, y1] = c.y;
		const chartY = y0 - 0.2 * (y1 - y0); // just below the graph

		return [
			plot({
				x: c.x,
				y: c.y,
				into: BOX,
				children: [
					axes({ x: c.x, y: c.y, step: c.step, decimals: 0, tips: false }),
					functionGraph({ f: c.f, x: c.x, y: c.y, colorBySign: { of: c.f2, positive: colors.teal, negative: colors.purple } }),
					signChart({ f: c.f2, x: c.x, at: chartY, label: 'f″', positive: colors.teal, negative: colors.purple }),
					c.candidates.map((p) => {
						const y = p.kind === 'not in domain' ? 0 : c.f(p.x);
						return [
							line({ from: [p.x, chartY], to: [p.x, p.kind === 'not in domain' ? y1 : y], color: colors.orange, dash: [3, 5], strokeWidth: 1.2, opacity: 0.8 }),
							p.kind === 'inflection' && dot({ at: [p.x, y], radius: 6, color: colors.orange }),
							p.kind === 'no change' && marker({ at: [p.x, y], path: ring, color: colors.orange, strokeWidth: 2 }),
							p.kind === 'inflection'
								? // beside the point, towards the middle, clear of the guide line and the curve
									text({ text: p.label, at: [p.x, y], offset: [p.x <= 0 ? 10 : -10, -18], anchor: p.x <= 0 ? 'start' : 'end', fontSize: 14, color: colors.orange })
								: p.kind === 'no change'
									? // below the axis: x⁴ is never negative, so that space is empty
										text({ text: p.label, at: [p.x, y], offset: [10, -44], anchor: 'start', fontSize: 14, color: colors.orange })
									: // top-left of the asymptote: 1/x is negative there, so that space is empty
										text({ text: p.label, at: [p.x, y1], offset: [-12, -14], anchor: 'end', fontSize: 14, color: colors.orange })
						];
					})
				]
			}),
			text({ text: c.name, at: [-6.4, 4.0], anchor: 'start', fontSize: 17, fontFamily: 'serif', fontStyle: 'italic' }),
			text({ text: 'concave up', at: [4.2, 4.0], anchor: 'end', fontSize: 14, color: colors.teal }),
			text({ text: 'concave down', at: [6.4, 4.0], anchor: 'end', fontSize: 14, color: colors.purple }),
			picker({ bind: 'which', value: state.which, options: ['x⁴ − 6x²', 'x⁴', '1/x'], from: [-3, -4.5], to: [3, -4.5] })
		];
	}
});
