<!--
	/dev — engine test bench. Pick any *.scene.ts file, see its source
	next to the live render, inspect state/checks, and export SVG/PNG.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { renderPng, renderSvg, type Frame } from '#engine';
	import { SceneView } from '#engine/svelte';
	import { download } from '#lib/dev/download.ts';
	import { loadScene, sceneIds } from '#lib/dev/scenes.ts';

	const selected = $derived(page.url.searchParams.get('scene') ?? sceneIds[0] ?? '');
	const loading = $derived(loadScene(selected));

	function select(id: string) {
		goto(`?scene=${encodeURIComponent(id)}`, { replace: true, reset: false });
	}

	const fileName = (id: string) => id.replaceAll('/', '_');

	async function exportPng(frame: Frame) {
		download(`${fileName(selected)}.png`, await renderPng(frame, 2));
	}

	function exportSvg(frame: Frame) {
		download(`${fileName(selected)}.svg`, renderSvg(frame), 'image/svg+xml');
	}

	const compactJson = (value: unknown) =>
		JSON.stringify(value, (_, v) => (typeof v === 'number' ? Math.round(v * 1000) / 1000 : v));

	const errorText = (e: unknown) => (e instanceof Error ? (e.stack ?? e.message) : String(e));
</script>

<svelte:head>
	<title>engine · dev</title>
</svelte:head>

<div class="dev">
	<header>
		<span class="brand">engine / dev</span>
		<select value={selected} onchange={(e) => select(e.currentTarget.value)} aria-label="Scene">
			{#each sceneIds as id (id)}
				<option value={id}>{id}</option>
			{/each}
		</select>
	</header>

	{#await loading}
		<p class="status">loading…</p>
	{:then loaded}
		<main>
			<section class="code" aria-label="Scene source">
				<div class="file">{loaded.file.slice(1)}</div>
				<pre><code
						>{#each loaded.source.split('\n') as lineText, i (i)}<span class="line"
								><span class="ln">{i + 1}</span>{lineText}</span
							>{/each}</code
					></pre>
			</section>

			<section class="stage">
				{#if loaded.scene}
					{#key loaded.scene}
						<SceneView scene={loaded.scene}>
							{#snippet children(snap)}
								<div class="inspector">
									<div class="row">
										{#if snap.frame}
											{@const frame = snap.frame}
											<span class="stat">
												{frame.primitives.length} primitives · {frame.handles.length} handles
											</span>
											<span class="spacer"></span>
											<button type="button" onclick={() => exportSvg(frame)}>svg</button>
											<button type="button" onclick={() => exportPng(frame)}>png</button>
										{/if}
									</div>

									{#if snap.frame && Object.keys(snap.frame.checks).length > 0}
										<ul class="checks">
											{#each Object.entries(snap.frame.checks) as [name, ok] (name)}
												<li class={{ ok }}>{ok ? '✓' : '·'} {name}</li>
											{/each}
										</ul>
									{/if}

									{#if Object.keys(snap.state).length > 0}
										<pre class="state">state {compactJson(snap.state)}</pre>
									{/if}
								</div>
							{/snippet}
						</SceneView>
					{/key}
				{:else}
					<pre class="load-error">{errorText(loaded.error)}</pre>
				{/if}
			</section>
		</main>
	{/await}
</div>

<style>
	.dev {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		background: #0b0c0f;
		color: #c9c7c2;
		font-size: 13px;
		line-height: 1.5;
	}

	header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 16px;
		border-bottom: 1px solid #1d2026;
	}

	.brand {
		color: #8b909a;
		font-family: ui-monospace, Menlo, monospace;
	}

	select {
		background: #14161b;
		color: #e6e4df;
		border: 1px solid #2b2f37;
		border-radius: 4px;
		padding: 4px 8px;
		font: inherit;
	}

	.status {
		padding: 16px;
		color: #8b909a;
	}

	main {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
	}

	.code {
		overflow: auto;
		border-right: 1px solid #1d2026;
	}

	.file {
		position: sticky;
		top: 0;
		padding: 8px 16px;
		background: #0b0c0f;
		color: #6b707a;
		font-family: ui-monospace, Menlo, monospace;
		font-size: 12px;
		border-bottom: 1px solid #16181d;
	}

	pre {
		margin: 0;
		font: 12.5px/1.6 ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
	}

	.code pre {
		padding: 12px 16px 24px 0;
		color: #c9c7c2;
		tab-size: 2;
	}

	.line {
		display: block;
	}

	.ln {
		display: inline-block;
		width: 4ch;
		margin-right: 2ch;
		text-align: right;
		color: #3c4049;
		user-select: none;
	}

	.stage {
		overflow: auto;
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.inspector {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 6px;
		border-top: 1px solid #1d2026;
		font-size: 12px;
		color: #8b909a;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.spacer {
		flex: 1;
	}

	.stat {
		font-family: ui-monospace, Menlo, monospace;
	}

	button {
		background: none;
		border: 1px solid #2b2f37;
		color: #c9c7c2;
		font: inherit;
		padding: 2px 10px;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		border-color: #4a4f59;
	}

	.checks {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 4px 16px;
		font-family: ui-monospace, Menlo, monospace;
	}

	.checks li.ok {
		color: #5fd08a;
	}

	.state {
		color: #8b909a;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.load-error {
		padding: 16px;
		border: 1px solid #5a2a2e;
		background: #1a1113;
		color: #f0a3a7;
		white-space: pre-wrap;
	}

	@media (max-width: 900px) {
		main {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
		}

		.dev {
			height: auto;
		}

		.code {
			order: 2;
			border-right: none;
			border-top: 1px solid #1d2026;
			max-height: 60vh;
		}
	}
</style>
