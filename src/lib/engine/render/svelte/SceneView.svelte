<!--
	Interactive player for a Scene: owns the interactive state and the clock,
	re-evaluates the scene whenever either changes, and shows playback controls.

	A SceneView is bound to one scene for its lifetime; wrap it in
	`{#key scene}` to switch scenes (this also resets state and time).
-->
<script module lang="ts">
	import type { Frame, SceneState } from '../../core/scene';

	/** What the view is currently showing; passed to the `children` snippet. */
	export interface SceneSnapshot {
		frame: Frame | null;
		error: unknown;
		state: SceneState;
		t: number;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { untrack } from 'svelte';
	import { evaluateScene, type Scene } from '../../core/scene';
	import type { HandlePrimitive } from '../../core/primitives';
	import type { Vec2 } from '../../math/vec';
	import { moveHandle } from '../../interaction/drag';
	import FrameSvg from './FrameSvg.svelte';
	import { Player } from './player.svelte';

	interface Props {
		scene: Scene<SceneState>;
		controls?: boolean;
		interactive?: boolean;
		/** Rendered below the scene with the current snapshot (e.g. inspectors, export buttons). */
		children?: Snippet<[SceneSnapshot]>;
	}

	let { scene, controls = true, interactive = true, children }: Props = $props();

	// The view is bound to the scene it was created with (see header comment).
	const boundScene = untrack(() => scene);
	const player = new Player(boundScene.duration, boundScene.loop);
	const cloneInitial = () => structuredClone(boundScene.initialState) as SceneState;

	// Scene state is immutable data: replace it, never mutate it (hence `.raw`).
	let sceneState = $state.raw(cloneInitial());

	const result = $derived.by((): { frame: Frame | null; error: unknown } => {
		try {
			return { frame: evaluateScene(boundScene, { state: sceneState, t: player.t }), error: null };
		} catch (error) {
			return { frame: null, error };
		}
	});

	$effect(() => {
		if (boundScene.autoplay) player.play();
		return () => player.destroy();
	});

	function onmove(h: HandlePrimitive, local: Vec2) {
		sceneState = moveHandle(sceneState, h, local);
	}

	function reset() {
		sceneState = cloneInitial();
		player.pause();
		player.seek(0);
		if (boundScene.autoplay) player.play();
	}

	const hasTime = boundScene.duration > 0;
	const hasState = Object.keys(boundScene.initialState).length > 0;
	const aspect = `${boundScene.size[0]} / ${boundScene.size[1]}`;
</script>

<figure class="scene-view">
	{#if result.frame}
		<FrameSvg frame={result.frame} label={boundScene.title} {interactive} {onmove} />
	{:else}
		<div class="error" style:aspect-ratio={aspect} role="alert">
			<strong>Scene error</strong>
			<pre>{result.error instanceof Error ? result.error.message : String(result.error)}</pre>
		</div>
	{/if}

	{#if controls && (hasTime || hasState)}
		<div class="controls">
			{#if hasTime}
				<button type="button" onclick={() => player.toggle()} aria-label={player.playing ? 'Pause' : 'Play'}>
					{player.playing ? '❚❚' : '▶'}
				</button>
				<input
					type="range"
					min="0"
					max={boundScene.duration}
					step="0.001"
					value={player.t}
					oninput={(e) => {
						player.pause();
						player.seek(+e.currentTarget.value);
					}}
					aria-label="Time"
				/>
				<span class="time">{player.t.toFixed(2)} / {boundScene.duration.toFixed(2)}s</span>
			{/if}
			<button type="button" class="reset" onclick={reset}>reset</button>
		</div>
	{/if}

	{@render children?.({ frame: result.frame, error: result.error, state: sceneState, t: player.t })}
</figure>

<style>
	.scene-view {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.error {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border: 1px solid #5a2a2e;
		background: #1a1113;
		color: #f0a3a7;
		font-size: 13px;
		overflow: auto;
	}

	.error pre {
		margin: 0;
		white-space: pre-wrap;
		font-family: ui-monospace, Menlo, monospace;
	}

	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 12px;
		color: #8b909a;
	}

	.controls input[type='range'] {
		flex: 1;
		accent-color: #8b909a;
	}

	.time {
		font-family: ui-monospace, Menlo, monospace;
		font-variant-numeric: tabular-nums;
		min-width: 10ch;
		text-align: right;
	}

	button {
		background: none;
		border: 1px solid #2b2f37;
		color: #c9c7c2;
		font: inherit;
		padding: 3px 9px;
		border-radius: 4px;
		cursor: pointer;
		min-width: 32px;
	}

	button:hover {
		border-color: #4a4f59;
	}
</style>
