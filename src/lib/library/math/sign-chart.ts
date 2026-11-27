import { colors, defineObject, geometry, group, line, marker, round, text, type Color, type Range } from '#engine';
import { signRuns } from './function-graph';

export interface SignChartParams {
	/** The function whose sign is charted, e.g. `f'` or `f''`. */
	f: (x: number) => number;
	/** Interval to chart (world / plot units). */
	x: Range;
	/** Height at which the chart is drawn. */
	at: number;
	/** Name shown at the left, e.g. `"f′"`. */
	label?: string;
	/** Label the x-values where the sign changes. */
	roots?: boolean;
	decimals?: number;
	positive?: Color;
	negative?: Color;
}

export const signChart = defineObject<SignChartParams>(
	{
		name: 'signChart',
		category: 'math',
		description:
			'A sign chart: a strip showing where a function is positive (+) or negative (−) over an interval, with the sign-change points marked. Use for f′ (increasing/decreasing) or f″ (concavity).',
		usage: `signChart({ f: (x) => (x - 1) * (x - 2), x: [0, 3], at: -1, label: "f′" })`,
		example: (signChart) => signChart({ f: (x) => (x - 1) * (x + 1), x: [-2, 2], at: 0, label: 'f″' })
	},
	({ f, x, at, label, roots = true, decimals = 2, positive = colors.green, negative = colors.red, color = colors.muted }) => {
		const runs = signRuns(f, x);
		const tick = geometry.linePath([0, -7], [0, 7]);
		return group(
			[
				line({ from: [x[0], at], to: [x[1], at], strokeWidth: 1 }),
				runs.map((r) => {
					const c = r.sign > 0 ? positive : r.sign < 0 ? negative : color;
					const mid = (r.from + r.to) / 2;
					return [
						line({ from: [r.from, at], to: [r.to, at], color: c, strokeWidth: 7, opacity: 0.35, lineCap: 'butt' }),
						text({ text: r.sign > 0 ? '+' : r.sign < 0 ? '−' : '0', at: [mid, at], offset: [0, 15], color: c, fontSize: 17, fontWeight: 600 })
					];
				}),
				runs.slice(1).map((r) => [
					marker({ at: [r.from, at], path: tick, strokeWidth: 1.5, color: colors.foreground }),
					roots && text({ text: String(round(r.from, decimals)).replace('-', '−'), at: [r.from, at], offset: [0, -17], fontSize: 13 })
				]),
				label && text({ text: label, at: [x[0], at], offset: [-12, 0], anchor: 'end', fontFamily: 'serif', fontStyle: 'italic' })
			],
			{ color }
		);
	}
);
