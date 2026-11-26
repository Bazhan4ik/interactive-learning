import { describe, expect, it } from 'vitest';
import { lessonIds, loadLesson } from './registry';

describe('lesson registry', () => {
	it('finds lesson folders', () => {
		expect(lessonIds).toContain('intro-to-vectors');
	});

	it('loads a lesson', async () => {
		const loaded = await loadLesson('intro-to-vectors');
		expect(loaded.error).toBeNull();
		expect(loaded.lesson?.sections.length).toBeGreaterThan(0);
	});

	it('reports unknown ids instead of throwing', async () => {
		expect((await loadLesson('nope')).error).toBeInstanceOf(Error);
	});
});
