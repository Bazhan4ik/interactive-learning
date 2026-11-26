/**
 * Quiz report: a plain-JSON summary of how a learner did on a lesson's
 * quizzes, meant to be sent to the LLM (e.g. to adapt the next lesson).
 */
import { lessonQuestions, type Lesson } from '../lesson';
import { describeAnswer, describeResponse } from './questions';
import { statusOf, type QuestionRecord, type QuestionStatus } from './results.svelte';

export interface QuestionReport {
	id: string;
	section: string;
	type: 'choice' | 'number' | 'scene';
	prompt: string;
	expected: string;
	status: QuestionStatus;
	/** Every submission in order, e.g. `[{ answer: "12", correct: false }, { answer: "10", correct: true }]`. */
	attempts: { answer: string; correct: boolean }[];
}

export interface QuizReport {
	lesson: string;
	summary: {
		questions: number;
		answered: number;
		/** Solved, on any attempt, without revealing the answer. */
		correct: number;
		/** Solved on the first attempt. */
		firstTry: number;
		revealed: number;
	};
	questions: QuestionReport[];
}

export function buildQuizReport(lesson: Lesson, records: Readonly<Record<string, QuestionRecord>>): QuizReport {
	const questions = lessonQuestions(lesson).map(({ section, question }): QuestionReport => {
		const record = records[question.id];
		return {
			id: question.id,
			section: section.title,
			type: question.type,
			prompt: question.prompt,
			expected: describeAnswer(question),
			status: statusOf(record),
			attempts: (record?.attempts ?? []).map((a) => ({ answer: describeResponse(question, a.response), correct: a.correct }))
		};
	});
	return {
		lesson: lesson.title,
		summary: {
			questions: questions.length,
			answered: questions.filter((q) => q.status !== 'unanswered').length,
			correct: questions.filter((q) => q.status === 'correct').length,
			firstTry: questions.filter((q) => q.attempts[0]?.correct).length,
			revealed: questions.filter((q) => q.status === 'revealed').length
		},
		questions
	};
}
