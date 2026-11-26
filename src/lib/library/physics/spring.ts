import { colors, defineObject, geometry, path, TAU, vec, type Path, type Vec2 } from '#engine';

export interface SpringParams {
	/** Attachment points (world units). The spring stretches between them. */
	from: Vec2;
	to: Vec2;
	/** Number of turns. */
	coils?: number;
	/** Coil diameter (world units). */
	width?: number;
	/** Straight lead length at each end (world units). */
	lead?: number;
	/** `'coil'` draws helical loops; `'zigzag'` is the textbook schematic. */
	look?: 'coil' | 'zigzag';
}

export const spring = defineObject<SpringParams>(
	{
		name: 'spring',
		category: 'physics',
		description:
			'A spring between two points. Coils compress and stretch with the distance, so animate it by moving `to` (e.g. a mass position).',
		usage: `spring({ from: [-4, 0], to: [x, 0], coils: 10, width: 0.5 })
spring({ from: [0, 3], to: [0, y], look: 'zigzag' })`,
		example: (spring) => spring({ from: [-3, 0], to: [3, 0] })
	},
	({ from, to, coils = 8, width = 0.5, lead = 0.25, look = 'coil', color = colors.foreground }) => {
		if (!(coils >= 1)) throw new Error(`coils must be >= 1, got ${coils}`);
		const length = vec.dist(from, to);
		const axis = length === 0 ? ([1, 0] as Vec2) : vec.normalize(vec.sub(to, from));
		const normal = vec.perp(axis);
		/** Spring-local (u along the axis, v across it) → world. */
		const world = (u: number, v: number): Vec2 => vec.add(from, vec.add(vec.scale(axis, u), vec.scale(normal, v)));

		const l = Math.min(lead, length * 0.2);
		const body = length - 2 * l;
		const r = width / 2;
		let p: Path;

		if (body <= 0) {
			p = geometry.linePath(from, to);
		} else if (look === 'zigzag') {
			const pts: Vec2[] = [world(0, 0), world(l, 0)];
			for (let i = 0; i < coils * 2; i++) pts.push(world(l + (body * (i + 0.5)) / (coils * 2), i % 2 ? -r : r));
			pts.push(world(length - l, 0), world(length, 0));
			p = geometry.polylinePath(pts);
		} else {
			// Side view of a tilted helix: the backward swing of `loop` creates the coils.
			// As the spring stretches the loops open up, like a real spring.
			const loop = r * 0.7;
			const coil = geometry.parametricPath(
				(s) => {
					const theta = TAU * coils * s;
					return world(l + s * body + loop * (Math.cos(theta) - 1), r * Math.sin(theta));
				},
				0,
				1,
				Math.ceil(coils * 20)
			);
			p = [...geometry.linePath(world(0, 0), world(l, 0)), ...coil, ...geometry.linePath(world(length - l, 0), world(length, 0))];
		}
		return path({ path: p, color, lineJoin: 'round' });
	}
);
