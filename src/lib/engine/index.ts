/**
 * Public API of the engine. Lessons and library objects import ONLY from
 * here (`#engine`), never from internal files, so internals can change freely.
 *
 * Svelte components live in `#engine/svelte` so this module stays free of UI
 * code and runs anywhere (browser, Node, tests).
 */

// Scenes
export { defineScene, evaluateScene, SceneError } from './core/scene';
export type { DrawContext, Frame, Scene, SceneDefinition, SceneState, ScenePhase } from './core/scene';
export type { ViewSpec, Viewport, Range } from './core/viewport';
export type { Primitive, PathPrimitive, TextPrimitive, HandlePrimitive } from './core/primitives';

// Library object contract
export { defineObject, describeObjects, isObjectFactory, renderExample } from './core/object';
export type { ObjectFactory, ObjectMeta } from './core/object';

// Nodes: the drawing vocabulary
export {
	arc,
	arrow,
	circle,
	curve,
	dot,
	ellipse,
	group,
	handle,
	line,
	marker,
	parametric,
	path,
	polygon,
	polyline,
	rect,
	regularPolygon,
	text
} from './nodes/shapes';
export type { NodeOptions } from './nodes/shapes';
export { translate, rotate, scale, withOpacity, withStyle, nodeBounds, boundsCenter, mapTree } from './nodes/transform';
export type { Child, Constraint, Node, NodeKind, PathNode, TextNode, MarkerNode, GroupNode, HandleNode, TipKind } from './nodes/types';

// Animation
export { create, uncreate, fadeIn, fadeOut, grow, morph, stagger } from './animation/effects';
export { easings } from './animation/easing';
export type { Easing, EasingFn, EasingName } from './animation/easing';
export type { TimelineSpec, PhaseSpec, Timeline } from './animation/timeline';

// Interaction
export { constraints } from './interaction/constraints';

// Math
export * as vec from './math/vec';
export type { Vec2 } from './math/vec';
export * as mat from './math/matrix';
export type { Mat } from './math/matrix';
export { TAU, clamp, lerp, inverseLerp, remap, degToRad, radToDeg, round, snap } from './math/scalar';

// Geometry (mainly for library authors)
export * as geometry from './geometry/construct';
export { PathBuilder } from './geometry/construct';
export type { Path, Subpath, Bounds } from './geometry/path';
export { pathLength, pathBounds, slicePath, lerpPath, transformPath } from './geometry/path';

// Style
export { colors, defaultTheme } from './style/theme';
export type { Theme, ColorName } from './style/theme';
export { mix, withAlpha } from './style/color';
export type { StyleProps, Color, FontFamily, TextAnchor, TextBaseline } from './style/style';

// Static renderers
export { renderSvg } from './render/svg-string';
export type { SvgRenderOptions } from './render/svg-string';
export { drawFrame, renderPng } from './render/canvas';
