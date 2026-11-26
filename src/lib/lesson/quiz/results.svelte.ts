/**
 * Quiz results for the current browser session (in memory; lost on reload).
 *
 * Provided through Svelte context from the root layout rather than as a
 * module-level singleton: on the server, module state is shared between all
 * requests, which must never happen with learner data.
 */
import { createContext } from 'svelte';
import type { QuizResponse } from './questions';

export interface Attempt {
	readonly response: QuizResponse;
	readonly correct: boolean;
	/** Unix time in ms. */
	readonly at: number;
}

export interface QuestionRecord {
	readonly attempts: readonly Attempt[];
	/** The learner asked to see the answer. */
	readonly revealed: boolean;
}

export type QuestionStatus = 'unanswered' | 'incorrect' | 'correct' | 'revealed';

export function statusOf(record: QuestionRecord | undefined): QuestionStatus {
	if (!record || (record.attempts.length === 0 && !record.revealed)) return 'unanswered';
	if (record.attempts.some((a) => a.correct)) return 'correct';
	return record.revealed ? 'revealed' : 'incorrect';
}

/** Results keyed by lesson id, then question id. Records are replaced, never mutated. */
export class QuizResults {
	#lessons = $state.raw<Record<string, Record<string, QuestionRecord>>>({});

	forLesson(lessonId: string): Readonly<Record<string, QuestionRecord>> {
		return this.#lessons[lessonId] ?? {};
	}

	get(lessonId: string, questionId: string): QuestionRecord | undefined {
		return this.#lessons[lessonId]?.[questionId];
	}

	record(lessonId: string, questionId: string, attempt: Attempt): void {
		const prev = this.get(lessonId, questionId);
		this.#set(lessonId, questionId, { attempts: [...(prev?.attempts ?? []), attempt], revealed: prev?.revealed ?? false });
	}

	reveal(lessonId: string, questionId: string): void {
		const prev = this.get(lessonId, questionId);
		this.#set(lessonId, questionId, { attempts: prev?.attempts ?? [], revealed: true });
	}

	clear(lessonId: string): void {
		const { [lessonId]: _, ...rest } = this.#lessons;
		this.#lessons = rest;
	}

	#set(lessonId: string, questionId: string, record: QuestionRecord) {
		this.#lessons = { ...this.#lessons, [lessonId]: { ...this.#lessons[lessonId], [questionId]: record } };
	}
}

export const [getQuizResults, setQuizResults] = createContext<QuizResults>();
