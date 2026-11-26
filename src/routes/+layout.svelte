<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { QuizResults, setQuizResults } from '#lib/lesson/quiz/results.svelte.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// One results store per browser session (per request on the server).
	setQuizResults(new QuizResults());
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
