import { clamp, colors, constraints, defineObject, group, handle, line, round, snap, text, vec, type Vec2 } from '#engine';

export interface SliderParams {
	/** State key holding the numeric value. */
	bind: string;
	/** Current value, i.e. `state[bind]`. */
	value: number;
	min: number;
	max: number;
	/** Track start / end (world units). */
	from: Vec2;
	to: Vec2;
	/** Shown above the track as `label = value`. */
	label?: string;
	/** Snap to multiples of `step`. */
	step?: number;
	decimals?: number;
}

export const slider = defineObject<SliderParams>(
	{
		name: 'slider',
		category: 'ui',
		description:
			'A draggable slider that writes a number into scene state. Use it to let learners vary a parameter (spring constant, frequency, angle...).',
		usage: `// state: { k: 2 }
slider({ bind: 'k', value: state.k, min: 0.5, max: 5, step: 0.1, from: [-6, -3.5], to: [-2, -3.5], label: 'k' })`,
		example: (slider) => slider({ bind: 'k', value: 2, min: 0, max: 5, from: [-3, 0], to: [3, 0], label: 'k' })
	},
	({ bind, value, min, max, from, to, label, step, decimals = 2, color = colors.yellow }) => {
		if (!(max > min)) throw new Error(`max (${max}) must be greater than min (${min})`);
		const t = clamp((value - min) / (max - min), 0, 1);
		const knob = vec.lerp(from, to, t);
		const toValue = (p: Vec2) => {
			const d = vec.sub(to, from);
			const u = clamp(vec.dot(vec.sub(p, from), d) / vec.dot(d, d), 0, 1);
			const v = min + u * (max - min);
			return step ? clamp(snap(v, step), min, max) : v;
		};
		return group([
			line({ from, to, color: colors.faint, strokeWidth: 4 }),
			t > 0 && line({ from, to: knob, color, strokeWidth: 4 }),
			label && text({ text: `${label} = ${round(value, decimals)}`, at: from, offset: [0, 20], anchor: 'start', fontSize: 15, color: colors.muted }),
			handle({ bind, at: knob, constrain: constraints.onSegment(from, to), map: toValue, color })
		]);
	}
);
