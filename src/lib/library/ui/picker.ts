import { colors, constraints, defineObject, dot, group, handle, line, text, vec, type Vec2 } from '#engine';

export interface PickerParams {
	/** State key holding the selected index (a number). */
	bind: string;
	/** Current index, i.e. `state[bind]`. */
	value: number;
	/** Option labels, shown under evenly spaced stops. */
	options: string[];
	/** Track start / end (world units). */
	from: Vec2;
	to: Vec2;
	/** Shown above the start of the track. */
	label?: string;
}

export const picker = defineObject<PickerParams>(
	{
		name: 'picker',
		category: 'ui',
		description:
			'A switch between a few named options (drag the knob to a stop). Writes the option index into state. Use it to let learners flip between cases: functions, views ("values" / "slopes"), scenarios.',
		usage: `// state: { which: 0 }
picker({ bind: 'which', value: state.which, options: ['x⁴ − 6x²', 'x⁴', '1/x'], from: [-3, -3.5], to: [3, -3.5] })`,
		example: (picker) => picker({ bind: 'which', value: 1, options: ['a', 'b', 'c'], from: [-3, 0], to: [3, 0], label: 'case' })
	},
	({ bind, value, options, from, to, label, color = colors.yellow }) => {
		if (options.length < 2) throw new Error('needs at least 2 options');
		const stops = options.map((_, i) => vec.lerp(from, to, i / (options.length - 1)));
		const nearest = (p: Vec2) => stops.reduce((best, s, i) => (vec.dist(p, s) < vec.dist(p, stops[best]) ? i : best), 0);
		const active = Math.min(options.length - 1, Math.max(0, Math.round(value)));
		return group([
			line({ from, to, color: colors.faint, strokeWidth: 4 }),
			stops.map((s, i) => [
				dot({ at: s, radius: 4, color: i === active ? color : colors.muted }),
				text({ text: options[i], at: s, offset: [0, -22], fontSize: 14, color: i === active ? colors.foreground : colors.muted })
			]),
			label && text({ text: label, at: from, offset: [0, 20], anchor: 'start', fontSize: 14, color: colors.muted }),
			handle({ bind, at: stops[active], constrain: constraints.onSegment(from, to), map: nearest, color })
		]);
	}
);
