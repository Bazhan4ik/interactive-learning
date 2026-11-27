/**
 * Checks every lesson folder: generated lessons in src/lessons/ and example
 * lessons in src/examples/lessons/. Scenes themselves are smoke tested in
 * src/scenes.test.ts; this checks the lesson structure around them.
 * A generated lesson must pass these before it is shown to a learner.
 */
import { describe, expect, it } from 'vitest';
import { isLesson, lessonQuestions } from '#lesson';
import { findMathErrors, renderMarkdown } from '#lib/lesson/markdown.ts';

// import.meta.glob only accepts inline literals, so the patterns are repeated.
const manifests = import.meta.glob<{ default: unknown }>(['./lessons/*/lesson.ts', './examples/lessons/*/lesson.ts'], {
	eager: true
});
const texts = import.meta.glob<string>(['./lessons/*/*.md', './examples/lessons/*/*.md'], {
	eager: true,
	query: '?raw',
	import: 'default'
});
const scenes = import.meta.glob<{ default: unknown }>(['./lessons/*/*.scene.ts', './examples/lessons/*/*.scene.ts'], {
	eager: true
});
/** `./lessons/<id>/lesson.ts` → `lessons/<id>` */
const folderOf = (file: string) => file.slice(2, file.lastIndexOf('/'));

describe('lessons', () => {
	it('found lessons', () => {
		expect(Object.keys(manifests).length).toBeGreaterThan(0);
	});

	for (const [file, mod] of Object.entries(manifests)) {
		const folder = folderOf(file);

		describe(folder, () => {
			it('lesson.ts default-exports defineLesson(...)', () => {
				expect(isLesson(mod.default)).toBe(true);
			});
			if (!isLesson(mod.default)) return;
			const lesson = mod.default;

			it('renders every section text', () => {
				for (const s of lesson.sections) if (s.text) expect(renderMarkdown(s.text).length, s.title).toBeGreaterThan(0);
			});

			it('has valid LaTeX in all text, prompts, options and explanations', () => {
				const strings = [
					...lesson.sections.map((s) => [`section "${s.title}"`, s.text] as const),
					...lessonQuestions(lesson).flatMap(({ question: q }) => [
						[`${q.id} prompt`, q.prompt] as const,
						[`${q.id} explanation`, q.explanation ?? ''] as const,
						...(q.type === 'choice' ? q.options.map((o, i) => [`${q.id} option ${i}`, o] as const) : [])
					])
				];
				for (const [where, text] of strings) expect(findMathErrors(text), where).toEqual([]);
			});

			it('uses every .md file in its folder (nothing forgotten)', () => {
				const used = new Set(lesson.sections.map((s) => s.text));
				for (const [md, text] of Object.entries(texts)) {
					if (folderOf(md) === folder) expect(used.has(text), `${md} is not used by any section`).toBe(true);
				}
			});

			it('uses every .scene.ts file in its folder (nothing forgotten)', () => {
				const used = new Set([
					...lesson.sections.map((s) => s.scene),
					...lessonQuestions(lesson).map(({ question }) => question.scene)
				]);
				for (const [sceneFile, sceneMod] of Object.entries(scenes)) {
					if (folderOf(sceneFile) === folder) {
						expect(used.has(sceneMod.default as never), `${sceneFile} is not used by any section`).toBe(true);
					}
				}
			});
		});
	}
});
