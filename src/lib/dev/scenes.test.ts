import { describe, expect, it } from 'vitest';
import { loadScene, sceneIds } from './scenes';

describe('dev scene registry', () => {
	it('finds example scenes and example lesson scenes', () => {
		expect(sceneIds).toContain('examples/shapes');
		expect(sceneIds.some((id) => id.startsWith('examples/lessons/'))).toBe(true);
	});

	it('loads a scene with its source', async () => {
		const loaded = await loadScene('examples/shapes');
		expect(loaded.error).toBeNull();
		expect(loaded.scene).not.toBeNull();
		expect(loaded.source).toContain('defineScene');
		expect(loaded.file).toBe('/src/examples/shapes.scene.ts');
	});

	it('reports unknown ids instead of throwing', async () => {
		expect((await loadScene('nope')).error).toBeInstanceOf(Error);
	});
});
