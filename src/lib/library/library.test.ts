/**
 * Contract tests for every library object. Adding a new object file is
 * enough for it to be checked here — no test changes needed.
 */
import { describe, expect, it } from 'vitest';
import { defineScene, evaluateScene, isObjectFactory, renderExample, renderSvg, type Node } from '#engine';
import { catalog, describeLibrary } from './catalog';

const files = import.meta.glob<Record<string, unknown>>(['./*/*.ts', '!./**/*.test.ts'], { eager: true });

describe('library', () => {
	for (const [file, mod] of Object.entries(files)) {
		const folder = file.split('/')[1];
		const objects = Object.entries(mod).filter(([, v]) => isObjectFactory(v));

		describe(file, () => {
			it('defines at least one object', () => {
				expect(objects.length).toBeGreaterThan(0);
			});

			for (const [exportName, obj] of objects) {
				if (!isObjectFactory(obj)) continue;

				it(`${exportName}: is exported from #library`, () => {
					expect(catalog).toContain(obj);
				});

				it(`${exportName}: meta matches its export name and folder`, () => {
					expect(obj.meta.name).toBe(exportName);
					expect(obj.meta.category).toBe(folder);
					expect(obj.meta.description.length).toBeGreaterThan(10);
					expect(obj.meta.usage).toContain(`${exportName}(`);
				});

				it(`${exportName}: example renders`, () => {
					const scene = defineScene({ draw: () => renderExample(obj) });
					const frame = evaluateScene(scene);
					expect(frame.primitives.length).toBeGreaterThan(0);
					expect(renderSvg(frame)).not.toMatch(/NaN|undefined/);
				});

				it(`${exportName}: applies common node options`, () => {
					const node = (obj as (p: object) => Node)({
						...exampleParams(obj),
						id: 'custom',
						opacity: 0.5
					});
					expect(node.id).toBe('custom');
					expect(node.opacity).toBe(0.5);
				});
			}
		});
	}

	it('produces an LLM-readable description', () => {
		const md = describeLibrary();
		for (const obj of catalog) expect(md).toContain(`### ${obj.meta.name}`);
	});
});

/** Capture the params an example passes to its object, by calling it with a spy. */
function exampleParams(obj: Parameters<typeof renderExample>[0]): object {
	let captured: object = {};
	const spy = Object.assign((p: object) => {
		captured = p;
		return obj(p);
	}, { meta: obj.meta });
	obj.meta.example(spy);
	return captured;
}
