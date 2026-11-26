<!--
	One section of a lesson: explanation and quiz on the left, a diagram on the
	right. The diagram is the current question's scene if it has one, otherwise
	the section's scene.

	Navigation between sections is plain links (`hrefFor`), so the URL is the
	source of truth. Mount one LessonView per section ({#key}) so per-section
	state (current question, diagram state) starts fresh.
-->
<script lang="ts">
	import type { AnyScene, SceneState } from '#engine';
	import { SceneView } from '#engine/svelte';
	import type { Lesson, Section } from './lesson';
	import { renderMarkdown } from './markdown';
	import './prose.css';
	import Quiz from './quiz/Quiz.svelte';
	import { buildQuizReport } from './quiz/report';
	import { getQuizResults } from './quiz/results.svelte';

	interface Props {
		/** Lesson id (folder name), used to key quiz results. */
		lessonId: string;
		lesson: Lesson;
		/** 1-based section number. */
		section: number;
		/** URL of a section of this lesson. */
		hrefFor: (section: number) => string;
	}

	let { lessonId, lesson, section: number, hrefFor }: Props = $props();

	const results = getQuizResults();

	const section: Section = $derived(lesson.sections[number - 1]);
	const prev: Section | undefined = $derived(lesson.sections[number - 2]);
	const next: Section | undefined = $derived(lesson.sections[number]);

	let questionIndex = $state(0);
	const shownScene = $derived(section.quiz[questionIndex]?.scene ?? section.scene);

	// Latest state of the diagram, remembered per scene so switching questions
	// never hands one scene's state to another scene's question.
	let live = $state.raw<{ scene: AnyScene; state: SceneState } | null>(null);
	const liveState = $derived(live && live.scene === shownScene ? live.state : null);

	const score = $derived(next ? null : buildQuizReport(lesson, results.forLesson(lessonId)).summary);
</script>

<div class="lesson">
	<article class="text">
		<div class="scroll">
			<header>
				<p class="count">Section {number} of {lesson.sections.length}</p>
				<h1>{section.title}</h1>
			</header>

			{#if section.text}
				<div class="prose body">
					<!-- renderMarkdown escapes raw HTML and unsafe links (see markdown.ts) -->
					{@html renderMarkdown(section.text)}
				</div>
			{/if}

			{#if section.quiz.length > 0}
				<Quiz {lessonId} questions={section.quiz} bind:index={questionIndex} sceneState={liveState} />
			{/if}
		</div>

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
					{#if score && score.questions > 0}
						<span class="name">Quiz: {score.correct} of {score.questions} correct</span>
					{/if}
				</span>
			{/if}
		</nav>
	</article>

	<section class="stage" aria-label="Diagram">
		{#if shownScene}
			{#key shownScene}
				<div class="scene">
					<SceneView scene={shownScene} label={section.title} onstatechange={(state) => (live = { scene: shownScene!, state })} />
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
		padding: 40px 44px 40px;
	}

	.scroll > :global(*) {
		max-width: 40rem;
	}

	header {
		margin-bottom: 26px;
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
