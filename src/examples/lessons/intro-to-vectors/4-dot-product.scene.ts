/**
 * The dot product as a projection.
 *
 * Two draggable vectors with the angle θ between them. a is projected onto the
 * line of b; the projection is green when a · b > 0 and red when it's < 0.
 */
import { arc, clamp, colors, constraints, defineScene, dot, handle, line, radToDeg, round, text, vec, type Range, type Vec2 } from '#engine';
import { axes, infiniteLine, vector } from '#library';

const limit = constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-5, 5], [-3.5, 3.5]));
const num = (x: number, d = 1) => String(round(x, d)).replace('-', '−');
const X: Range = [-6.5, 6.5];
const Y: Range = [-3.8, 3.8];

/** Signed angle from `from` to `to`, in (−π, π]. */
function angleBetween(from: Vec2, to: Vec2): number {
	let d = vec.angle(to) - vec.angle(from);
	if (d > Math.PI) d -= 2 * Math.PI;
	if (d <= -Math.PI) d += 2 * Math.PI;
	return d;
}

export default defineScene({
	view: { x: [-7, 7], y: [-4, 4] },
	state: { a: [3, 2] as Vec2, b: [4, -1] as Vec2 },
	draw: ({ state }) => {
		const { a, b } = state;
		const product = vec.dot(a, b);
		const sign = Math.abs(product) < 1e-9 ? colors.muted : product > 0 ? colors.green : colors.red;
		const defined = vec.len(a) > 0 && vec.len(b) > 0;
		const bHat = vec.normalize(b);
		const proj = vec.scale(bHat, vec.dot(a, bHat));
		const turn = defined ? angleBetween(b, a) : 0;
		const theta = defined ? Math.acos(clamp(product / (vec.len(a) * vec.len(b)), -1, 1)) : 0;
		const mid = vec.angle(b) + turn / 2;

		return [
			axes({ x: X, y: Y, grid: true, numbers: false }),
			defined && [
				// the line b lies on, and a's "shadow" on it
				infiniteLine({ through: [0, 0], direction: b, x: X, y: Y, dash: [4, 6], strokeWidth: 1, opacity: 0.6 }),
				line({ from: [0, 0], to: proj, color: sign, strokeWidth: 8, opacity: 0.45, lineCap: 'butt' }),
				line({ from: a, to: proj, color: colors.muted, dash: [4, 5], strokeWidth: 1.5 }),
				dot({ at: proj, radius: 4, color: sign }),
				arc({ radius: 0.7, start: vec.angle(b), end: vec.angle(b) + turn, color: colors.foreground, strokeWidth: 1.5 }),
				text({ text: 'θ', at: vec.fromAngle(mid, 0.7), offset: vec.fromAngle(mid, 14), fontFamily: 'serif', fontStyle: 'italic', fontSize: 18 })
			],
			vector({ to: b, label: 'b', color: colors.red }),
			vector({ to: a, label: 'a', color: colors.blue }),
			handle({ bind: 'a', constrain: limit, color: colors.blue }),
			handle({ bind: 'b', constrain: limit, color: colors.red }),
			text({ text: `a · b = ${num(product, 2)}`, at: [-6.6, 3.55], anchor: 'start', fontSize: 16, color: sign }),
			defined && text({ text: `θ = ${num(radToDeg(theta))}°`, at: [-6.6, 3.05], anchor: 'start', fontSize: 16, color: colors.muted })
		];
	}
});
