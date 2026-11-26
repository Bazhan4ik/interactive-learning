/**
 * Quiz questions: definitions (what authors write), normalisation/validation,
 * and pure grading. No UI here.
 *
 * Three types:
 *  - `choice` — pick one option (`answer: 2`) or several (`answer: [0, 2]`)
 *  - `number` — type a number, accepted within `tolerance`
 *  - `scene`  — answer by interacting with a diagram; graded by one of the
 *               scene's `checks`
 *
 * Every question may show a `scene` next to it (for `scene` questions it's
 * required, since it's where the answer is given).
 */
import type { AnyScene, SceneState } from '#engine';

interface QuestionDefinitionBase {
	/** Stable id for results tracking. Default: `s<section>-q<n>`. */
	id?: string;
	/** The question, in markdown + LaTeX. */
	prompt: string;
	/** Shown once the question is solved or the answer is revealed (markdown + LaTeX). */
	explanation?: string;
}

export interface ChoiceQuestionDefinition extends QuestionDefinitionBase {
	type: 'choice';
	/** Options in inline markdown + LaTeX, shown in this order. */
	options: string[];
	/** Index of the correct option, or indices if several must be selected. */
	answer: number | number[];
	/** Diagram to show while answering (optional). */
	scene?: AnyScene;
}

export interface NumberQuestionDefinition extends QuestionDefinitionBase {
	type: 'number';
	answer: number;
	/** Accepted absolute error. Default 0.01 — say in the prompt how to round. */
	tolerance?: number;
	/** Shown after the input, e.g. `'°'` or `'m/s'`. */
	unit?: string;
	scene?: AnyScene;
}

export interface SceneQuestionDefinition extends QuestionDefinitionBase {
	type: 'scene';
	/** The diagram the learner answers in. */
	scene: AnyScene;
	/** Name of the scene check that decides correctness. Optional if the scene has exactly one check. */
	check?: string;
}

export type QuestionDefinition = ChoiceQuestionDefinition | NumberQuestionDefinition | SceneQuestionDefinition;

interface QuestionBase {
	readonly id: string;
	readonly prompt: string;
	readonly explanation: string | null;
	readonly scene: AnyScene | null;
}

export interface ChoiceQuestion extends QuestionBase {
	readonly type: 'choice';
	readonly options: readonly string[];
	readonly answer: readonly number[];
	/** True when more than one option is correct (checkboxes instead of radios). */
	readonly multiple: boolean;
}

export interface NumberQuestion extends QuestionBase {
	readonly type: 'number';
	readonly answer: number;
	readonly tolerance: number;
	readonly unit: string | null;
}

export interface SceneQuestion extends QuestionBase {
	readonly type: 'scene';
	readonly scene: AnyScene;
	readonly check: string;
}

export type Question = ChoiceQuestion | NumberQuestion | SceneQuestion;

const isScene = (x: unknown): x is AnyScene =>
	typeof x === 'object' && x !== null && 'definition' in x && 'viewport' in x;

const DEFAULT_TOLERANCE = 0.01;

const sortedUnique = (xs: readonly number[]) => [...new Set(xs)].sort((a, b) => a - b);

