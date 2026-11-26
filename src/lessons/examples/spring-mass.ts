/**
 * Animation + interaction combined: a mass on a spring oscillates over time,
 * the slider changes the spring constant, and the plot traces x(t).
 */
import { colors, defineScene, dot, line, text, translate, group } from '#engine';
import { axes, block, functionGraph, slider, spring, wall } from '#library';

const AMPLITUDE = 1.6;
const MASS = 1;
const DURATION = 12;
/** Where the graph's origin sits in the scene. */
const GRAPH_ORIGIN = [-6.5, -2.4] as const;

export default defineScene({
	title: 'Mass on a spring',
	description: 'x(t) = A·cos(√(k/m)·t). Drag the slider to change the spring constant k.',
	state: { k: 4 },
	duration: DURATION,
	loop: true,
	draw: ({ state, t }) => {
		const omega = Math.sqrt(state.k / MASS);
		const x = (time: number) => AMPLITUDE * Math.cos(omega * time);
		const blockW = 1.3;
		const blockCenter: [number, number] = [x(t), 1.25];

		return [
			// --- physical system ---
			wall({ from: [-6.5, 0.6], to: [-6.5, 2.6], side: 'left' }),
			wall({ from: [-6.5, 0.6], to: [4, 0.6], side: 'right' }),
			spring({ from: [-6.5, 1.25], to: [blockCenter[0] - blockW / 2, 1.25], coils: 10, width: 0.55 }),
			block({ center: blockCenter, width: blockW, height: 1.3, label: 'm' }),
			line({ from: [0, 0.35], to: [0, 2.85], color: colors.muted, dash: [3, 5], strokeWidth: 1 }),
			text({ text: 'x = 0', at: [0, 2.85], offset: [0, 12], fontSize: 13, color: colors.muted }),

			// --- x(t) plot ---
			translate(
				group([
					axes({ x: [0, DURATION + 0.6], y: [-2, 2], step: [2, 1], xLabel: 't', yLabel: 'x' }),
					functionGraph({ f: x, x: [0, DURATION], color: colors.faint, strokeWidth: 2 }),
					t > 0 && functionGraph({ f: x, x: [0, t], color: colors.blue }),
					dot({ at: [t, x(t)], color: colors.blue })
				]),
				GRAPH_ORIGIN
			),

			// --- controls ---
			slider({ bind: 'k', value: state.k, min: 0.5, max: 10, step: 0.1, from: [4.8, 2.2], to: [7.4, 2.2], label: 'k', decimals: 1 })
		];
	}
});
