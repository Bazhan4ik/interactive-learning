<!--
	One quiz question: prompt, answer input, Check, feedback, and the
	explanation once solved or revealed. Every check is recorded in the
	session's QuizResults. Mount one per question ({#key question}).
-->
<script lang="ts">
	import type { SceneState } from '#engine';
	import '../prose.css';
	import { renderMarkdown, renderMarkdownInline } from '../markdown';
	import { describeAnswer, grade, type Question, type QuizResponse } from './questions';
	import { getQuizResults, statusOf } from './results.svelte';

	interface Props {
		lessonId: string;
		question: Question;
		/** Live state of the diagram, for `scene` questions (null = untouched). */
		sceneState: SceneState | null;
		/** Shown after a correct answer when there is a next question. */
		onnext?: () => void;
	}

	let { lessonId, question, sceneState, onnext }: Props = $props();

	const results = getQuizResults();
	const record = $derived(results.get(lessonId, question.id));
	const status = $derived(statusOf(record));
	const locked = $derived(status === 'correct' || status === 'revealed');

	// Restore the last submitted answer when revisiting a question.
	// (The card is keyed per question, so reading this once is enough.)
	function lastResponse() {
		return results.get(lessonId, question.id)?.attempts.at(-1)?.response;
	}
	const previous = lastResponse();
	let selected = $state<number[]>(previous?.type === 'choice' ? [...previous.selected] : []);
	let input = $state(previous?.type === 'number' ? previous.input : '');
	let inputError = $state<string | null>(null);

	function response(): QuizResponse {
		switch (question.type) {
			case 'choice':
				return { type: 'choice', selected: $state.snapshot(selected) };
			case 'number':
				return { type: 'number', input };
			case 'scene':
				return { type: 'scene', state: sceneState ?? question.scene.initialState };
		}
	}

	function check() {
		if (locked) return;
		const r = response();
		const g = grade(question, r);
		if (g.error !== undefined) {
			inputError = g.error;
			return;
		}
		inputError = null;
		results.record(lessonId, question.id, { response: r, correct: g.correct, at: Date.now() });
	}

	function toggle(i: number) {
		if (locked) return;
		if (question.type === 'choice' && question.multiple) {
			selected = selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i];
		} else {
			selected = [i];
		}
	}

	const correctOptions = $derived(question.type === 'choice' ? question.answer : []);
	const inputName = $derived(`q-${question.id}`);
</script>

