import { arrow, colors, defineObject, group, text, vec, type Vec2 } from '#engine';

export interface VectorParams {
	/** Tip position (world units). */
	to: Vec2;
	/** Tail position. Default: the origin. */
	from?: Vec2;
	/** Label text, e.g. `'a'` or `'a + b'`. */
	label?: string;
	/**
	 * Where the label goes: just beyond the `'tip'` (default), or beside the
	 * middle of the arrow on its `'left'` / `'right'` (as seen looking from tail
	 * to tip). Use left/right when several arrows end at the same point.
	 */
	labelAt?: 'tip' | 'left' | 'right';
	/** Distance in px between the arrow and the label. */
	labelGap?: number;
}

export const vector = defineObject<VectorParams>(
	{
		name: 'vector',
		category: 'math',
		description:
			'An arrow from `from` (default origin) to `to`, with an optional label at the tip or beside the arrow. Pair with `handle({ bind })` to make it draggable.',
		usage: `vector({ to: state.a, label: 'a', color: colors.blue })
vector({ from: state.a, to: vec.add(state.a, state.b), label: 'b', labelAt: 'right', color: colors.red })`,
		example: (vector) => vector({ to: [2, 1], label: 'v' })
	},
	({ to, from = [0, 0], label, labelAt = 'tip', labelGap = 22, color = colors.blue }) => {
		const d = vec.normalize(vec.sub(to, from));
		const dir: Vec2 = vec.equals(d, [0, 0]) ? [0, 1] : d;
		const at = labelAt === 'tip' ? to : vec.midpoint(from, to);
		const away = labelAt === 'tip' ? dir : labelAt === 'left' ? vec.perp(dir) : vec.neg(vec.perp(dir));
		return group(
			[
				arrow({ from, to }),
				label &&
					text({
						text: label,
						at,
						offset: vec.scale(away, labelAt === 'tip' ? labelGap : labelGap * 0.75),
						fontFamily: 'serif',
						fontStyle: 'italic'
					})
			],
			{ color }
		);
	}
);
