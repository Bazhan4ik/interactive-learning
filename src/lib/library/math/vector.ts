import { arrow, colors, defineObject, group, text, vec, type Vec2 } from '#engine';

export interface VectorParams {
	/** Tip position (world units). */
	to: Vec2;
	/** Tail position. Default: the origin. */
	from?: Vec2;
	/** Label drawn just beyond the tip, e.g. `'a'` or `'a + b'`. */
	label?: string;
	/** Distance in px between the tip and the label. */
	labelGap?: number;
}

export const vector = defineObject<VectorParams>(
	{
		name: 'vector',
		category: 'math',
		description:
			'An arrow from `from` (default origin) to `to`, with an optional label beyond the tip. Pair with `handle({ bind })` to make it draggable.',
		usage: `vector({ to: state.a, label: 'a', color: colors.blue })
vector({ from: state.a, to: vec.add(state.a, state.b), label: 'b', color: colors.red })`,
		example: (vector) => vector({ to: [2, 1], label: 'v' })
	},
	({ to, from = [0, 0], label, labelGap = 22, color = colors.blue }) => {
		const dir = vec.normalize(vec.sub(to, from));
		return group(
			[
				arrow({ from, to }),
				label &&
					text({
						text: label,
						at: to,
						offset: vec.scale(vec.equals(dir, [0, 0]) ? [0, 1] : dir, labelGap),
						fontFamily: 'serif',
						fontStyle: 'italic'
					})
			],
			{ color }
		);
	}
);
