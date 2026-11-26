/**
 * Style properties and their resolution.
 *
 * Styles cascade down the node tree like CSS: a group's style is inherited by
 * its children, and a child's own properties win. `color` is the "main colour"
 * of an object: it is the default stroke of paths and the fill of text, so
 * `group([...], { color: colors.blue })` turns a whole object blue.
 *
 * Units: `strokeWidth`, `fontSize` and `dash` are in screen pixels (of the
 * scene's logical size), so they look the same regardless of the world scale.
 */
import type { Theme } from './theme';

export type Color = string;
export type FontFamily = 'sans' | 'serif' | 'mono';
export type TextAnchor = 'start' | 'middle' | 'end';
export type TextBaseline = 'top' | 'middle' | 'bottom' | 'alphabetic';

export interface StyleProps {
	/** Main colour: default for `stroke` on paths and the fill of text. */
	color?: Color;
	/** Outline colour, or `'none'`. Defaults to `color`. */
	stroke?: Color | 'none';
	/** Interior colour, `'none'`, or `'currentColor'` (= the resolved `color`). */
	fill?: Color | 'none' | 'currentColor';
	strokeWidth?: number;
	strokeOpacity?: number;
	fillOpacity?: number;
	/** Dash pattern in px, e.g. `[6, 4]`. */
	dash?: readonly number[];
	lineCap?: 'butt' | 'round' | 'square';
	lineJoin?: 'miter' | 'round' | 'bevel';
	fontSize?: number;
	fontFamily?: FontFamily;
	fontWeight?: number | 'normal' | 'bold';
	fontStyle?: 'normal' | 'italic';
	/** Horizontal text alignment relative to the text's `at` point. */
	anchor?: TextAnchor;
	/** Vertical text alignment relative to the text's `at` point. */
	baseline?: TextBaseline;
}

export const STYLE_KEYS = [
	'color',
	'stroke',
	'fill',
	'strokeWidth',
	'strokeOpacity',
	'fillOpacity',
	'dash',
	'lineCap',
	'lineJoin',
	'fontSize',
	'fontFamily',
	'fontWeight',
	'fontStyle',
	'anchor',
	'baseline'
] as const satisfies readonly (keyof StyleProps)[];

/** Separate style properties from everything else in an options object. */
export function splitStyle<T extends object>(opts: T): [StyleProps, Omit<T, keyof StyleProps>] {
	const style: Record<string, unknown> = {};
	const rest: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(opts)) {
		if (v === undefined) continue;
		if ((STYLE_KEYS as readonly string[]).includes(k)) style[k] = v;
		else rest[k] = v;
	}
	return [style as StyleProps, rest as Omit<T, keyof StyleProps>];
}

/** Cascade `own` on top of the `inherited` style. */
export function mergeStyle(inherited: StyleProps, own: StyleProps | undefined): StyleProps {
	if (!own) return inherited;
	const merged: StyleProps = { ...inherited, ...own };
	// A child that sets its own `color` should not keep an inherited explicit stroke.
	if (own.color !== undefined && own.stroke === undefined) delete merged.stroke;
	return merged;
}

export interface ResolvedPathStyle {
	stroke: Color | 'none';
	fill: Color | 'none';
	strokeWidth: number;
	strokeOpacity: number;
	fillOpacity: number;
	dash: readonly number[] | null;
	lineCap: 'butt' | 'round' | 'square';
	lineJoin: 'miter' | 'round' | 'bevel';
}

export interface ResolvedTextStyle {
	fill: Color;
	fontSize: number;
	fontFamily: string;
	fontWeight: number | 'normal' | 'bold';
	fontStyle: 'normal' | 'italic';
	anchor: TextAnchor;
	baseline: TextBaseline;
}

export function resolvePathStyle(s: StyleProps, theme: Theme): ResolvedPathStyle {
	const color = s.color ?? theme.foreground;
	return {
		stroke: s.stroke ?? color,
		fill: s.fill === 'currentColor' ? color : (s.fill ?? 'none'),
		strokeWidth: s.strokeWidth ?? theme.strokeWidth,
		strokeOpacity: s.strokeOpacity ?? 1,
		fillOpacity: s.fillOpacity ?? 1,
		dash: s.dash && s.dash.length > 0 ? s.dash : null,
		lineCap: s.lineCap ?? 'round',
		lineJoin: s.lineJoin ?? 'round'
	};
}

export function resolveTextStyle(s: StyleProps, theme: Theme): ResolvedTextStyle {
	const family = s.fontFamily ?? 'sans';
	return {
		fill: s.color ?? theme.foreground,
		fontSize: s.fontSize ?? theme.fontSize,
		fontFamily: theme.fonts[family] ?? family,
		fontWeight: s.fontWeight ?? 'normal',
		fontStyle: s.fontStyle ?? 'normal',
		anchor: s.anchor ?? 'middle',
		baseline: s.baseline ?? 'middle'
	};
}
