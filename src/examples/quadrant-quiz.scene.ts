/**
 * Quiz: where does the sum point?
 *
 * A small (+, +) vector is added to a big (−, −) vector. Drag the answer arrow to where a + b points.
 *
 * Quiz-style interaction: the learner drags the answer vector; `checks`
 * report whether the answer is correct (the lesson UI will consume these).
 */
import { colors, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

const small: Vec2 = [1, 0.6];
const big: Vec2 = [-3, -2.2];

export default defineScene({
	view: { x: [-6, 6], y: [-3.6, 3.6] },
	state: { answer: [2, 2] as Vec2 },
	checks: {
		inThirdQuadrant: (s) => vec.quadrant(s.answer) === 3,
		// stricter check: within 30° of the true direction
		closeToSum: (s) => Math.abs(vec.angle(s.answer) - vec.angle(vec.add(small, big))) < Math.PI / 6
	},
	draw: ({ state }) => {
		const correct = vec.quadrant(state.answer) === 3;
		return [
			axes({ x: [-5, 5], y: [-3.2, 3.2], grid: true, numbers: false }),
			vector({ to: small, label: 'a', color: colors.blue }),
			vector({ to: big, label: 'b', color: colors.red, opacity: 0.85 }),
			vector({ to: state.answer, label: 'a + b ?', color: correct ? colors.green : colors.yellow }),
			handle({ bind: 'answer', color: correct ? colors.green : colors.yellow })
		];
	}
});
