<!--
	Live SVG view of a single Frame. Stateless: it renders primitives and reports
	handle drags through `onmove`; the owner decides what to do with them.
-->
<script lang="ts">
	import type { HandlePrimitive } from '../../core/primitives';
	import type { Frame } from '../../core/scene';
	import type { Vec2 } from '../../math/vec';
	import { apply } from '../../math/matrix';
	import { dragTarget, startDrag, type DragSession } from '../../interaction/drag';
	import { pathAttrs, textAttrs } from '../attributes';

	interface Props {
		frame: Frame;
		/** Accessible label for the figure. */
		label?: string;
		interactive?: boolean;
		/** Called with the handle and its desired (unconstrained) local position. */
		onmove?: (handle: HandlePrimitive, local: Vec2) => void;
	}

	let { frame, label = 'diagram', interactive = true, onmove }: Props = $props();

	let session = $state<DragSession | null>(null);

	const KEY_STEP_PX = 8;
	const KEY_DIRS: Record<string, Vec2> = {
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, -1],
		ArrowDown: [0, 1]
	};

	/** Pointer position in the frame's logical px (accounts for CSS scaling). */
	function toPx(e: PointerEvent): Vec2 {
		const ctm = (e.currentTarget as SVGGraphicsElement).ownerSVGElement?.getScreenCTM();
		if (!ctm) return [0, 0];
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
		return [p.x, p.y];
	}

	function current(bind: string) {
		return frame.handles.find((h) => h.bind === bind);
	}

	function onpointerdown(e: PointerEvent, h: HandlePrimitive) {
		if (!interactive) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		session = startDrag(h, toPx(e));
	}

	function onpointermove(e: PointerEvent) {
		if (!session) return;
		const h = current(session.bind);
		if (h) onmove?.(h, dragTarget(h, session, toPx(e)));
	}

	function onpointerup() {
		session = null;
	}

	function onkeydown(e: KeyboardEvent, h: HandlePrimitive) {
		const dir = KEY_DIRS[e.key];
		if (!interactive || !dir) return;
		e.preventDefault();
		const step = e.shiftKey ? KEY_STEP_PX * 4 : KEY_STEP_PX;
		onmove?.(h, apply(h.toLocal, [h.at[0] + dir[0] * step, h.at[1] + dir[1] * step]));
	}
</script>

<svg
	class="frame"
	viewBox="0 0 {frame.width} {frame.height}"
	role="img"
	aria-label={label}
	style:--bg={frame.background}
>
	<rect width={frame.width} height={frame.height} fill={frame.background} />

	{#each frame.primitives as p, i (i)}
		{#if p.kind === 'path'}
			<path {...pathAttrs(p)} />
		{:else}
			<text {...textAttrs(p)}>{p.text}</text>
		{/if}
	{/each}

	{#if interactive}
		{#each frame.handles as h (h.bind)}
			<g
				class={['handle', { dragging: session?.bind === h.bind }]}
				transform="translate({h.at[0]} {h.at[1]})"
				style:--color={h.color}
				role="button"
				tabindex="0"
				aria-label="Draggable point “{h.bind}” at {h.local.map((x) => x.toFixed(2)).join(', ')}. Move with arrow keys."
				onpointerdown={(e) => onpointerdown(e, h)}
				{onpointermove}
				{onpointerup}
				onpointercancel={onpointerup}
				onkeydown={(e) => onkeydown(e, h)}
			>
				<circle class="hit" r={h.radius * 2} />
				<circle class="ring" r={h.radius} />
			</g>
		{/each}
	{/if}
</svg>

<style>
	.frame {
		display: block;
		width: 100%;
		height: auto;
		user-select: none;
		-webkit-user-select: none;
	}

	.handle {
		cursor: grab;
		touch-action: none;
		outline: none;
	}

	.handle.dragging {
		cursor: grabbing;
	}

	.hit {
		fill: transparent;
	}

	.ring {
		fill: color-mix(in srgb, var(--color) 25%, transparent);
		stroke: var(--color);
		stroke-width: 2;
		transform-origin: 0 0;
		transition:
			transform 120ms ease,
			fill 120ms ease;
	}

	.handle:hover .ring,
	.handle:focus-visible .ring,
	.handle.dragging .ring {
		transform: scale(1.3);
		fill: color-mix(in srgb, var(--color) 45%, transparent);
	}

	.handle:focus-visible .ring {
		stroke-width: 3;
	}
</style>
