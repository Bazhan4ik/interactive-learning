/**
 * Animation effects: pure functions `(node, progress) => node`.
 *
 * These are the equivalents of manim's `Create`, `FadeIn`, `Transform`, ...
 * but instead of being "played", they are evaluated at a progress value,
 * typically `ctx.p('phase')`:
 *
 *   draw: (ctx) => [create(axes(...), ctx.p('axes')), fadeIn(label, ctx.p('label'))]
 */
import { lerpPath, slicePath, type Path } from '../geometry/path';
import { clamp, lerp } from '../math/scalar';
import { mix } from '../style/color';
import type { StyleProps } from '../style/style';
import { boundsCenter, collectPaths, mapTree, nodeBounds, scale, withOpacity } from '../nodes/transform';
import type { Node, PathNode } from '../nodes/types';
import type { Vec2 } from '../math/vec';

/**
 * Progressively draw a node: strokes are revealed along their length, fills
 * and text fade in. Returns `null` (draw nothing) at `p <= 0`.
 */
export function create(node: Node, p: number): Node | null {
	if (p <= 0) return null;
	if (p >= 1) return node;
	return mapTree(node, (n) => {
		switch (n.kind) {
			case 'path': {
				const style = n.style ?? {};
				return { ...n, path: slicePath(n.path, 0, p), style: { ...style, fillOpacity: (style.fillOpacity ?? 1) * p } };
			}
			case 'text':
			case 'marker':
				return withOpacity(n, p);
			default:
				return n;
		}
	});
}

/** Reverse of `create`: `uncreate(node, 1)` draws nothing. */
export const uncreate = (node: Node, p: number): Node | null => create(node, 1 - p);

export function fadeIn(node: Node, p: number): Node | null {
	if (p <= 0) return null;
	return p >= 1 ? node : withOpacity(node, p);
}

export const fadeOut = (node: Node, p: number): Node | null => fadeIn(node, 1 - p);

/** Scale up from nothing around `about` (default: the node's centre). */
export function grow(node: Node, p: number, about?: Vec2): Node | null {
	if (p <= 0) return null;
	if (p >= 1) return node;
	const b = nodeBounds(node);
	const center = about ?? (b ? boundsCenter(b) : [0, 0]);
	return scale(node, p, center);
}

/**
 * Smoothly turn shape `a` into shape `b`. Works for any two nodes because
 * everything is Bézier paths underneath. If both contain the same number of
 * paths they morph pairwise (keeping individual styles); otherwise all paths
 * are merged into one.
 */
export function morph(a: Node, b: Node, p: number): Node {
	if (p <= 0) return a;
	if (p >= 1) return b;
	const pa = collectPaths(a);
	const pb = collectPaths(b);
	if (pa.length === pb.length && pa.length > 0) {
		return { kind: 'group', children: pa.map((x, i) => morphPaths(x, pb[i], p)) };
	}
	return morphPaths(mergePaths(pa), mergePaths(pb), p);
}

function mergePaths(nodes: PathNode[]): PathNode {
	const path: Path = nodes.flatMap((n) => n.path);
	return { kind: 'path', path, ...(nodes[0]?.style && { style: nodes[0].style }) };
}

function morphPaths(a: PathNode, b: PathNode, p: number): PathNode {
	return {
		kind: 'path',
		path: lerpPath(a.path, b.path, p),
		style: lerpStyle(a.style ?? {}, b.style ?? {}, p),
		...((a.tip ?? b.tip) && { tip: p < 0.5 ? (a.tip ?? b.tip) : (b.tip ?? a.tip) }),
		opacity: lerp(a.opacity ?? 1, b.opacity ?? 1, p)
	};
}

function lerpStyle(a: StyleProps, b: StyleProps, t: number): StyleProps {
	const pick = <T>(x: T | undefined, y: T | undefined): T | undefined => (t < 0.5 ? (x ?? y) : (y ?? x));
	const color = (x?: string, y?: string) => {
		if (x && y && x !== 'none' && y !== 'none' && x !== 'currentColor' && y !== 'currentColor') return mix(x, y, t);
		return pick(x, y);
	};
	const num = (x?: number, y?: number, fallback = 1) => lerp(x ?? fallback, y ?? fallback, t);

	// Fade fills that exist on only one side instead of popping.
	const aFill = a.fill && a.fill !== 'none';
	const bFill = b.fill && b.fill !== 'none';
	const fillOpacity =
		aFill && !bFill
			? (a.fillOpacity ?? 1) * (1 - t)
			: !aFill && bFill
				? (b.fillOpacity ?? 1) * t
				: num(a.fillOpacity, b.fillOpacity);

	return {
		...a,
		...b,
		color: color(a.color, b.color),
		stroke: color(a.stroke, b.stroke) as StyleProps['stroke'],
		fill: (aFill || bFill ? color(aFill ? a.fill : undefined, bFill ? b.fill : undefined) : pick(a.fill, b.fill)) as StyleProps['fill'],
		fillOpacity: clamp(fillOpacity, 0, 1),
		...((a.strokeWidth !== undefined || b.strokeWidth !== undefined) && {
			strokeWidth: lerp(a.strokeWidth ?? b.strokeWidth!, b.strokeWidth ?? a.strokeWidth!, t)
		})
	};
}

/**
 * Split one progress value among `count` items so they animate one after
 * another, overlapping by `overlap` (0 = strictly sequential, 1 = all together).
 * Returns the progress of item `index`.
 */
export function stagger(p: number, index: number, count: number, overlap = 0.5): number {
	if (count <= 1) return clamp(p, 0, 1);
	const o = clamp(overlap, 0, 1);
	const span = 1 / (count - (count - 1) * o);
	const start = index * span * (1 - o);
	return clamp((p - start) / span, 0, 1);
}
