<!--
	/ — the lesson player. The URL (`?lesson=<id>&section=<n>`) is the state:
	the header picks a lesson, the lesson view and ←/→ keys move between sections.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import LessonView from '#lib/lesson/LessonView.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const href = (lesson: string, section = 1) => `?lesson=${encodeURIComponent(lesson)}&section=${section}`;

	const lesson = $derived(data.current?.lesson ?? null);
	const title = $derived(lesson ? `${lesson.sections[data.section - 1].title} · ${lesson.title}` : 'learn');

	function isTyping(target: EventTarget | null) {
		return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName));
	}

	function onkeydown(e: KeyboardEvent) {
		// Handles consume arrow keys themselves (and call preventDefault).
		if (!lesson || !data.id || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
		const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		const target = data.section + step;
		if (step === 0 || target < 1 || target > lesson.sections.length) return;
		e.preventDefault();
		goto(href(data.id, target));
	}
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<svelte:window {onkeydown} />

<div class="app">
	<header>
		<a class="brand" href="/">learn</a>
		{#if data.lessons.length > 0}
			<select value={data.id} onchange={(e) => goto(href(e.currentTarget.value))} aria-label="Lesson">
				{#each data.lessons as l (l.id)}
					<option value={l.id}>{l.title}</option>
				{/each}
			</select>
		{/if}
	</header>

	<main>
		{#if lesson && data.id}
			{@const id = data.id}
			<LessonView {lesson} section={data.section} hrefFor={(n) => href(id, n)} />
		{:else if data.current}
			<div class="message error" role="alert">
				<strong>This lesson failed to load.</strong>
				<pre>{data.current.error instanceof Error ? data.current.error.message : String(data.current.error)}</pre>
			</div>
		{:else if data.id}
			<p class="message">There is no lesson called “{data.id}”.</p>
		{:else}
			<p class="message">No lessons yet. Add one in <code>src/lessons/</code>.</p>
		{/if}
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}

	header {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 12px 24px;
		border-bottom: 1px solid #262626;
	}

	.brand {
		font-weight: 600;
		font-size: 15px;
		letter-spacing: -0.01em;
		color: #f2f0eb;
		text-decoration: none;
	}

	select {
		background: #202020;
		color: #e6e4df;
		border: 1px solid #333;
		border-radius: 6px;
		padding: 5px 10px;
		font: inherit;
		font-size: 14px;
	}

	main {
		flex: 1;
		min-height: 0;
	}

	.message {
		max-width: 40rem;
		margin: 48px auto;
		padding: 0 24px;
		color: #8b909a;
	}

	.error {
		display: flex;
		flex-direction: column;
		gap: 8px;
		color: #f0a3a7;
	}

	.error pre {
		margin: 0;
		padding: 12px;
		border: 1px solid #5a2a2e;
		background: #221819;
		white-space: pre-wrap;
		font-size: 13px;
	}

	@media (max-width: 900px) {
		.app {
			height: auto;
			min-height: 100dvh;
		}
	}
</style>
