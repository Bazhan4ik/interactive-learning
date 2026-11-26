/**
 * Lessons: a topic split into ordered sections. Each section is explanation
 * text (markdown) plus an optional scene shown next to it.
 *
 * A lesson is a folder in `src/lessons/` whose `lesson.ts` default-exports
 * `defineLesson({...})`. See `src/lessons/README.md`.
 */
import type { AnyScene } from '#engine';

export interface SectionDefinition {
	/** Section heading, e.g. `'Vector addition and subtraction'`. */
	title: string;
	/** Explanation in markdown, usually `import text from './2-addition.md?raw'`. */
	text: string;
	/** Diagram shown next to the text. Omit for text-only sections. */
	scene?: AnyScene;
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
	readonly text: string;
	readonly scene: AnyScene | null;
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
	const sections = def.sections.map((s, i): Section => {
		const at = `${where}, section ${i + 1}`;
		if (typeof s?.title !== 'string' || !s.title.trim()) throw new Error(`${at}: \`title\` must be a non-empty string`);
		if (typeof s.text !== 'string' || !s.text.trim()) {
			throw new Error(`${at} ("${s.title}"): \`text\` must be non-empty markdown (did the .md import work?)`);
		}
		if (s.scene !== undefined && !isScene(s.scene)) {
			throw new Error(`${at} ("${s.title}"): \`scene\` must be the default export of a *.scene.ts file`);
		}
		return { number: i + 1, title: s.title, text: s.text, scene: s.scene ?? null };
	});
	return { title: def.title, sections };
}

export const isLesson = (x: unknown): x is Lesson =>
	typeof x === 'object' && x !== null && typeof (x as Lesson).title === 'string' && Array.isArray((x as Lesson).sections);
