import { describe, expect, it } from 'vitest';
import { defineScene, type Vec2 } from '#engine';
import { defineLesson } from '../lesson';
import { defineQuestion, describeAnswer, grade, parseNumber, type QuestionDefinition } from './questions';
import { buildQuizReport } from './report';
import { QuizResults, statusOf } from './results.svelte';

const scene = defineScene({
	state: { p: [1, 1] as Vec2 },
	checks: { left: (s) => s.p[0] < 0, up: (s) => s.p[1] > 0 },
	draw: () => null
});
const oneCheckScene = defineScene({ state: { x: 0 }, checks: { positive: (s) => s.x > 0 }, draw: () => null });

const q = (def: QuestionDefinition) => defineQuestion(def, 'test', 'q');

describe('defineQuestion', () => {
	it('normalises choice answers', () => {
		const single = q({ type: 'choice', prompt: 'p', options: ['a', 'b', 'c'], answer: 1 });
		const multi = q({ type: 'choice', prompt: 'p', options: ['a', 'b', 'c'], answer: [2, 0] });
		expect(single).toMatchObject({ answer: [1], multiple: false });
		expect(multi).toMatchObject({ answer: [0, 2], multiple: true });
	});

	it('defaults the number tolerance and the scene check', () => {
		expect(q({ type: 'number', prompt: 'p', answer: 3 })).toMatchObject({ tolerance: 0.01 });
		expect(q({ type: 'scene', prompt: 'p', scene: oneCheckScene })).toMatchObject({ check: 'positive' });
	});

	it('explains invalid questions', () => {
		expect(() => q({ type: 'choice', prompt: 'p', options: ['a'], answer: 0 })).toThrow(/at least 2/);
		expect(() => q({ type: 'number', prompt: 'p', answer: NaN })).toThrow(/finite/);
		expect(() => q({ type: 'scene', prompt: 'p', scene })).toThrow(/name the scene check .* \(scene checks: left, up\)/);
		expect(() => q({ type: 'scene', prompt: 'p', scene, check: 'down' })).toThrow(/no check "down"/);
		expect(() => q({ type: 'essay', prompt: 'p' } as never)).toThrow(/unknown question type "essay"/);
		expect(() => q({ type: 'number', prompt: ' ', answer: 1 })).toThrow(/`prompt`/);
	});
});

describe('grading', () => {
	it('grades single and multiple choice', () => {
		const single = q({ type: 'choice', prompt: 'p', options: ['a', 'b', 'c'], answer: 1 });
		expect(grade(single, { type: 'choice', selected: [1] })).toEqual({ correct: true });
		expect(grade(single, { type: 'choice', selected: [0] })).toEqual({ correct: false });
		expect(grade(single, { type: 'choice', selected: [] }).error).toMatch(/Select an option/);

		const multi = q({ type: 'choice', prompt: 'p', options: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], answer: [10, 2] });
		expect(grade(multi, { type: 'choice', selected: [2, 10] })).toEqual({ correct: true });
		expect(grade(multi, { type: 'choice', selected: [2] })).toEqual({ correct: false });
	});

	it('grades numbers within tolerance and rejects junk input', () => {
		const n = q({ type: 'number', prompt: 'p', answer: Math.sqrt(13), tolerance: 0.01 });
		expect(grade(n, { type: 'number', input: '3.61' })).toEqual({ correct: true });
		expect(grade(n, { type: 'number', input: '3.5' })).toEqual({ correct: false });
		expect(grade(n, { type: 'number', input: 'about 3' }).error).toMatch(/Enter a number/);
	});

	it('grades scene answers with the named check', () => {
		const s = q({ type: 'scene', prompt: 'p', scene, check: 'left' });
		expect(grade(s, { type: 'scene', state: { p: [-1, 0] } })).toEqual({ correct: true });
		expect(grade(s, { type: 'scene', state: { p: [1, 0] } })).toEqual({ correct: false });
	});

	it('parses typed numbers', () => {
		expect(parseNumber('3.6')).toBe(3.6);
		expect(parseNumber(' -2 ')).toBe(-2);
		expect(parseNumber('−2')).toBe(-2);
		expect(parseNumber('3,5')).toBe(3.5);
		expect(parseNumber('1/2')).toBe(0.5);
		expect(parseNumber('-3/4')).toBe(-0.75);
		expect(parseNumber('1e3')).toBe(1000);
		expect(parseNumber('.5')).toBe(0.5);
		for (const bad of ['', 'abc', '1/0', '2x', '1,000,000', 'Infinity']) expect(parseNumber(bad), bad).toBeNull();
	});

	it('describes answers for reveals and reports', () => {
		expect(describeAnswer(q({ type: 'number', prompt: 'p', answer: 1 / 3, unit: 'm' }))).toBe('0.333333 m');
		expect(describeAnswer(q({ type: 'choice', prompt: 'p', options: ['a', 'b', 'c'], answer: [0, 2] }))).toBe('a, c');
	});
});

describe('results and report', () => {
	const lesson = defineLesson({
		title: 'L',
		sections: [
			{
				title: 'S1',
				text: 't',
				quiz: [
					{ type: 'number', prompt: 'n?', answer: 10 },
					{ type: 'choice', prompt: 'c?', options: ['x', 'y'], answer: 1 }
				]
			},
			{ title: 'S2', quiz: [{ type: 'scene', prompt: 's?', scene, check: 'up', id: 'drag' }] }
		]
	});

	it('tracks status per question', () => {
		const r = new QuizResults();
		expect(statusOf(r.get('l', 's1-q1'))).toBe('unanswered');
		r.record('l', 's1-q1', { response: { type: 'number', input: '12' }, correct: false, at: 1 });
		expect(statusOf(r.get('l', 's1-q1'))).toBe('incorrect');
		r.record('l', 's1-q1', { response: { type: 'number', input: '10' }, correct: true, at: 2 });
		expect(statusOf(r.get('l', 's1-q1'))).toBe('correct');
		r.reveal('l', 's1-q2');
		expect(statusOf(r.get('l', 's1-q2'))).toBe('revealed');
		r.clear('l');
		expect(r.forLesson('l')).toEqual({});
	});

	it('builds an LLM-ready report', () => {
		const r = new QuizResults();
		r.record('l', 's1-q1', { response: { type: 'number', input: '12' }, correct: false, at: 1 });
		r.record('l', 's1-q1', { response: { type: 'number', input: '10' }, correct: true, at: 2 });
		r.record('l', 's1-q2', { response: { type: 'choice', selected: [1] }, correct: true, at: 3 });
		r.record('l', 'drag', { response: { type: 'scene', state: { p: [1, -1] } }, correct: false, at: 4 });

		const report = buildQuizReport(lesson, r.forLesson('l'));
		expect(report.summary).toEqual({ questions: 3, answered: 3, correct: 2, firstTry: 1, revealed: 0 });
		expect(report.questions[0]).toEqual({
			id: 's1-q1',
			section: 'S1',
			type: 'number',
			prompt: 'n?',
			expected: '10',
			status: 'correct',
			attempts: [
				{ answer: '12', correct: false },
				{ answer: '10', correct: true }
			]
		});
		expect(report.questions[1].attempts).toEqual([{ answer: 'y', correct: true }]);
		expect(report.questions[2]).toMatchObject({ section: 'S2', status: 'incorrect', attempts: [{ answer: '{"p":[1,-1]}', correct: false }] });
		expect(JSON.parse(JSON.stringify(report))).toEqual(report);
	});
});
