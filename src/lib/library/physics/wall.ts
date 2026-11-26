import { colors, defineObject, group, line, vec, type Vec2 } from '#engine';

export interface WallParams {
	/** The wall's surface runs from `from` to `to`. */
	from: Vec2;
	to: Vec2;
	/** Which side of from→to the hatching (the solid material) is on. */
	side?: 'left' | 'right';
	/** Distance between hatch marks (world units). */
	spacing?: number;
	/** Length of hatch marks (world units). */
	depth?: number;
}

export const wall = defineObject<WallParams>(
	{
		name: 'wall',
		category: 'physics',
		description: 'A fixed surface (wall, floor, ceiling) drawn as a line with hatching on the solid side.',
		usage: `wall({ from: [-5, -1], to: [-5, 1], side: 'left' })   // vertical wall, solid to the left
wall({ from: [-6, -0.5], to: [6, -0.5], side: 'right' })  // floor`,
		example: (wall) => wall({ from: [-3, -0.5], to: [3, -0.5], side: 'right' })
	},
	({ from, to, side = 'left', spacing = 0.25, depth = 0.25, color = colors.muted }) => {
		const length = vec.dist(from, to);
		const axis = vec.normalize(vec.sub(to, from));
		const out = vec.scale(vec.perp(axis), side === 'left' ? 1 : -1);
		// hatch marks lean 45° backwards along the wall
		const hatch = vec.scale(vec.normalize(vec.sub(out, axis)), depth * Math.SQRT2);
		const count = Math.max(1, Math.floor(length / spacing));
		const marks = Array.from({ length: count }, (_, i) => {
			const p = vec.add(from, vec.scale(axis, ((i + 1) * length) / count));
			return line({ from: p, to: vec.add(p, hatch), strokeWidth: 1.5 });
		});
		return group([line({ from, to, strokeWidth: 2.5 }), ...marks], { color });
	}
);
