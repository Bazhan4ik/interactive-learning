/**
 * Charging a capacitor through a resistor: Q(t) = Q∞(1 − e^(−t/τ)).
 *
 * Left: the circuit. Charges pile up on the plates and the current arrow
 * fades as the current dies down. Right: Q/Q∞ and I/I₀ against time, traced
 * as time runs, with the tangent to Q whose slope is the current. The slider
 * sets the time constant τ; the dashed line marks t = τ.
 */
import { arrow, colors, defineScene, dot, line, round, text, type Range, type Vec2 } from '#engine';
import { axes, battery, capacitor, functionGraph, plot, resistor, slider } from '#library';

const T_MAX = 10;
const DATA_Y: Range = [0, 1.15];

// circuit corners
const A: Vec2 = [-6.6, -1.6];
const B: Vec2 = [-6.6, 1.9];
const C: Vec2 = [-2.6, 1.9];
const D: Vec2 = [-2.6, -1.6];
const PLATE_TOP = 0.3; // y of the capacitor's plates (gap 0.3 around the side's midpoint 0.15)
const PLATE_BOTTOM = 0.0;
const MAX_CHARGES = 5;
const PLATE = 1.4; // plate length; charges are spread along it

export default defineScene({
	view: { x: [-7.6, 7.2], y: [-4.1, 3.6] },
	state: { tau: 2 },
	duration: T_MAX,
	loop: true,
	draw: ({ state, t }) => {
		const tau = state.tau;
		const q = (time: number) => 1 - Math.exp(-time / tau); // Q / Q∞
		const i = (time: number) => Math.exp(-time / tau); // I / I₀
		const slope = i(t) / tau; // dQ/dt in units of Q∞ per second
		const charges = Math.round(MAX_CHARGES * q(t));
		const chargeXs = (n: number) => Array.from({ length: n }, (_, k) => C[0] - PLATE / 2 + (PLATE * (k + 0.5)) / MAX_CHARGES);

		return [
			// ---- circuit ----
			battery({ from: B, to: A }),
			resistor({ from: B, to: C }),
			capacitor({ from: C, to: D, plate: PLATE }),
			line({ from: D, to: A }),
			text({ text: 'ε', at: [A[0], 0.15], offset: [-22, 0], fontFamily: 'serif', fontStyle: 'italic', color: colors.muted }),
			text({ text: 'R', at: [(B[0] + C[0]) / 2, B[1]], offset: [0, 26], fontFamily: 'serif', fontStyle: 'italic', color: colors.muted }),
			text({ text: 'C', at: [C[0], 0.15], offset: [46, 0], fontFamily: 'serif', fontStyle: 'italic', color: colors.muted }),
			chargeXs(charges).map((x) => [
				text({ text: '+', at: [x, PLATE_TOP], offset: [0, 12], fontSize: 15, color: colors.red }),
				text({ text: '−', at: [x, PLATE_BOTTOM], offset: [0, -12], fontSize: 15, color: colors.blue })
			]),
			arrow({ from: [-5.2, 1.35], to: [-4.0, 1.35], color: colors.orange, opacity: 0.15 + 0.85 * i(t) }),
			text({ text: 'I', at: [-4.6, 1.35], offset: [0, -16], color: colors.orange, opacity: 0.15 + 0.85 * i(t), fontFamily: 'serif', fontStyle: 'italic' }),

			text({ text: `t = ${t.toFixed(1)} s`, at: [-6.8, -2.35], anchor: 'start', fontSize: 15, color: colors.muted }),
			text({ text: `Q = ${round(q(t), 2).toFixed(2)} Q∞`, at: [-5.0, -2.35], anchor: 'start', fontSize: 15, color: colors.blue }),
			text({ text: `I = ${round(i(t), 2).toFixed(2)} I₀`, at: [-3.2, -2.35], anchor: 'start', fontSize: 15, color: colors.orange }),
			slider({ bind: 'tau', value: tau, min: 0.5, max: 3, step: 0.1, from: [-6.6, -3.5], to: [-2.8, -3.5], label: 'time constant τ (s)', decimals: 1 }),

			// ---- graphs ----
			plot({
				x: [0, T_MAX],
				y: DATA_Y,
				into: { x: [-0.6, 6.6], y: [-2.8, 3.0] },
				children: [
					axes({ x: [0, T_MAX + 0.4], y: [0, 1.12], step: [2, 0.5], decimals: 1, xLabel: 't (s)' }),
					line({ from: [0, 1], to: [T_MAX, 1], color: colors.blue, dash: [6, 6], strokeWidth: 1, opacity: 0.6 }),
					text({ text: 'Q∞', at: [T_MAX, 1], offset: [-2, 12], anchor: 'end', fontSize: 13, color: colors.blue }),
					line({ from: [tau, 0], to: [tau, q(tau)], color: colors.muted, dash: [3, 5], strokeWidth: 1 }),
					text({ text: 'τ', at: [tau, 0], offset: [0, -30], fontFamily: 'serif', fontStyle: 'italic', color: colors.muted }),
					functionGraph({ f: q, x: [0, T_MAX], color: colors.blue, opacity: 0.25 }),
					functionGraph({ f: i, x: [0, T_MAX], color: colors.orange, opacity: 0.25 }),
					t > 0 && functionGraph({ f: q, x: [0, t], color: colors.blue }),
					t > 0 && functionGraph({ f: i, x: [0, t], color: colors.orange }),
					// tangent to Q: its slope is the current
					line({ from: [t - 0.9, q(t) - slope * 0.9], to: [t + 0.9, q(t) + slope * 0.9], color: colors.blue, dash: [4, 4], strokeWidth: 1.5 }),
					dot({ at: [t, q(t)], color: colors.blue }),
					dot({ at: [t, i(t)], color: colors.orange }),
					// legend
					text({ text: 'Q/Q∞', at: [5.6, 1.12], anchor: 'start', fontSize: 14, color: colors.blue }),
					text({ text: 'I/I₀', at: [7.6, 1.12], anchor: 'start', fontSize: 14, color: colors.orange })
				]
			})
		];
	}
});
