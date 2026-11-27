/**
 * Scalar multiplication.
 *
 * A draggable vector v and a slider for k; k·v is drawn on the dashed line
 * through the origin that all multiples of v lie on.
 */
import { colors, constraints, defineScene, handle, round, text, vec, type Range, type Vec2 } from '#engine';
import { axes, infiniteLine, slider, vector } from '#library';

/** Keeps v small enough that k·v stays on screen for every k on the slider. */
const limit = constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-2.5, 2.5], [-1.5, 1.5]));
const num = (x: number) => String(round(x, 1)).replace('-', '−');
const X: Range = [-6.5, 6.5];
const Y: Range = [-3.8, 3.8];

export default defineScene({
	// extra room at the bottom for the slider, outside the grid
	view: { x: [-7, 7], y: [-4.8, 4] },
	state: { v: [2, 1] as Vec2, k: 2 },
	draw: ({ state }) => {
		const { v, k } = state;
		const kv = vec.scale(v, k);

		return [
			axes({ x: X, y: Y, grid: true, numbers: false }),
			infiniteLine({ through: [0, 0], direction: v, x: X, y: Y, dash: [4, 6], strokeWidth: 1, opacity: 0.6 }),
			vector({ to: kv, label: `${num(k)}v`, color: colors.yellow, strokeWidth: 6, opacity: 0.85 }),
			vector({ to: v, label: 'v', labelAt: 'left', color: colors.blue }),
			handle({ bind: 'v', constrain: limit, color: colors.blue }),
			text({ text: `${num(k)} · (${num(v[0])}, ${num(v[1])}) = (${num(kv[0])}, ${num(kv[1])})`, at: [-6.6, 3.55], anchor: 'start', fontSize: 16, color: colors.yellow }),
			slider({ bind: 'k', value: k, min: -2, max: 2.5, step: 0.1, from: [-6.3, -4.45], to: [-2.3, -4.45], label: 'k', decimals: 1 })
		];
	}
});
