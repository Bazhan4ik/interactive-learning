/**
 * Pure drag logic shared by all interactive views. Views translate pointer
 * events into screen px and call these; no DOM involved, so it's unit-testable.
 */
import { apply } from '../math/matrix';
import { add, sub, type Vec2 } from '../math/vec';
import type { HandlePrimitive } from '../core/primitives';
import type { SceneState } from '../core/scene';

export interface DragSession {
	readonly bind: string;
	/** handle position − pointer position, in handle-local units, so the handle doesn't jump. */
	readonly offset: Vec2;
}

export function startDrag(h: HandlePrimitive, pointerPx: Vec2): DragSession {
	return { bind: h.bind, offset: sub(h.local, apply(h.toLocal, pointerPx)) };
}

/** Where the handle should go for the pointer at `pointerPx`, before constraints. */
export function dragTarget(h: HandlePrimitive, session: DragSession, pointerPx: Vec2): Vec2 {
	return add(apply(h.toLocal, pointerPx), session.offset);
}

/** New state after moving handle `h` to `local` (handle-local coordinates). */
export function moveHandle<S extends SceneState>(state: S, h: HandlePrimitive, local: Vec2): S {
	const constrained = h.constrain ? h.constrain(local) : local;
	const value = h.map ? h.map(constrained) : constrained;
	return { ...state, [h.bind]: value };
}