<div class="question">
	<div class="prompt prose">
		<!-- renderMarkdown escapes raw HTML and unsafe links (see markdown.ts) -->
		{@html renderMarkdown(question.prompt)}
	</div>

	{#if question.type === 'choice'}
		<fieldset class="options" disabled={locked}>
			<legend class="visually-hidden">{question.multiple ? 'Select all that apply' : 'Select one answer'}</legend>
			{#if question.multiple}<p class="hint">Select all that apply.</p>{/if}
			{#each question.options as option, i (i)}
				<label
					class={[
						'option',
						{
							selected: selected.includes(i),
							correct: locked && correctOptions.includes(i),
							wrong: locked && selected.includes(i) && !correctOptions.includes(i)
						}
					]}
				>
					<input
						type={question.multiple ? 'checkbox' : 'radio'}
						name={inputName}
						checked={selected.includes(i)}
						onchange={() => toggle(i)}
					/>
					<span class="mark" aria-hidden="true"></span>
					<span class="option-text prose">{@html renderMarkdownInline(option)}</span>
				</label>
			{/each}
		</fieldset>
	{:else if question.type === 'number'}
		<div class="number">
			<input
				type="text"
				inputmode="decimal"
				autocomplete="off"
				spellcheck="false"
				placeholder="Your answer"
				aria-label="Your answer"
				bind:value={input}
				disabled={locked}
				onkeydown={(e) => {
					if (e.key === 'Enter') check();
				}}
			/>
			{#if question.unit}<span class="unit">{question.unit}</span>{/if}
		</div>
	{:else}
		<p class="hint scene-hint">Answer in the diagram, then press Check.</p>
	{/if}

	<div class="actions" aria-live="polite">
		{#if status === 'correct'}
			<span class="feedback ok">✓ Correct{record && record.attempts.length > 1 ? ` (attempt ${record.attempts.length})` : ''}</span>
			{#if onnext}<button type="button" class="primary" onclick={onnext}>Next question →</button>{/if}
		{:else if status === 'revealed'}
			<span class="feedback shown">Answer shown</span>
			{#if onnext}<button type="button" class="primary" onclick={onnext}>Next question →</button>{/if}
		{:else}
			<button type="button" class="primary" onclick={check}>Check</button>
			{#if inputError}
				<span class="feedback error">{inputError}</span>
			{:else if status === 'incorrect'}
				<span class="feedback bad">Not quite. Try again.</span>
				<button type="button" class="link" onclick={() => results.reveal(lessonId, question.id)}>Show answer</button>
			{/if}
		{/if}
	</div>

	{#if status === 'revealed' && question.type !== 'scene'}
		<p class="answer">
			Answer: <span class="prose">{@html renderMarkdownInline(describeAnswer(question))}</span>
		</p>
	{/if}

	{#if locked && question.explanation}
		<div class="explanation prose">{@html renderMarkdown(question.explanation)}</div>
	{/if}
</div>

<style>
	.question {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.prompt {
		color: #e6e4df;
	}

	.hint {
		margin: 0;
		font-size: 14px;
		color: #8b909a;
	}

	/* ---- choice ---- */

	.options {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		border: none;
	}

	.option {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border: 1px solid #333;
		border-radius: 8px;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			background 120ms ease;
	}

	.option:hover {
		border-color: #4a4a4a;
	}

	.option:has(input:focus-visible) {
		outline: 2px solid #5b9cf5;
		outline-offset: 2px;
	}

	.option.selected {
		border-color: #8b909a;
		background: #202020;
	}

	.option.correct {
		border-color: #5fd08a;
		background: color-mix(in srgb, #5fd08a 10%, transparent);
	}

	.option.wrong {
		border-color: #f0656b;
		background: color-mix(in srgb, #f0656b 10%, transparent);
	}

	.options:disabled .option {
		cursor: default;
	}

	.option input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.mark {
		flex: none;
		width: 16px;
		height: 16px;
		border: 1.5px solid #5c5c5c;
		border-radius: 50%;
	}

	.option input[type='checkbox'] + .mark {
		border-radius: 4px;
	}

	.option.selected .mark {
		border-color: #e6e4df;
		background: radial-gradient(circle, #e6e4df 0 4px, transparent 4.5px);
	}

	.option.selected input[type='checkbox'] + .mark {
		background: #e6e4df;
	}

	.option-text {
		font-size: 15.5px;
		color: #e6e4df;
	}

	/* ---- number ---- */

	.number {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.number input {
		width: 12rem;
		padding: 8px 12px;
		border: 1px solid #333;
		border-radius: 8px;
		background: #202020;
		color: #f2f0eb;
		font: inherit;
		font-size: 16px;
		font-variant-numeric: tabular-nums;
	}

	.number input:focus {
		outline: none;
		border-color: #8b909a;
	}

	.number input:disabled {
		opacity: 0.7;
	}

	.unit {
		color: #8b909a;
	}

	/* ---- actions & feedback ---- */

	.actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px 16px;
		min-height: 36px;
	}

	button {
		font: inherit;
		font-size: 14px;
		cursor: pointer;
	}

	.primary {
		padding: 7px 16px;
		border: 1px solid #e6e4df;
		border-radius: 8px;
		background: #e6e4df;
		color: #191919;
		font-weight: 500;
	}

	.primary:hover {
		background: #fff;
	}

	.link {
		padding: 0;
		border: none;
		background: none;
		color: #8b909a;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.link:hover {
		color: #e6e4df;
	}

	.feedback {
		font-size: 14px;
	}

	.ok {
		color: #5fd08a;
	}

	.bad,
	.error {
		color: #f0656b;
	}

	.shown {
		color: #f2c94c;
	}

	.answer {
		margin: 0;
		color: #8b909a;
	}

	.explanation {
		padding: 14px 16px;
		border-left: 2px solid #3a3a3a;
		background: #1e1e1e;
		border-radius: 0 8px 8px 0;
		font-size: 15.5px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
