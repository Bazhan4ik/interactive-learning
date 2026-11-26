/**
 * Resolves `?lesson=<id>&section=<n>` to a lesson and a section number.
 * Universal load: lessons contain functions (scenes), so this runs on the
 * server for SSR and again in the browser instead of being serialised.
 */
import { clamp } from '#engine';
import { lessonIds, loadLesson } from '#lib/lesson/registry.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const all = await Promise.all(lessonIds.map(loadLesson));
	const id = url.searchParams.get('lesson') ?? lessonIds[0] ?? null;
	const current = all.find((l) => l.id === id) ?? null;

	const count = current?.lesson?.sections.length ?? 1;
	const requested = Number.parseInt(url.searchParams.get('section') ?? '1', 10);
	const section = clamp(Number.isNaN(requested) ? 1 : requested, 1, count);

	return {
		lessons: all.map((l) => ({ id: l.id, title: l.lesson?.title ?? `${l.id} (failed to load)` })),
		id,
		current,
		section
	};
};
