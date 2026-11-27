import { describe, expect, it } from 'vitest';
import { lessonIds, loadLesson } from './registry';

describe('lesson registry', () => {
	it('finds example lessons under examples/', () => {
		expect(lessonIds).toContain('examples/intro-to-vectors');
	});

	it('lists generated lessons before examples', () => {
		const firstExample = lessonIds.findIndex((id) => id.startsWith('examples/'));
		expect(lessonIds.slice(firstExample).every((id) => id.startsWith('examples/'))).toBe(true);
	});

	it('loads a lesson', async () => {
		const loaded = await loadLesson('examples/intro-to-vectors');
		expect(loaded.error).toBeNull();
		expect(loaded.lesson?.sections.length).toBeGreaterThan(0);
	});

	it('reports unknown ids instead of throwing', async () => {
		expect((await loadLesson('nope')).error).toBeInstanceOf(Error);
		// an example's folder name alone is not its id
		expect((await loadLesson('intro-to-vectors')).error).toBeInstanceOf(Error);
	});
});
