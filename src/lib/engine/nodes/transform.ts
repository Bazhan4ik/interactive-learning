/**
 * Immutable node helpers: transforms, style overrides, traversal and bounds.
 * Each returns a new node; inputs are never mutated.
 */
import { pathBounds, transformPath, type Bounds } from '../geometry/path';
import * as m from '../math/matrix';
import type { Mat } from '../math/matrix';
import type { Vec2 } from '../math/vec';
import { mergeStyle, type StyleProps } from '../style/style';
import type { Node, PathNode } from './types';

/** Prepend an extra parent transform to a node. */
export function transformNode<N extends Node>(node: N, mat: Mat): N {
	return { ...node, transform: node.transform ? m.multiply(mat, node.transform) : mat };
}

export const translate = <N extends Node>(node: N, offset: Vec2): N =>
	transformNode(node, m.translation(offset[0], offset[1]));

export const rotate = <N extends Node>(node: N, angle: number, about?: Vec2): N =>
	transformNode(node, m.rotation(angle, about));

export const scale = <N extends Node>(node: N, k: number | Vec2, about?: Vec2): N =>
	typeof k === 'number'
		? transformNode(node, m.scaling(k, k, about))
		: transformNode(node, m.scaling(k[0], k[1], about));

export const withOpacity = <N extends Node>(node: N, k: number): N => ({
	...node,
	opacity: (node.opacity ?? 1) * k
});

export const withStyle = <N extends Node>(node: N, style: StyleProps): N => ({
	...node,
	style: mergeStyle(node.style ?? {}, style)
});

/** Rebuild a tree bottom-up. `fn` receives each node after its children were mapped. */
export function mapTree(node: Node, fn: (n: Node) => Node | null): Node | null {
	if (node.kind === 'group') {
		const children = node.children.map((c) => mapTree(c, fn)).filter((c): c is Node => c !== null);
		return fn({ ...node, children });
	}
	return fn(node);
}

/** All path nodes in a tree, with their transforms (and ancestors') baked into the geometry. */
export function collectPaths(node: Node, parent: Mat = m.IDENTITY, inherited: StyleProps = {}): PathNode[] {
	const mat = node.transform ? m.multiply(parent, node.transform) : parent;
	const style = mergeStyle(inherited, node.style);
	if (node.kind === 'group') return node.children.flatMap((c) => collectPaths(c, mat, style));
	if (node.kind === 'path') {
		const { transform: _t, ...rest } = node;
		return [{ ...rest, path: transformPath(node.path, mat), style }];
	}
	return [];
}

/**
 * World-space bounds of a node's path geometry. Text, markers and handles
 * contribute their anchor point only (their size is in px, not world units).
 */
export function nodeBounds(node: Node, parent: Mat = m.IDENTITY): Bounds | null {
	const mat = node.transform ? m.multiply(parent, node.transform) : parent;
	switch (node.kind) {
		case 'path':
			return pathBounds(transformPath(node.path, mat));
		case 'group':
			return node.children.reduce<Bounds | null>((acc, c) => union(acc, nodeBounds(c, mat)), null);
		case 'text':
		case 'marker':
			return pointBounds(m.apply(mat, node.at));
		case 'handle':
			return node.at ? pointBounds(m.apply(mat, node.at)) : null;
	}
}

const pointBounds = (p: Vec2): Bounds => ({ min: p, max: p });

function union(a: Bounds | null, b: Bounds | null): Bounds | null {
	if (!a) return b;
	if (!b) return a;
	return {
		min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1])],
		max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1])]
	};
}

export function boundsCenter(b: Bounds): Vec2 {
	return [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2];
}
