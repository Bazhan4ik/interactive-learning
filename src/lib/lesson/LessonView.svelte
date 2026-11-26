<!--
	One section of a lesson: explanation on the left, the section's scene on the
	right. Navigation is plain links (`hrefFor`), so the URL is the source of
	truth and browser back/forward walk through sections.
-->
<script lang="ts">
	import { SceneView } from '#engine/svelte';
	import type { Lesson, Section } from './lesson';
	import { renderMarkdown } from './markdown';

	interface Props {
		lesson: Lesson;
		/** 1-based section number. */
		section: number;
		/** URL of a section of this lesson. */
		hrefFor: (section: number) => string;
	}

	let { lesson, section: number, hrefFor }: Props = $props();

	const section: Section = $derived(lesson.sections[number - 1]);
	const prev: Section | undefined = $derived(lesson.sections[number - 2]);
	const next: Section | undefined = $derived(lesson.sections[number]);
	const html = $derived(renderMarkdown(section.text));
</script>

<div class="lesson">
	<article class="text">
		{#key section}
			<div class="scroll">
				<header>
					<p class="topic">{lesson.title}</p>
					<ol class="progress" aria-label="Sections">
						{#each lesson.sections as s (s.number)}
							<li>
								<a
									href={hrefFor(s.number)}
									class={{ done: s.number < number, current: s.number === number }}
									aria-current={s.number === number ? 'step' : undefined}
									title={s.title}
								>
									<span class="visually-hidden">{s.number}. {s.title}</span>
								</a>
							</li>
						{/each}
					</ol>
					<p class="count">Section {number} of {lesson.sections.length}</p>
					<h1>{section.title}</h1>
				</header>

				<div class="prose">
					<!-- renderMarkdown escapes raw HTML and unsafe links (see markdown.ts) -->
					{@html html}
				</div>
			</div>
		{/key}

		<nav class="pager" aria-label="Section navigation">
			{#if prev}
				<a class="prev" href={hrefFor(prev.number)}>
					<span class="dir">← Previous</span>
					<span class="name">{prev.title}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if next}
				<a class="next" href={hrefFor(next.number)}>
					<span class="dir">Next →</span>
					<span class="name">{next.title}</span>
				</a>
			{:else}
				<span class="next end">
					<span class="dir">End of lesson</span>
				</span>
			{/if}
		</nav>
	</article>

	<section class="stage" aria-label="Diagram">
		{#if section.scene}
			{#key section.scene}
				<div class="scene">
					<SceneView scene={section.scene} label={section.title} />
				</div>
			{/key}
		{/if}
	</section>
</div>

<style>
	.lesson {
		display: grid;
		grid-template-columns: minmax(360px, 38%) minmax(0, 1fr);
		height: 100%;
		min-height: 0;
	}

	/* ---- text column ---- */

	.text {
		display: flex;
		flex-direction: column;
		min-height: 0;
		border-right: 1px solid #262626;
	}

	.scroll {
		flex: 1;
		overflow-y: auto;
		padding: 40px 44px 32px;
	}

	header {
		margin-bottom: 28px;
	}

	.topic {
		margin: 0 0 14px;
		font-size: 13px;
		letter-spacing: 0.02em;
		color: #8b909a;
	}

	.progress {
		display: flex;
		gap: 4px;
		margin: 0 0 22px;
		padding: 0;
		list-style: none;
	}

	.progress li {
		flex: 1;
	}

	.progress a {
		display: block;
		padding: 6px 0;
	}

	.progress a::before {
		content: '';
		display: block;
		height: 3px;
		border-radius: 2px;
		background: #333;
		transition: background 150ms ease;
	}

	.progress a.done::before {
		background: #5c5c5c;
	}

	.progress a.current::before {
		background: #e6e4df;
	}

	.progress a:hover::before {
		background: #8b909a;
	}

	.count {
		margin: 0 0 6px;
		font-size: 13px;
		color: #8b909a;
		font-variant-numeric: tabular-nums;
	}

	h1 {
		margin: 0;
		font-size: 27px;
		line-height: 1.25;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #f2f0eb;
	}

	/* ---- markdown ---- */

	.prose {
		max-width: 40rem;
		font-size: 16.5px;
		line-height: 1.7;
		color: #cfccc6;
	}

	.prose :global(p) {
		margin: 0 0 1em;
	}

	.prose :global(h2),
	.prose :global(h3) {
		margin: 1.8em 0 0.5em;
		font-size: 17px;
		font-weight: 600;
		color: #f2f0eb;
	}

	.prose :global(strong) {
		font-weight: 600;
		color: #f2f0eb;
	}

	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1em;
		padding-left: 1.3em;
	}

	.prose :global(li) {
		margin: 0.25em 0;
	}

	.prose :global(code) {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 0.9em;
		padding: 0.1em 0.35em;
		border-radius: 4px;
		background: #242424;
	}

	.prose :global(blockquote) {
		margin: 0 0 1em;
		padding-left: 1em;
		border-left: 2px solid #333;
		color: #a9a7a2;
	}

	.prose :global(a) {
		color: #8fb8f7;
	}

	/* ---- pager ---- */

	.pager {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		padding: 16px 44px 20px;
		border-top: 1px solid #262626;
	}

	.pager a,
	.pager .end {
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-width: 48%;
		padding: 8px 12px;
		margin: -8px -12px;
		border-radius: 6px;
		text-decoration: none;
		transition: background 120ms ease;
	}

	.pager a:hover {
		background: #222;
	}

	.pager .next {
		text-align: right;
		align-items: flex-end;
	}

	.dir {
		font-size: 14px;
		font-weight: 500;
		color: #e6e4df;
	}

	.end .dir {
		color: #5c5c5c;
		font-weight: 400;
	}

	.name {
		font-size: 13px;
		color: #8b909a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	/* ---- diagram ---- */

	.stage {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 0;
		overflow: auto;
		padding: 32px 40px;
	}

	.scene {
		width: 100%;
		max-width: 1100px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 900px) {
		.lesson {
			grid-template-columns: 1fr;
			height: auto;
		}

		.stage {
			order: -1;
			padding: 16px;
			border-bottom: 1px solid #262626;
		}

		.stage:empty {
			display: none;
		}

		.text {
			border-right: none;
		}

		.scroll {
			overflow: visible;
			padding: 28px 20px 24px;
		}

		.pager {
			padding: 16px 20px 24px;
		}
	}
</style>
