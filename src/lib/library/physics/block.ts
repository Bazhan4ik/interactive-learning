import { colors, defineObject, group, rect, text, type Vec2 } from '#engine';

export interface BlockParams {
	center: Vec2;
	width?: number;
	height?: number;
	/** Text in the middle of the block, e.g. `'m'` or `'2 kg'`. */
	label?: string;
}

export const block = defineObject<BlockParams>(
	{
		name: 'block',
		category: 'physics',
		description: 'A solid block / mass with an optional label, e.g. a mass on a spring or a box on a ramp.',
		usage: `block({ center: [x, 0], width: 1.2, height: 1, label: 'm', color: colors.blue })`,
		example: (block) => block({ center: [0, 0], label: 'm' })
	},
	({ center, width = 1, height = 1, label, color = colors.blue }) =>
		group(
			[
				rect({ center, width, height, cornerRadius: Math.min(width, height) * 0.08, fill: 'currentColor', fillOpacity: 0.18 }),
				label && text({ text: label, at: center, color: colors.foreground, fontFamily: 'serif', fontStyle: 'italic' })
			],
			{ color }
		)
);
