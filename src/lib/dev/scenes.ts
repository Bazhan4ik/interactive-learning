/**
 * Discovers every scene file (`*.scene.ts`) for the /dev page: engine examples
 * in `src/examples/` and lesson scenes in `src/lessons/`.
 *
 * Modules are loaded lazily and individually, so one broken scene file
 * (syntax error, bad `defineScene` call) only breaks itself, not the page.
 */
import type { AnyScene } from '#engine';

// import.meta.glob only accepts inline literals, so the patterns are repeated.
const modules = import.meta.glob<{ default?: unknown }>(['/src/examples/**/*.scene.ts', '/src/lessons/**/*.scene.ts']);
const sources = import.meta.glob<string>(['/src/examples/**/*.scene.ts', '/src/lessons/**/*.scene.ts'], {
	query: '?raw',
	import: 'default'
});

/** Scene ids are paths relative to `src/` without the suffix: `examples/spring-mass`. */
const toId = (file: string) => file.replace(/^\/src\//, '').replace(/\.scene\.ts$/, '');
const toFile = (id: string) => `/src/${id}.scene.ts`;

export const sceneIds: readonly string[] = Object.keys(modules).map(toId).sort();

export interface LoadedScene {
	id: string;
	file: string;
	source: string;
	scene: AnyScene | null;
	error: unknown;
}

const isScene = (x: unknown): x is AnyScene =>
	typeof x === 'object' && x !== null && 'definition' in x && 'viewport' in x;

export async function loadScene(id: string): Promise<LoadedScene> {
	const file = toFile(id);
	const load = modules[file];
	if (!load) return { id, file, source: '', scene: null, error: new Error(`No scene file ${file}`) };
	const source = await sources[file]();
	try {
		const mod = await load();
		if (!isScene(mod.default)) throw new Error(`${file} must \`export default defineScene({...})\``);
		return { id, file, source, scene: mod.default, error: null };
	} catch (error) {
		return { id, file, source, scene: null, error };
	}
}
