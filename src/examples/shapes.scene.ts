/**
 * Core shapes
 *
 * Every basic node factory with a few style variations.
 *
 * Static showcase of the core drawing vocabulary: shapes, styles, text, tips.
 */
import { arc, arrow, circle, colors, curve, defineScene, dot, line, polygon, rect, regularPolygon, text } from '#engine';

export default defineScene({
	draw: () => [
		circle({ center: [-6, 1.5], radius: 1, color: colors.blue }),
		circle({ center: [-6, -1.5], radius: 1, color: colors.blue, fill: 'currentColor', fillOpacity: 0.25 }),
		text({ text: 'circle', at: [-6, -3.2], color: colors.muted, fontSize: 15 }),

		rect({ center: [-3, 1.5], width: 2, height: 1.4, color: colors.green }),
		rect({ center: [-3, -1.5], width: 2, height: 1.4, cornerRadius: 0.3, color: colors.green, fill: 'currentColor', fillOpacity: 0.25 }),
		text({ text: 'rect', at: [-3, -3.2], color: colors.muted, fontSize: 15 }),

		polygon({ points: [[-0.9, 0.7], [0.9, 0.7], [0, 2.4]], color: colors.orange }),
		regularPolygon({ center: [0, -1.5], radius: 1, sides: 6, color: colors.orange, fill: 'currentColor', fillOpacity: 0.25 }),
		text({ text: 'polygon', at: [0, -3.2], color: colors.muted, fontSize: 15 }),

		curve({ points: [[2, 1], [2.7, 2.3], [3.3, 0.8], [4, 2]], color: colors.purple, tip: 'end' }),
		arc({ center: [3, -1.5], radius: 1, start: 0, end: Math.PI * 1.5, color: colors.purple, tip: 'both' }),
		text({ text: 'curve / arc', at: [3, -3.2], color: colors.muted, fontSize: 15 }),

		line({ from: [5.5, 2.2], to: [7, 0.8], color: colors.red }),
		line({ from: [5.5, 0.6], to: [7, 2], color: colors.red, dash: [6, 6], strokeWidth: 2 }),
		arrow({ from: [5.5, -2.3], to: [7, -0.7], color: colors.teal }),
		dot({ at: [5.5, -2.3], color: colors.teal }),
		text({ text: 'line / arrow / dot', at: [6.25, -3.2], color: colors.muted, fontSize: 15 })
	]
});
