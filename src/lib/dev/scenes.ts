/**
 * Discovers every scene file under `src/lessons/` for the /dev page.
 *
 * Modules are loaded lazily and individually, so one broken lesson file
 * (syntax error, bad `defineScene` call) only breaks itself, not the page.
 */
import type { Scene } from '#engine';

const modules = import.meta.glob<{ default?: unknown }>(['/src/lessons/**/*.ts', '!**/*.test.ts']);
const sources = import.meta.glob<string>(['/src/lessons/**/*.ts', '!**/*.test.ts'], {
	query: '?raw',
	import: 'default'
});

const PREFIX = '/src/lessons/';

/** Scene ids are paths relative to `src/lessons`, without extension: `examples/spring-mass`. */
const toId = (file: string) => file.slice(PREFIX.length).replace(/\.ts$/, '');
const toFile = (id: string) => `${PREFIX}${id}.ts`;

export const sceneIds: readonly string[] = Object.keys(modules).map(toId).sort();

export interface LoadedScene {
	id: string;
	source: string;
	scene: Scene | null;
	error: unknown;
}

const isScene = (x: unknown): x is Scene =>
	typeof x === 'object' && x !== null && 'definition' in x && 'viewport' in x;

export async function loadScene(id: string): Promise<LoadedScene> {
	const file = toFile(id);
	const load = modules[file];
	if (!load) return { id, source: '', scene: null, error: new Error(`No scene file ${file}`) };
	const source = await sources[file]();
	try {
		const mod = await load();
		if (!isScene(mod.default)) {
			throw new Error(`${file} must \`export default defineScene({...})\``);
		}
		return { id, source, scene: mod.default, error: null };
	} catch (error) {
		return { id, source, scene: null, error };
	}
}
