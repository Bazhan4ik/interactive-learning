/**
 * Quiz: make b perpendicular to a.
 *
 * a is fixed; the learner drags b (snapping to a 0.5 grid, so exact answers
 * are reachable). Graded by the `perpendicular` check: a · b = 0 and b ≠ 0.
 */
import { colors, constraints, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

const a: Vec2 = [2, 1];

export default defineScene({
	view: { x: [-6, 6], y: [-3.6, 3.6] },
	state: { b: [2.5, -0.5] as Vec2 },
	checks: {
		perpendicular: (s) => Math.abs(vec.dot(a, s.b)) < 1e-9 && vec.len(s.b) > 0
	},
	draw: ({ state }) => [
		axes({ x: [-5.5, 5.5], y: [-3.3, 3.3], grid: true, numbers: false }),
		vector({ to: a, label: 'a', color: colors.blue }),
		vector({ to: state.b, label: 'b', color: colors.red }),
		handle({ bind: 'b', constrain: constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-5, 5], [-3, 3])), color: colors.red })
	]
});
