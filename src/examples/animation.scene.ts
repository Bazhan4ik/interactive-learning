/**
 * Animation basics
 *
 * create → morph → morph → label, driven by a named timeline.
 *
 * Timeline-driven animation: create, morph, fade and grow, all as pure
 * functions of the phase progress `ctx.p(...)`.
 */
import { circle, colors, create, defineScene, fadeIn, grow, morph, regularPolygon, rect, text } from '#engine';

const shapeCircle = circle({ radius: 1.6, color: colors.blue, fill: 'currentColor', fillOpacity: 0.2 });
const shapeSquare = rect({ width: 3, height: 3, color: colors.green, fill: 'currentColor', fillOpacity: 0.2 });
const shapeTriangle = regularPolygon({ radius: 1.9, sides: 3, color: colors.orange, fill: 'currentColor', fillOpacity: 0.2 });

export default defineScene({
	timeline: {
		draw: 1.5,
		toSquare: { duration: 1.2, delay: 0.4 },
		toTriangle: { duration: 1.2, delay: 0.4 },
		label: { duration: 0.8, with: 'toTriangle' },
		star: { duration: 0.8, delay: 0.2 }
	},
	draw: (ctx) => {
		const shape =
			ctx.p('toSquare') < 1
				? morph(shapeCircle, shapeSquare, ctx.p('toSquare'))
				: morph(shapeSquare, shapeTriangle, ctx.p('toTriangle'));
		return [
			ctx.p('toSquare') === 0 ? create(shapeCircle, ctx.p('draw')) : shape,
			fadeIn(text({ text: 'everything is Bézier curves', at: [0, -3], color: colors.muted }), ctx.p('label')),
			grow(regularPolygon({ center: [5, 2.5], radius: 0.6, sides: 5, color: colors.yellow, fill: 'currentColor' }), ctx.p('star', 'backOut'))
		];
	}
});
