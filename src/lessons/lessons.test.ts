/**
 * Checks every lesson folder in src/lessons/. Scenes themselves are smoke
 * tested in src/scenes.test.ts; this checks the lesson structure around them.
 * A generated lesson must pass these before it is shown to a learner.
 */
import { describe, expect, it } from 'vitest';
import { isLesson } from '#lesson';
import { renderMarkdown } from '#lib/lesson/markdown.ts';

const manifests = import.meta.glob<{ default: unknown }>('./*/lesson.ts', { eager: true });
const texts = import.meta.glob<string>('./*/*.md', { eager: true, query: '?raw', import: 'default' });
const scenes = import.meta.glob<{ default: unknown }>('./*/*.scene.ts', { eager: true });
const folderOf = (file: string) => file.split('/')[1];

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
				for (const s of lesson.sections) expect(renderMarkdown(s.text).length, s.title).toBeGreaterThan(0);
			});

			it('uses every .md file in its folder (nothing forgotten)', () => {
				const used = new Set(lesson.sections.map((s) => s.text));
				for (const [md, text] of Object.entries(texts)) {
					if (folderOf(md) === folder) expect(used.has(text), `${md} is not used by any section`).toBe(true);
				}
			});

			it('uses every .scene.ts file in its folder (nothing forgotten)', () => {
				const used = new Set(lesson.sections.map((s) => s.scene));
				for (const [sceneFile, sceneMod] of Object.entries(scenes)) {
					if (folderOf(sceneFile) === folder) {
						expect(used.has(sceneMod.default as never), `${sceneFile} is not used by any section`).toBe(true);
					}
				}
			});
		});
	}
});
