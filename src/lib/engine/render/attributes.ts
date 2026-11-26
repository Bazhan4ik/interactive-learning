/**
 * Primitive → SVG attribute mapping. Shared by the SVG string renderer and
 * the live Svelte renderer so both produce identical output.
 */
import { toSvgPathData } from '../geometry/path';
import type { PathPrimitive, TextPrimitive } from '../core/primitives';
import type { TextBaseline } from '../style/style';

export type SvgAttrs = Record<string, string | number>;

export function pathAttrs(p: PathPrimitive): SvgAttrs {
	const s = p.style;
	const a: SvgAttrs = {
		d: toSvgPathData(p.path),
		fill: s.fill,
		stroke: s.stroke,
		'stroke-width': s.strokeWidth,
		'stroke-linecap': s.lineCap,
		'stroke-linejoin': s.lineJoin
	};
	if (s.fill !== 'none' && s.fillOpacity !== 1) a['fill-opacity'] = s.fillOpacity;
	if (s.stroke !== 'none' && s.strokeOpacity !== 1) a['stroke-opacity'] = s.strokeOpacity;
	if (s.dash) a['stroke-dasharray'] = s.dash.join(' ');
	if (p.opacity !== 1) a.opacity = round(p.opacity);
	if (p.id) a['data-id'] = p.id;
	return a;
}

const SVG_BASELINE: Record<TextBaseline, string> = {
	top: 'text-before-edge',
	middle: 'central',
	bottom: 'text-after-edge',
	alphabetic: 'alphabetic'
};

export function textAttrs(t: TextPrimitive): SvgAttrs {
	const s = t.style;
	const a: SvgAttrs = {
		x: round(t.at[0]),
		y: round(t.at[1]),
		fill: s.fill,
		'font-size': s.fontSize,
		'font-family': s.fontFamily,
		'text-anchor': s.anchor,
		'dominant-baseline': SVG_BASELINE[s.baseline]
	};
	if (s.fontWeight !== 'normal') a['font-weight'] = s.fontWeight;
	if (s.fontStyle !== 'normal') a['font-style'] = s.fontStyle;
	if (t.opacity !== 1) a.opacity = round(t.opacity);
	if (t.id) a['data-id'] = t.id;
	return a;
}

const round = (x: number) => Math.round(x * 100) / 100;
