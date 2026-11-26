/**
 * Scene graph nodes: plain, immutable data describing what to draw.
 *
 * A scene's `draw()` returns a tree of nodes; `core/compile.ts` flattens that
 * tree into screen-space primitives. There are only five node kinds — every
 * library object (springs, axes, vectors...) is built out of these.
 *
 *  - `path`   – Bézier geometry in world units (lines, shapes, curves)
 *  - `text`   – a label anchored at a world point
 *  - `marker` – pixel-sized geometry pinned to a world point (dots, ticks)
 *  - `group`  – children sharing a transform / style / opacity
 *  - `handle` – an invisible-until-hovered drag target bound to scene state
 */
import type { Path } from '../geometry/path';
import type { Mat } from '../math/matrix';
import type { Vec2 } from '../math/vec';
import type { StyleProps } from '../style/style';

export interface NodeBase {
	/** Optional name, rendered as `data-id` in SVG output to aid debugging. */
	readonly id?: string;
	/** Local → parent transform (world units). */
	readonly transform?: Mat;
	/** Multiplied with the parent's opacity. */
	readonly opacity?: number;
	readonly style?: StyleProps;
}

export type TipKind = 'start' | 'end' | 'both';

export interface PathNode extends NodeBase {
	readonly kind: 'path';
	readonly path: Path;
	/** Draw arrow tips at the path's ends. Tips are sized in px, not world units. */
	readonly tip?: TipKind;
	/** Tip length in px (defaults to the theme's `tipSize`). */
	readonly tipSize?: number;
}

export interface TextNode extends NodeBase {
	readonly kind: 'text';
	readonly text: string;
	readonly at: Vec2;
	/** Extra offset in px from `at` (+y up), e.g. `[0, 12]` to sit just above a point. */
	readonly offset?: Vec2;
}

export interface MarkerNode extends NodeBase {
	readonly kind: 'marker';
	/** World-space anchor. */
	readonly at: Vec2;
	/** Geometry in px relative to `at`, with +y pointing up (like world space). */
	readonly path: Path;
}

export interface GroupNode extends NodeBase {
	readonly kind: 'group';
	readonly children: readonly Node[];
}

/** Maps a dragged position (in the handle's local coordinates) to a constrained position. */
export type Constraint = (p: Vec2) => Vec2;

export interface HandleNode extends NodeBase {
	readonly kind: 'handle';
	/** Key in the scene state that this handle writes to while dragged. */
	readonly bind: string;
	/** Where the handle is drawn. Defaults to `state[bind]` (which must then be a Vec2). */
	readonly at?: Vec2;
	/** Restricts where the handle can be dragged. Applied before `map`. */
	readonly constrain?: Constraint;
	/** Converts the constrained position into the value stored in state (default: the position). */
	readonly map?: (p: Vec2) => unknown;
	/** Visual / hit radius in px. */
	readonly radius?: number;
}

export type Node = PathNode | TextNode | MarkerNode | GroupNode | HandleNode;
export type NodeKind = Node['kind'];

/**
 * What `draw()` and `group()` accept: nodes, nested arrays, and falsy values,
 * so scenes can write `ctx.p('b') > 0 && vector(...)` or `label && text(...)`.
 */
export type Child = Node | readonly Child[] | null | undefined | false | '' | 0;

export function flattenChildren(children: Child): Node[] {
	if (!children) return [];
	if (Array.isArray(children)) return (children as readonly Child[]).flatMap(flattenChildren);
	return [children as Node];
}
