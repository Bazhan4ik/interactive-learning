/**
 * Scenes: the unit a lesson author (usually an LLM) writes.
 *
 * A scene is DECLARATIVE: `draw(ctx)` is a pure function of the current
 * interactive `state` and time `t`. There are no updaters or mutable objects:
 *
 *   - animation   = draw depends on `ctx.t` / `ctx.p('phase')`
 *   - interaction = handles write into `state`, then the scene is redrawn
 *   - quizzes     = `checks` are predicates over `state`
 *
 * So any frame can be reproduced from `(state, t)` alone, which makes scenes
 * easy to test, debug, seek, and render to any output format.
 */
import { resolveEasing, type Easing } from '../animation/easing';
import { createTimeline, type Timeline, type TimelineSpec } from '../animation/timeline';
import { clamp } from '../math/scalar';
import { flattenChildren, type Child } from '../nodes/types';
import { defaultTheme, type Theme } from '../style/theme';
import { compile } from './compile';
import type { HandlePrimitive, Primitive } from './primitives';
import { createViewport, type ViewSpec, type Viewport } from './viewport';

export type SceneState = Record<string, unknown>;

export interface DrawContext<S extends SceneState> {
	/** Current interactive state (initially `scene.state`). */
	readonly state: Readonly<S>;
	/** Current time in seconds. */
	readonly t: number;
	/** Total duration in seconds (0 for static scenes). */
	readonly duration: number;
	/** Eased progress (0–1) of a timeline phase. Default easing: `'smooth'`. */
	p(phase: string, ease?: Easing): number;
	/** World region actually visible on screen. */
	readonly view: ViewSpec;
	/** Pixels per world unit. */
	readonly unit: number;
	/** Convert a length in px to world units (e.g. to offset a label by 12px). */
	px(n: number): number;
}

/**
 * A scene has no title or description: scene files document themselves in a
 * header comment, and all learner-facing text lives in the lesson.
 */
export interface SceneDefinition<S extends SceneState = SceneState> {
	/** Logical size in px; the output scales to any size. Default `[800, 450]`. */
	size?: readonly [number, number];
	/** World region to show. Default `{ x: [-8, 8], y: [-4.5, 4.5] }`. */
	view?: ViewSpec;
	background?: string;
	theme?: Partial<Theme>;
	/** Initial interactive state. Handles write into it; `draw` and `checks` read it. */
	state?: S;
	/** Named animation phases; see `createTimeline`. */
	timeline?: TimelineSpec;
	/** Duration in seconds. Defaults to the timeline's length. Use for `ctx.t`-driven motion. */
	duration?: number;
	/** Restart from 0 when the end is reached. */
	loop?: boolean;
	/** Start playing on load (default `true` if the scene has a duration). */
	autoplay?: boolean;
	draw(ctx: DrawContext<S>): Child;
	/** Named predicates over the state, e.g. for quizzes ("is the vector in quadrant III?"). */
	checks?: Record<string, (state: Readonly<S>) => boolean>;
}

export interface Scene<S extends SceneState = SceneState> {
	readonly definition: SceneDefinition<S>;
	readonly size: readonly [number, number];
	readonly viewport: Viewport;
	readonly theme: Theme;
	readonly background: string;
	readonly initialState: Readonly<S>;
	readonly timeline: Timeline;
	readonly duration: number;
	readonly loop: boolean;
	readonly autoplay: boolean;
}

/**
 * A scene of any state shape. `Scene<{ a: Vec2 }>` is not assignable to
 * `Scene<SceneState>` (its `checks` accept only its own state), so code that
 * just holds or displays scenes — views, lessons — uses this.
 */
export type AnyScene = Scene<any>;

/** Everything a renderer needs to draw one moment of a scene. */
export interface Frame {
	readonly width: number;
	readonly height: number;
	readonly background: string;
	readonly primitives: readonly Primitive[];
	readonly handles: readonly HandlePrimitive[];
	readonly checks: Readonly<Record<string, boolean>>;
	readonly t: number;
	readonly duration: number;
}

export type ScenePhase = 'define' | 'draw' | 'compile' | 'checks';

/**
 * Errors raised while defining or evaluating a scene, annotated with the phase
 * they happened in. (Which file the scene came from is known to the loader.)
 */
export class SceneError extends Error {
	constructor(
		readonly phase: ScenePhase,
		cause: unknown
	) {
		const msg = cause instanceof Error ? cause.message : String(cause);
		super(`${phase} failed: ${msg}`, { cause });
		this.name = 'SceneError';
	}
}

const DEFAULT_SIZE = [800, 450] as const;
const DEFAULT_VIEW: ViewSpec = { x: [-8, 8], y: [-4.5, 4.5] };

/** Validate and normalise a scene definition. Use as `export default defineScene({...})`. */
export function defineScene<S extends SceneState = SceneState>(def: SceneDefinition<S>): Scene<S> {
	try {
		if (typeof def?.draw !== 'function') throw new Error('`draw` must be a function returning nodes');
		const size = def.size ?? DEFAULT_SIZE;
		if (!(size[0] > 0 && size[1] > 0)) throw new Error(`\`size\` must be positive, got [${size}]`);
		const timeline = createTimeline(def.timeline);
		const duration = Math.max(0, def.duration ?? timeline.duration);
		const theme = { ...defaultTheme, ...def.theme };
		return {
			definition: def,
			size,
			viewport: createViewport(size[0], size[1], def.view ?? DEFAULT_VIEW),
			theme,
			background: def.background ?? theme.background,
			initialState: (def.state ?? {}) as S,
			timeline,
			duration,
			loop: def.loop ?? false,
			autoplay: def.autoplay ?? duration > 0
		};
	} catch (e) {
		throw new SceneError('define', e);
	}
}

export interface EvaluateOptions<S extends SceneState> {
	state?: Readonly<S>;
	t?: number;
}

/** Render a scene to a `Frame` at the given state and time. Pure. */
export function evaluateScene<S extends SceneState>(scene: Scene<S>, opts: EvaluateOptions<S> = {}): Frame {
	const state = opts.state ?? scene.initialState;
	const t = clamp(opts.t ?? 0, 0, scene.duration);
	const { viewport, timeline } = scene;

	const ctx: DrawContext<S> = {
		state,
		t,
		duration: scene.duration,
		p: (phase, ease) => timeline.progress(phase, t, ease === undefined ? 'smooth' : resolveEasing(ease)),
		view: viewport.visible,
		unit: viewport.unit,
		px: (n) => n / viewport.unit
	};

	const run = <T>(phase: ScenePhase, fn: () => T): T => {
		try {
			return fn();
		} catch (e) {
			throw e instanceof SceneError ? e : new SceneError(phase, e);
		}
	};

	const nodes = run('draw', () => flattenChildren(scene.definition.draw(ctx)));
	const { primitives, handles } = run('compile', () => compile(nodes, { viewport, theme: scene.theme, state }));
	const checks = run('checks', () =>
		Object.fromEntries(Object.entries(scene.definition.checks ?? {}).map(([name, fn]) => [name, Boolean(fn(state))]))
	);

	return {
		width: viewport.width,
		height: viewport.height,
		background: scene.background,
		primitives,
		handles,
		checks,
		t,
		duration: scene.duration
	};
}
