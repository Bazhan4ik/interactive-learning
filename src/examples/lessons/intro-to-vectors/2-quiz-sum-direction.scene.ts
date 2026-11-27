/**
 * Quiz: where does a + b point?
 *
 * a small (+, +) vector a and a big (−, −) vector b are shown; the learner
 * drags the answer arrow to where they think a + b points. Graded by the
 * `inThirdQuadrant` check. Nothing in the diagram reveals whether the current
 * answer is right.
 */
import { colors, constraints, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

const a: Vec2 = [1, 0.6];
const b: Vec2 = [-3, -2.2];

export default defineScene({
	view: { x: [-6, 6], y: [-3.6, 3.6] },
	state: { answer: [2, 2] as Vec2 },
	checks: {
		inThirdQuadrant: (s) => vec.quadrant(s.answer) === 3
	},
	draw: ({ state }) => [
		axes({ x: [-5.5, 5.5], y: [-3.3, 3.3], grid: true, numbers: false }),
		vector({ to: a, label: 'a', color: colors.blue }),
		vector({ to: b, label: 'b', color: colors.red }),
		vector({ to: state.answer, label: 'a + b ?', color: colors.yellow }),
		handle({ bind: 'answer', constrain: constraints.inBox([-5, 5], [-3, 3]), color: colors.yellow })
	]
});
