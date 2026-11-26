/**
 * Primitives: the flat, screen-space output of compilation, and the ONLY
 * thing renderers consume. Everything (springs, axes, arrows, morphs) has
 * been reduced to these by the time it reaches a renderer, so adding a new
 * renderer (SVG, Canvas/PNG, WebGL, ...) means handling just these types.
 *
 * All coordinates are in px of the scene's logical size, +y down.
 */
import type { Path } from '../geometry/path';
import type { Mat } from '../math/matrix';
import type { Vec2 } from '../math/vec';
import type { Constraint } from '../nodes/types';
import type { ResolvedPathStyle, ResolvedTextStyle } from '../style/style';

export interface PathPrimitive {
	readonly kind: 'path';
	readonly id?: string;
	readonly path: Path;
	readonly style: ResolvedPathStyle;
	readonly opacity: number;
}

export interface TextPrimitive {
	readonly kind: 'text';
	readonly id?: string;
	readonly text: string;
	readonly at: Vec2;
	readonly style: ResolvedTextStyle;
	readonly opacity: number;
}

export type Primitive = PathPrimitive | TextPrimitive;

/** A drag target. Not drawn by static renderers. */
export interface HandlePrimitive {
	readonly id?: string;
	readonly bind: string;
	/** Screen position. */
	readonly at: Vec2;
	/** Position in the handle's local (world) coordinates. */
	readonly local: Vec2;
	/** Screen px → handle-local coordinates (accounts for parent transforms). */
	readonly toLocal: Mat;
	readonly constrain?: Constraint;
	readonly map?: (p: Vec2) => unknown;
	readonly radius: number;
	readonly color: string;
}
