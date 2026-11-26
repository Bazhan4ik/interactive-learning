<!--
	A section's quiz: one question at a time with previous/next. The current
	question index is bindable because the lesson view shows that question's
	diagram on the right.
-->
<script lang="ts">
	import type { SceneState } from '#engine';
	import QuestionCard from './QuestionCard.svelte';
	import type { Question } from './questions';

	interface Props {
		lessonId: string;
		questions: readonly Question[];
		/** 0-based index of the question being shown. */
		index?: number;
		/** Live state of the diagram on the right (for `scene` questions). */
		sceneState: SceneState | null;
	}

	let { lessonId, questions, index = $bindable(0), sceneState }: Props = $props();

	const question = $derived(questions[index]);
	const hasNext = $derived(index < questions.length - 1);
</script>

<section class="quiz" aria-label="Quiz">
	<header>
		<span class="label">Quiz</span>
		{#if questions.length > 1}
			<span class="position">Question {index + 1} of {questions.length}</span>
		{/if}
	</header>

	{#key question}
		<QuestionCard {lessonId} {question} {sceneState} onnext={hasNext ? () => index++ : undefined} />
	{/key}

	{#if questions.length > 1}
		<nav aria-label="Questions">
			<button type="button" disabled={index === 0} onclick={() => index--}>← Previous question</button>
			<button type="button" disabled={!hasNext} onclick={() => index++}>Next question →</button>
		</nav>
	{/if}
</section>

<style>
	.quiz {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin-top: 36px;
		padding-top: 24px;
		border-top: 1px solid #2a2a2a;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.label {
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #f2c94c;
	}

	.position {
		font-size: 13px;
		color: #8b909a;
		font-variant-numeric: tabular-nums;
	}

	nav {
		display: flex;
		justify-content: space-between;
		padding-top: 4px;
	}

	nav button {
		padding: 4px 0;
		border: none;
		background: none;
		color: #8b909a;
		font: inherit;
		font-size: 13px;
		cursor: pointer;
	}

	nav button:hover:not(:disabled) {
		color: #e6e4df;
	}

	nav button:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