/** Validate a question definition. `where` prefixes error messages. */
export function defineQuestion(def: QuestionDefinition, where: string, defaultId: string): Question {
	const fail = (msg: string): never => {
		throw new Error(`${where}: ${msg}`);
	};
	if (typeof def?.prompt !== 'string' || !def.prompt.trim()) fail('`prompt` must be non-empty markdown');
	if (def.explanation !== undefined && typeof def.explanation !== 'string') fail('`explanation` must be a string');
	if (def.scene !== undefined && !isScene(def.scene)) fail('`scene` must be the default export of a *.scene.ts file');
	const base = {
		id: def.id ?? defaultId,
		prompt: def.prompt,
		explanation: def.explanation ?? null,
		scene: def.scene ?? null
	};

	switch (def.type) {
		case 'choice': {
			if (!Array.isArray(def.options) || def.options.length < 2) fail('`options` needs at least 2 entries');
			const answer = Array.isArray(def.answer) ? def.answer : [def.answer];
			if (answer.length === 0) fail('`answer` must name at least one option');
			for (const a of answer) {
				if (!Number.isInteger(a) || a < 0 || a >= def.options.length) {
					fail(`\`answer\` ${a} is not an option index (0–${def.options.length - 1})`);
				}
			}
			return { ...base, type: 'choice', options: def.options, answer: sortedUnique(answer), multiple: Array.isArray(def.answer) };
		}
		case 'number': {
			if (!Number.isFinite(def.answer)) fail('`answer` must be a finite number');
			const tolerance = def.tolerance ?? DEFAULT_TOLERANCE;
			if (!(tolerance >= 0)) fail('`tolerance` must be >= 0');
			return { ...base, type: 'number', answer: def.answer, tolerance, unit: def.unit ?? null };
		}
		case 'scene': {
			if (!isScene(def.scene)) return fail('`scene` is required for scene questions');
			const checks = Object.keys(def.scene.definition.checks ?? {});
			const check = def.check ?? (checks.length === 1 ? checks[0] : undefined);
			if (check === undefined) {
				return fail(`name the scene check that grades the answer with \`check\` (scene checks: ${checks.join(', ') || 'none'})`);
			}
			if (!checks.includes(check)) fail(`the scene has no check "${check}" (scene checks: ${checks.join(', ') || 'none'})`);
			return { ...base, type: 'scene', scene: def.scene, check };
		}
		default:
			return fail(`unknown question type "${(def as { type: unknown }).type}" (use 'choice', 'number' or 'scene')`);
	}
}

/** What the learner submitted. Plain JSON so it can be stored and reported. */
export type QuizResponse =
	| { type: 'choice'; selected: number[] }
	| { type: 'number'; input: string }
	| { type: 'scene'; state: SceneState };

export type Grade = { correct: boolean; error?: undefined } | { correct?: undefined; error: string };

/** Parse a typed number: `3.6`, `-2`, `1e3`, `3,6`, `1/2`, `-3/4`. */
export function parseNumber(input: string): number | null {
	const s = input.trim().replace(/\s+/g, '').replace('−', '-');
	if (!s) return null;
	const frac = /^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/.exec(s);
	if (frac) {
		const d = Number(frac[2]);
		return d === 0 ? null : Number(frac[1]) / d;
	}
	const normalised = /^-?\d+,\d+$/.test(s) ? s.replace(',', '.') : s;
	const n = Number(normalised);
	return /^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(normalised) && Number.isFinite(n) ? n : null;
}

export function grade(q: Question, r: QuizResponse): Grade {
	if (q.type !== r.type) return { error: `expected a ${q.type} answer` };
	switch (q.type) {
		case 'choice': {
			const selected = sortedUnique((r as Extract<QuizResponse, { type: 'choice' }>).selected);
			if (selected.length === 0) return { error: q.multiple ? 'Select at least one option.' : 'Select an option.' };
			return { correct: selected.length === q.answer.length && selected.every((s, i) => s === q.answer[i]) };
		}
		case 'number': {
			const value = parseNumber((r as Extract<QuizResponse, { type: 'number' }>).input);
			if (value === null) return { error: 'Enter a number, like 3.6, -2 or 1/2.' };
			return { correct: Math.abs(value - q.answer) <= q.tolerance + 1e-12 };
		}
		case 'scene': {
			const state = (r as Extract<QuizResponse, { type: 'scene' }>).state;
			const check = q.scene.definition.checks?.[q.check];
			return { correct: Boolean(check?.(state)) };
		}
	}
}

/** Human-readable correct answer (markdown), for reveals and reports. */
export function describeAnswer(q: Question): string {
	switch (q.type) {
		case 'choice':
			return q.answer.map((i) => q.options[i]).join(', ');
		case 'number': {
			const v = String(Number(q.answer.toPrecision(6)));
			return `${v}${q.unit ? ` ${q.unit}` : ''}`;
		}
		case 'scene':
			return `the diagram satisfies the check "${q.check}"`;
	}
}

/** Human-readable learner response, for reports. */
export function describeResponse(q: Question, r: QuizResponse): string {
	switch (r.type) {
		case 'choice':
			return q.type === 'choice' ? r.selected.map((i) => q.options[i]).join(', ') : JSON.stringify(r.selected);
		case 'number':
			return r.input;
		case 'scene':
			return JSON.stringify(r.state);
	}
}
