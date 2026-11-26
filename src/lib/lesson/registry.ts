/**
 * Discovers lessons: every `src/lessons/<id>/lesson.ts`.
 *
 * Lessons load lazily and independently, so a broken (e.g. badly generated)
 * lesson only breaks itself and reports why.
 */
import { isLesson, type Lesson } from './lesson';

const manifests = import.meta.glob<{ default?: unknown }>('/src/lessons/*/lesson.ts');

const idOf = (file: string) => file.split('/')[3];

export const lessonIds: readonly string[] = Object.keys(manifests).map(idOf).sort();

export type LoadedLesson =
	| { id: string; lesson: Lesson; error: null }
	| { id: string; lesson: null; error: unknown };

export async function loadLesson(id: string): Promise<LoadedLesson> {
	const file = `/src/lessons/${id}/lesson.ts`;
	const load = manifests[file];
	if (!load) return { id, lesson: null, error: new Error(`No lesson at ${file}`) };
	try {
		const mod = await load();
		if (!isLesson(mod.default)) throw new Error(`${file} must \`export default defineLesson({...})\``);
		return { id, lesson: mod.default, error: null };
	} catch (error) {
		return { id, lesson: null, error };
	}
}
