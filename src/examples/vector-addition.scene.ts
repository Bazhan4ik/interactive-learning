/**
 * Vector addition
 *
 * Drag the tips of a and b. a + b is the diagonal of the parallelogram they span.
 *
 * Interactive: drag the tips of a and b; the sum and parallelogram follow.
 */
import { colors, constraints, defineScene, handle, line, round, text, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

const fmt = (v: Vec2) => `(${round(v[0], 1)}, ${round(v[1], 1)})`;

export default defineScene({
	view: { x: [-6, 6], y: [-3.5, 3.5] },
	state: { a: [3, 1] as Vec2, b: [1, 2] as Vec2 },
	draw: ({ state }) => {
		const { a, b } = state;
		const sum = vec.add(a, b);
		const snap = constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-5, 5], [-3, 3]));
		return [
			axes({ x: [-5.5, 5.5], y: [-3.2, 3.2], grid: true, numbers: false }),
			// parallelogram guides
			line({ from: a, to: sum, color: colors.red, dash: [5, 6], strokeWidth: 1.5, opacity: 0.6 }),
			line({ from: b, to: sum, color: colors.blue, dash: [5, 6], strokeWidth: 1.5, opacity: 0.6 }),
			vector({ to: sum, label: 'a + b', color: colors.yellow }),
			vector({ to: a, label: 'a', color: colors.blue }),
			vector({ to: b, label: 'b', color: colors.red }),
			handle({ bind: 'a', constrain: snap, color: colors.blue }),
			handle({ bind: 'b', constrain: snap, color: colors.red }),
			text({ text: `a + b = ${fmt(sum)}`, at: [-5.6, 3.1], anchor: 'start', fontSize: 16, color: colors.muted })
		];
	}
});
