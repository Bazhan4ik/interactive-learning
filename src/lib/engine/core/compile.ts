/**
 * Compiler: node tree (world space) → flat list of screen-space primitives.
 *
 * Responsibilities:
 *  - accumulate transforms and apply the viewport
 *  - cascade and resolve styles against the theme
 *  - multiply opacities
 *  - expand pixel-sized features (arrow tips, markers)
 *  - resolve handles against the scene state
 */
import { pathEnd, pathLength, slicePath, transformPath, type Path } from '../geometry/path';
import * as m from '../math/matrix';
import type { Mat } from '../math/matrix';
import { add, isVec2, normalize, perp, scale, sub, type Vec2 } from '../math/vec';
import { mergeStyle, resolvePathStyle, resolveTextStyle, type StyleProps } from '../style/style';
import type { Theme } from '../style/theme';
import type { Node, PathNode } from '../nodes/types';
import type { HandlePrimitive, PathPrimitive, Primitive } from './primitives';
import type { Viewport } from './viewport';

export interface CompileContext {
	readonly viewport: Viewport;
	readonly theme: Theme;
	readonly state: Readonly<Record<string, unknown>>;
}

export interface CompileResult {
	readonly primitives: Primitive[];
	readonly handles: HandlePrimitive[];
}

export function compile(nodes: readonly Node[], ctx: CompileContext): CompileResult {
	const out: CompileResult = { primitives: [], handles: [] };
	for (const n of nodes) walk(n, ctx.viewport.matrix, {}, 1, ctx, out, []);
	return out;
}

function walk(
	node: Node,
	parent: Mat,
	inherited: StyleProps,
	parentOpacity: number,
	ctx: CompileContext,
	out: CompileResult,
	trail: string[]
): void {
	if (!node || typeof node !== 'object' || !('kind' in node)) {
		throw new Error(`compile: expected a node at ${where(trail)}, got ${JSON.stringify(node)}`);
	}
	const opacity = parentOpacity * (node.opacity ?? 1);
	if (opacity <= 0) return;
	const mat = node.transform ? m.multiply(parent, node.transform) : parent;
	const style = mergeStyle(inherited, node.style);
	const here = [...trail, node.id ? `${node.kind}#${node.id}` : node.kind];
	const id = node.id;

	switch (node.kind) {
		case 'group':
			for (const c of node.children) walk(c, mat, style, opacity, ctx, out, here);
			return;

		case 'path': {
			const resolved = resolvePathStyle(style, ctx.theme);
			const screenPath = transformPath(node.path, mat);
			const prim: PathPrimitive = { kind: 'path', ...(id && { id }), path: screenPath, style: resolved, opacity };
			if (node.tip) out.primitives.push(...withTips(prim, node, ctx.theme));
			else out.primitives.push(prim);
			return;
		}

		case 'marker': {
			const [ax, ay] = m.apply(mat, node.at);
			// marker geometry is px with +y up; screen is +y down
			const pxPath = transformPath(node.path, [1, 0, 0, -1, ax, ay]);
			out.primitives.push({
				kind: 'path',
				...(id && { id }),
				path: pxPath,
				style: resolvePathStyle(style, ctx.theme),
				opacity
			});
			return;
		}

		case 'text': {
			const [x, y] = m.apply(mat, node.at);
			const [dx, dy] = node.offset ?? [0, 0];
			out.primitives.push({
				kind: 'text',
				...(id && { id }),
				text: node.text,
				at: [x + dx, y - dy],
				style: resolveTextStyle(style, ctx.theme),
				opacity
			});
			return;
		}

		case 'handle': {
			const local = node.at ?? ctx.state[node.bind];
			if (!isVec2(local)) {
				throw new Error(
					`compile: handle bound to "${node.bind}" at ${where(here)} has no position. ` +
						`Either pass \`at\` or make state.${node.bind} a [x, y] point (got ${JSON.stringify(local)}).`
				);
			}
			out.handles.push({
				...(id && { id }),
				bind: node.bind,
				at: m.apply(mat, local),
				local,
				toLocal: m.invert(mat),
				...(node.constrain && { constrain: node.constrain }),
				...(node.map && { map: node.map }),
				radius: node.radius ?? ctx.theme.handle.radius,
				color: style.color ?? ctx.theme.handle.color
			});
			return;
		}

		default:
			throw new Error(`compile: unknown node kind "${(node as { kind: string }).kind}" at ${where(trail)}`);
	}
}

const where = (trail: string[]) => (trail.length ? trail.join(' > ') : '(root)');

/**
 * Arrow tips are built in screen space so they have a constant pixel size.
 * The shaft is shortened so its line cap doesn't poke out of the tip.
 */
function withTips(prim: PathPrimitive, node: PathNode, theme: Theme): PathPrimitive[] {
	const total = pathLength(prim.path);
	if (total === 0 || prim.style.stroke === 'none') return [prim];
	const size = Math.min(node.tipSize ?? theme.tipSize * (prim.style.strokeWidth / theme.strokeWidth) ** 0.5, total * 0.6);
	const ends: ('start' | 'end')[] = node.tip === 'both' ? ['start', 'end'] : [node.tip!];
	const inset = (size * 0.6) / total;

	const tips: PathPrimitive[] = [];
	for (const which of ends) {
		const e = pathEnd(prim.path, which);
		if (!e) continue;
		tips.push({
			kind: 'path',
			...(prim.id && { id: `${prim.id}:tip-${which}` }),
			path: triangle(e.point, normalize(e.tangent), size),
			style: {
				...prim.style,
				fill: prim.style.stroke,
				fillOpacity: prim.style.strokeOpacity,
				strokeWidth: 1,
				dash: null,
				lineJoin: 'round'
			},
			opacity: prim.opacity
		});
	}
	const from = ends.includes('start') ? inset : 0;
	const to = ends.includes('end') ? 1 - inset : 1;
	const shaft: PathPrimitive = { ...prim, path: slicePath(prim.path, from, to) };
	return [shaft, ...tips];
}

function triangle(apex: Vec2, dir: Vec2, size: number): Path {
	const back = sub(apex, scale(dir, size));
	const side = scale(perp(dir), size * 0.42);
	const a = add(back, side);
	const b = sub(back, side);
	const seg = (p: Vec2, q: Vec2) => [p, add(p, scale(sub(q, p), 1 / 3)), add(p, scale(sub(q, p), 2 / 3))];
	return [{ points: [...seg(apex, a), ...seg(a, b), ...seg(b, apex), apex], closed: true }];
}
