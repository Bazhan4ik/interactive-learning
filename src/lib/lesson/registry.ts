/**
 * Discovers lessons:
 *  - generated lessons, `src/lessons/<id>/lesson.ts` (git-ignored, local only)
 *  - example lessons, `src/examples/lessons/<name>/lesson.ts` (in the
 *    repository), with id `examples/<name>` so they never clash with a
 *    generated lesson of the same name.
 *
 * Lessons load lazily and independently, so a broken (e.g. badly generated)
 * lesson only breaks itself and reports why.
 */
import { isLesson, type Lesson } from './lesson';

type Manifest = { default?: unknown };

const generated = import.meta.glob<Manifest>('/src/lessons/*/lesson.ts');
const examples = import.meta.glob<Manifest>('/src/examples/lessons/*/lesson.ts');

/** `.../<folder>/lesson.ts` → `<folder>` */
const folderOf = (file: string) => file.split('/').at(-2) ?? file;

const sources = new Map<string, { file: string; load: () => Promise<Manifest> }>([
	...Object.entries(generated).map(([file, load]) => [folderOf(file), { file, load }] as const),
	...Object.entries(examples).map(([file, load]) => [`examples/${folderOf(file)}`, { file, load }] as const)
]);

/** Generated lessons first, then examples; each alphabetical. */
export const lessonIds: readonly string[] = [
	...Object.keys(generated).map(folderOf).sort(),
	...Object.keys(examples).map((file) => `examples/${folderOf(file)}`).sort()
];

export type LoadedLesson =
	| { id: string; lesson: Lesson; error: null }
	| { id: string; lesson: null; error: unknown };

export async function loadLesson(id: string): Promise<LoadedLesson> {
	const source = sources.get(id);
	if (!source) {
		const error = new Error(
			`No lesson "${id}": generated lessons are src/lessons/<id>/lesson.ts, ` +
				`example lessons are src/examples/lessons/<name>/lesson.ts with id "examples/<name>"`
		);
		return { id, lesson: null, error };
	}
	try {
		const mod = await source.load();
		if (!isLesson(mod.default)) throw new Error(`${source.file} must \`export default defineLesson({...})\``);
		return { id, lesson: mod.default, error: null };
	} catch (error) {
		return { id, lesson: null, error };
	}
}
