/**
 * Node factories — the basic drawing vocabulary for scenes and library objects.
 *
 * Convention: every factory takes ONE options object that mixes geometry
 * (`from`, `radius`, ...) with style (`color`, `strokeWidth`, ...) and common
 * node options (`id`, `opacity`, `transform`). Geometry is in world units;
 * stroke widths, font sizes and dot radii are in px.
 */
import {
	arcPath,
	circlePath,
	ellipsePath,
	linePath,
	parametricPath,
	polylinePath,
	rectPath,
	regularPolygonPath,
	smoothPath
} from '../geometry/construct';
import type { Path } from '../geometry/path';
import type { Mat } from '../math/matrix';
import type { Vec2 } from '../math/vec';
import { splitStyle, type StyleProps } from '../style/style';
import {
	flattenChildren,
	type Child,
	type Constraint,
	type GroupNode,
	type HandleNode,
	type MarkerNode,
	type PathNode,
	type TextNode,
	type TipKind
} from './types';

/** Options shared by every factory. */
export interface NodeOptions extends StyleProps {
	id?: string;
	opacity?: number;
	transform?: Mat;
}

interface TipOptions {
	/** Arrow tips at `'end'`, `'start'` or `'both'` ends. */
	tip?: TipKind;
	/** Tip length in px. */
	tipSize?: number;
}

function base(opts: NodeOptions) {
	const [style, rest] = splitStyle(opts);
	const { id, opacity, transform } = rest as Pick<NodeOptions, 'id' | 'opacity' | 'transform'>;
	return {
		...(id !== undefined && { id }),
		...(opacity !== undefined && { opacity }),
		...(transform !== undefined && { transform }),
		...(Object.keys(style).length > 0 && { style })
	};
}

function pathNode(p: Path, opts: NodeOptions & TipOptions): PathNode {
	const { tip, tipSize, ...rest } = opts;
	return {
		kind: 'path',
		path: p,
		...(tip !== undefined && { tip }),
		...(tipSize !== undefined && { tipSize }),
		...base(rest)
	};
}

/** Arbitrary geometry, e.g. from `PathBuilder` or the geometry helpers. */
export function path(opts: { path: Path } & NodeOptions & TipOptions): PathNode {
	const { path: p, ...rest } = opts;
	return pathNode(p, rest);
}

export function line(opts: { from: Vec2; to: Vec2 } & NodeOptions & TipOptions): PathNode {
	const { from, to, ...rest } = opts;
	return pathNode(linePath(from, to), rest);
}

/** A straight arrow from `from` to `to`, with a px-sized tip at `to`. */
export function arrow(opts: { from: Vec2; to: Vec2 } & NodeOptions & TipOptions): PathNode {
	return line({ tip: 'end', ...opts });
}

export function polyline(opts: { points: readonly Vec2[]; closed?: boolean } & NodeOptions & TipOptions): PathNode {
	const { points, closed = false, ...rest } = opts;
	return pathNode(polylinePath(points, closed), rest);
}

export function polygon(opts: { points: readonly Vec2[] } & NodeOptions): PathNode {
	const { points, ...rest } = opts;
	return pathNode(polylinePath(points, true), rest);
}

/** Smooth curve passing through every point. */
export function curve(
	opts: { points: readonly Vec2[]; closed?: boolean; tension?: number } & NodeOptions & TipOptions
): PathNode {
	const { points, closed = false, tension = 1, ...rest } = opts;
	return pathNode(smoothPath(points, closed, tension), rest);
}

/** Parametric curve `f(t)` for `t` in `range`. Gaps appear where `f` is not finite. */
export function parametric(
	opts: { f: (t: number) => Vec2; range: readonly [number, number]; samples?: number } & NodeOptions & TipOptions
): PathNode {
	const { f, range, samples = 100, ...rest } = opts;
	return pathNode(parametricPath(f, range[0], range[1], samples), rest);
}

export function circle(opts: { center?: Vec2; radius?: number } & NodeOptions = {}): PathNode {
	const { center = [0, 0], radius = 1, ...rest } = opts;
	return pathNode(circlePath(center, radius), rest);
}

export function ellipse(opts: { center?: Vec2; rx: number; ry: number } & NodeOptions): PathNode {
	const { center = [0, 0], rx, ry, ...rest } = opts;
	return pathNode(ellipsePath(center, rx, ry), rest);
}

/** Circular arc; angles in radians, counter-clockwise from +x. */
export function arc(
	opts: { center?: Vec2; radius: number; start: number; end: number } & NodeOptions & TipOptions
): PathNode {
	const { center = [0, 0], radius, start, end, ...rest } = opts;
	return pathNode(arcPath(center, radius, start, end), rest);
}

export function rect(
	opts: { center?: Vec2; width: number; height: number; cornerRadius?: number } & NodeOptions
): PathNode {
	const { center = [0, 0], width, height, cornerRadius = 0, ...rest } = opts;
	return pathNode(rectPath(center, width, height, cornerRadius), rest);
}

export function regularPolygon(
	opts: { center?: Vec2; radius?: number; sides: number; rotation?: number } & NodeOptions
): PathNode {
	const { center = [0, 0], radius = 1, sides, rotation = 0, ...rest } = opts;
	return pathNode(regularPolygonPath(center, radius, sides, rotation), rest);
}

/** A filled dot whose radius is in px (stays the same size at any zoom). */
export function dot(opts: { at: Vec2; radius?: number } & NodeOptions): MarkerNode {
	const { at, radius = 5, ...rest } = opts;
	return { kind: 'marker', at, path: circlePath([0, 0], radius), ...base({ fill: 'currentColor', stroke: 'none', ...rest }) };
}

/** Pixel-space geometry pinned to a world point (for custom markers). */
export function marker(opts: { at: Vec2; path: Path } & NodeOptions): MarkerNode {
	const { at, path: p, ...rest } = opts;
	return { kind: 'marker', at, path: p, ...base(rest) };
}

/**
 * A text label. Centred on `at` by default (see `anchor` / `baseline`);
 * `offset` nudges it by px (+y up), independent of the world scale.
 */
export function text(opts: { text: string | number; at: Vec2; offset?: Vec2 } & NodeOptions): TextNode {
	const { text: content, at, offset, ...rest } = opts;
	return { kind: 'text', text: String(content), at, ...(offset && { offset }), ...base(rest) };
}

/** Group children so they share a transform, style and opacity. */
export function group(children: Child, opts: NodeOptions = {}): GroupNode {
	return { kind: 'group', children: flattenChildren(children), ...base(opts) };
}

/**
 * A draggable point bound to `state[bind]`. While dragged, the engine writes
 * `map(constrain(pointer))` into the scene state and redraws.
 */
export function handle(opts: {
	bind: string;
	at?: Vec2;
	constrain?: Constraint;
	map?: (p: Vec2) => unknown;
	radius?: number;
	color?: string;
	id?: string;
}): HandleNode {
	const { bind, at, constrain, map, radius, color, id } = opts;
	return {
		kind: 'handle',
		bind,
		...(at !== undefined && { at }),
		...(constrain !== undefined && { constrain }),
		...(map !== undefined && { map }),
		...(radius !== undefined && { radius }),
		...(color !== undefined && { style: { color } }),
		...(id !== undefined && { id })
	};
}
