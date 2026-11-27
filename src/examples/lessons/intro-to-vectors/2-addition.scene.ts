/**
 * Vector addition and subtraction, tip to tail.
 *
 * a and b appear at the origin, b slides to the tip of a, the sum a + b is
 * drawn, then −b and a − b appear. Both tips stay draggable throughout.
 */
import { colors, constraints, create, defineScene, fadeIn, handle, round, text, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

/** Keeps a and b small enough that a + b and a − b stay on screen. */
const limit = constraints.all(constraints.snapToGrid(0.5), constraints.inBox([-2, 3.5], [-1.5, 2]));
const num = (x: number) => String(round(x, 1)).replace('-', '−');
const fmt = (v: Vec2) => `(${num(v[0])}, ${num(v[1])})`;

export default defineScene({
	// shifted right/up: that's where a, b and a + b live
	view: { x: [-5, 8], y: [-3.4, 4.4] },
	state: { a: [3, 1] as Vec2, b: [1, 2] as Vec2 },
	timeline: {
		vectors: 1.2,
		slide: { duration: 1.2, delay: 0.4 },
		sum: 1,
		subtract: { duration: 1.2, delay: 0.8 }
	},
	draw: (ctx) => {
		const { a, b } = ctx.state;
		// b's tail slides from the origin to the tip of a
		const tail = vec.lerp([0, 0], a, ctx.p('slide'));
		const sum = vec.add(a, b);
		const diff = vec.sub(a, b);
		const ready = ctx.p('vectors') >= 1;

		return [
			axes({ x: [-4.5, 7.5], y: [-3.2, 4.2], grid: true, numbers: false }),

			create(vector({ to: a, label: 'a', labelAt: 'right', color: colors.blue }), ctx.p('vectors')),
			create(vector({ from: tail, to: vec.add(tail, b), label: 'b', labelAt: 'right', color: colors.red }), ctx.p('vectors')),
			create(vector({ to: sum, label: 'a + b', labelAt: 'left', color: colors.yellow }), ctx.p('sum')),
			create(vector({ from: a, to: diff, label: '−b', labelAt: 'left', color: colors.red, dash: [5, 6], opacity: 0.7 }), ctx.p('subtract')),
			create(vector({ to: diff, label: 'a − b', labelAt: 'right', color: colors.purple }), ctx.p('subtract')),

			fadeIn(text({ text: `a + b = ${fmt(sum)}`, at: [-4.6, 3.95], anchor: 'start', fontSize: 16, color: colors.yellow }), ctx.p('sum')),
			fadeIn(text({ text: `a − b = ${fmt(diff)}`, at: [-4.6, 3.45], anchor: 'start', fontSize: 16, color: colors.purple }), ctx.p('subtract')),

			ready && handle({ bind: 'a', constrain: limit, color: colors.blue }),
			ready &&
				handle({
					bind: 'b',
					at: vec.add(tail, b),
					// the handle sits at b's tip, but state stores b relative to its tail
					constrain: (p) => vec.add(tail, limit(vec.sub(p, tail))),
					map: (p) => vec.sub(p, tail),
					color: colors.red
				})
		];
	}
});
