import { colors, defineObject, group, line, type Range, type Vec2 } from '#engine';

export interface InfiniteLineParams {
	/** Any point on the line. */
	through: Vec2;
	/** Direction of the line (any length, must not be zero). */
	direction: Vec2;
	/** The box to clip to — usually the same ranges as the axes. */
	x: Range;
	y: Range;
}

/**
 * Parameter range `[t0, t1]` for which `p + t·d` lies inside the box
 * (Liang–Barsky clipping), or null if the line misses the box.
 */
export function clipToBox(p: Vec2, d: Vec2, x: Range, y: Range): [number, number] | null {
	let t0 = -Infinity;
	let t1 = Infinity;
	for (const [pi, di, [lo, hi]] of [
		[p[0], d[0], x],
		[p[1], d[1], y]
	] as const) {
		if (di === 0) {
			if (pi < lo || pi > hi) return null;
			continue;
		}
		const a = (lo - pi) / di;
		const b = (hi - pi) / di;
		t0 = Math.max(t0, Math.min(a, b));
		t1 = Math.min(t1, Math.max(a, b));
	}
	return t0 <= t1 && Number.isFinite(t0) && Number.isFinite(t1) ? [t0, t1] : null;
}

export const infiniteLine = defineObject<InfiniteLineParams>(
	{
		name: 'infiniteLine',
		category: 'math',
		description:
			'A line extending in both directions, clipped to a box (usually the axes ranges). Draws nothing for a zero direction.',
		usage: `infiniteLine({ through: [0, 0], direction: state.v, x: [-6, 6], y: [-4, 4], dash: [4, 6] })`,
		example: (infiniteLine) => infiniteLine({ through: [0, 0], direction: [2, 1], x: [-3, 3], y: [-2, 2] })
	},
	({ through, direction, x, y, color = colors.muted }) => {
		const span = direction[0] === 0 && direction[1] === 0 ? null : clipToBox(through, direction, x, y);
		if (!span) return group([]);
		const at = (t: number): Vec2 => [through[0] + direction[0] * t, through[1] + direction[1] * t];
		return line({ from: at(span[0]), to: at(span[1]), color });
	}
);
