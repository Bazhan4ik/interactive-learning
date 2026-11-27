/**
 * Circuit schematic elements. Each is drawn between two terminals (`from`,
 * `to`) with straight leads, so circuits are built by placing elements along
 * the wires of a loop.
 */
import { colors, defineObject, group, line, polyline, vec, type Vec2 } from '#engine';

interface TwoTerminal {
	/** Terminal positions (world units); the symbol sits in the middle. */
	from: Vec2;
	to: Vec2;
}

/** Unit direction along the element and its perpendicular. */
function frame(from: Vec2, to: Vec2) {
	const axis = vec.normalize(vec.sub(to, from));
	const dir: Vec2 = vec.len(axis) === 0 ? [1, 0] : axis;
	const mid = vec.midpoint(from, to);
	const at = (along: number, across = 0): Vec2 => vec.add(mid, vec.add(vec.scale(dir, along), vec.scale(vec.perp(dir), across)));
	return { length: vec.dist(from, to), at };
}

export interface ResistorParams extends TwoTerminal {
	/** Length of the zigzag body (world units). */
	body?: number;
	/** Zigzag width (world units). */
	width?: number;
	zigzags?: number;
}

export const resistor = defineObject<ResistorParams>(
	{
		name: 'resistor',
		category: 'physics',
		description: 'A resistor symbol (zigzag) between two terminals, with straight leads.',
		usage: `resistor({ from: [-4, 2], to: [0, 2] })`,
		example: (resistor) => resistor({ from: [-2, 0], to: [2, 0] })
	},
	({ from, to, body = 1.4, width = 0.4, zigzags = 3, color = colors.foreground }) => {
		const { length, at } = frame(from, to);
		const half = Math.min(body, length * 0.8) / 2;
		const n = zigzags * 2;
		const zig = Array.from({ length: n }, (_, i) => at(-half + (2 * half * (i + 0.5)) / n, i % 2 ? -width / 2 : width / 2));
		return polyline({ points: [from, at(-half), ...zig, at(half), to], color, lineJoin: 'miter' });
	}
);

export interface CapacitorParams extends TwoTerminal {
	/** Distance between the plates (world units). */
	gap?: number;
	/** Plate length (world units). */
	plate?: number;
}

export const capacitor = defineObject<CapacitorParams>(
	{
		name: 'capacitor',
		category: 'physics',
		description: 'A capacitor symbol (two parallel plates) between two terminals. The first plate faces `from`.',
		usage: `capacitor({ from: [2, 2], to: [2, -2], gap: 0.3, plate: 1 })`,
		example: (capacitor) => capacitor({ from: [-2, 0], to: [2, 0] })
	},
	({ from, to, gap = 0.3, plate = 1, color = colors.foreground }) => {
		const { at } = frame(from, to);
		const p1 = at(-gap / 2);
		const p2 = at(gap / 2);
		return group(
			[
				line({ from, to: p1 }),
				line({ from: p2, to }),
				line({ from: at(-gap / 2, -plate / 2), to: at(-gap / 2, plate / 2), strokeWidth: 4, lineCap: 'butt' }),
				line({ from: at(gap / 2, -plate / 2), to: at(gap / 2, plate / 2), strokeWidth: 4, lineCap: 'butt' })
			],
			{ color }
		);
	}
);

export interface BatteryParams extends TwoTerminal {
	gap?: number;
	/** Length of the long (+) plate; the short (−) plate is half as long. */
	plate?: number;
}

export const battery = defineObject<BatteryParams>(
	{
		name: 'battery',
		category: 'physics',
		description: 'A battery / DC source symbol between two terminals. The long (+) plate faces `from`.',
		usage: `battery({ from: [-4, 2], to: [-4, -2] })`,
		example: (battery) => battery({ from: [-2, 0], to: [2, 0] })
	},
	({ from, to, gap = 0.25, plate = 0.9, color = colors.foreground }) => {
		const { at } = frame(from, to);
		return group(
			[
				line({ from, to: at(-gap / 2) }),
				line({ from: at(gap / 2), to }),
				line({ from: at(-gap / 2, -plate / 2), to: at(-gap / 2, plate / 2), strokeWidth: 2.5, lineCap: 'butt' }),
				line({ from: at(gap / 2, -plate / 4), to: at(gap / 2, plate / 4), strokeWidth: 6, lineCap: 'butt' })
			],
			{ color }
		);
	}
);
