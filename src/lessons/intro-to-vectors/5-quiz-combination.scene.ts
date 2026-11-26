/**
 * Quiz: drag w to the linear combination 2a − b.
 *
 * a = (1, 1) and b = (2, −1) are fixed, so 2a − b = (0, 3). The learner drags
 * w on a 0.5 grid. Graded by the `isTwoAMinusB` check.
 */
import { colors, constraints, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

const a: Vec2 = [1, 1];
const b: Vec2 = [2, -1];
const target = vec.sub(vec.scale(a, 2), b);

export default defineScene({
	view: { x: [-6, 6], y: [-3.6, 3.9] },
	state: { w: [-2, -1] as Vec2 },
	checks: {
		isTwoAMinusB: (s) => vec.equals(s.w, target)
	},
	draw: ({ state }) => [
		axes({ x: [-5.5, 5.5], y: [-3.3, 3.6], grid: true, numbers: true }),
		vector({ to: a, label: 'a', color: colors.blue }),
		vector({ to: b, label: 'b', color: colors.red }),
		vector({ to: state.w, label: 'w', color: colors.yellow }),
		handle({ bind: 'w', constrain: constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-5, 5], [-3, 3.5])), color: colors.yellow })
	]
});
