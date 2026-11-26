/**
 * Lessons: a topic split into ordered sections. Each section has explanation
 * text (markdown + LaTeX), an optional scene shown next to it, and an optional
 * quiz shown after the text. A section can also be quiz-only.
 *
 * A lesson is a folder in `src/lessons/` whose `lesson.ts` default-exports
 * `defineLesson({...})`. See `src/lessons/README.md`.
 */
import type { AnyScene } from '#engine';
import { defineQuestion, type Question, type QuestionDefinition } from './quiz/questions';

export interface SectionDefinition {
	/** Section heading, e.g. `'Vector addition and subtraction'`. */
	title: string;
	/** Explanation in markdown, usually `import text from './2-addition.md?raw'`. Optional for quiz-only sections. */
	text?: string;
	/** Diagram shown next to the text. Omit for text-only sections. */
	scene?: AnyScene;
	/** Questions shown after the text, one at a time. */
	quiz?: QuestionDefinition[];
}

export interface LessonDefinition {
	/** The lesson's topic, e.g. `'Introduction to vectors'`. */
	title: string;
	sections: SectionDefinition[];
}

export interface Section {
	/** 1-based position in the lesson. */
	readonly number: number;
	readonly title: string;
	/** Markdown; empty for quiz-only sections. */
	readonly text: string;
	readonly scene: AnyScene | null;
	readonly quiz: readonly Question[];
}

export interface Lesson {
	readonly title: string;
	readonly sections: readonly Section[];
}

const isScene = (x: unknown): x is AnyScene =>
	typeof x === 'object' && x !== null && 'definition' in x && 'viewport' in x;

/** Validate and normalise a lesson. Use as `export default defineLesson({...})`. */
export function defineLesson(def: LessonDefinition): Lesson {
	if (typeof def?.title !== 'string' || !def.title.trim()) {
		throw new Error('defineLesson: `title` must be a non-empty string');
	}
	const where = `lesson "${def.title}"`;
	if (!Array.isArray(def.sections) || def.sections.length === 0) {
		throw new Error(`${where}: \`sections\` must be a non-empty array`);
	}

	const ids = new Set<string>();
	const sections = def.sections.map((s, i): Section => {
		const number = i + 1;
		if (typeof s?.title !== 'string' || !s.title.trim()) {
			throw new Error(`${where}, section ${number}: \`title\` must be a non-empty string`);
		}
		const at = `${where}, section ${number} ("${s.title}")`;
		if (s.text !== undefined && typeof s.text !== 'string') {
			throw new Error(`${at}: \`text\` must be markdown (did the .md import work?)`);
		}
		if (s.quiz !== undefined && !Array.isArray(s.quiz)) throw new Error(`${at}: \`quiz\` must be an array of questions`);
		const text = s.text?.trim() ? s.text : '';
		if (!text && !s.quiz?.length) throw new Error(`${at}: needs \`text\`, a \`quiz\`, or both`);
		if (s.scene !== undefined && !isScene(s.scene)) {
			throw new Error(`${at}: \`scene\` must be the default export of a *.scene.ts file`);
		}

		const quiz = (s.quiz ?? []).map((q, j) => {
			const question = defineQuestion(q, `${at}, question ${j + 1}`, `s${number}-q${j + 1}`);
			if (ids.has(question.id)) throw new Error(`${at}, question ${j + 1}: duplicate question id "${question.id}"`);
			ids.add(question.id);
			return question;
		});

		return { number, title: s.title, text, scene: s.scene ?? null, quiz };
	});
	return { title: def.title, sections };
}

export const isLesson = (x: unknown): x is Lesson =>
	typeof x === 'object' && x !== null && typeof (x as Lesson).title === 'string' && Array.isArray((x as Lesson).sections);

/** All questions of a lesson, in order, with the section they belong to. */
export function lessonQuestions(lesson: Lesson): { section: Section; question: Question }[] {
	return lesson.sections.flatMap((section) => section.quiz.map((question) => ({ section, question })));
}
