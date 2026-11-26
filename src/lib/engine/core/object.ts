/**
 * `defineObject`: the contract for library objects (springs, axes, vectors...).
 *
 * A library object is just a function `params => Node` plus metadata. The
 * metadata makes the library self-describing, so it can be listed for an LLM
 * (`describeObjects`) and smoke-tested automatically (every `example` is
 * rendered in tests).
 *
 * The wrapper gives every object the common node options for free: `id`,
 * `opacity`, `transform` and style props (`color`, `strokeWidth`, ...) are
 * applied to the object's root, and cascade to its parts unless a part sets
 * its own style.
 */
import { splitStyle } from '../style/style';
import type { NodeOptions } from '../nodes/shapes';
import type { Child, Node } from '../nodes/types';

export interface ObjectMeta<P = object> {
	/** Same as the exported function name, e.g. `'spring'`. */
	readonly name: string;
	/** Folder in the library, e.g. `'physics'`. */
	readonly category: string;
	/** One or two sentences: what it draws and when to use it. */
	readonly description: string;
	/** Short usage snippet shown to authors (an LLM reads this). */
	readonly usage: string;
	/**
	 * Renders a representative instance; used by tests and galleries.
	 * Receives the object's own factory: `example: (spring) => spring({...})`.
	 */
	readonly example: (self: ObjectFactory<P>) => Child;
}

export type ObjectFactory<P> = ((params: P & NodeOptions) => Node) & { readonly meta: ObjectMeta<P> };

/** Render an object's example (binds `self`). */
export const renderExample = <P>(obj: ObjectFactory<P>): Child => obj.meta.example(obj);

export function defineObject<P extends object>(
	meta: ObjectMeta<P>,
	create: (params: P & NodeOptions) => Node
): ObjectFactory<P> {
	const factory = (params: P & NodeOptions): Node => {
		let node: Node;
		try {
			node = create(params ?? ({} as P & NodeOptions));
		} catch (e) {
			const msg = e instanceof Error ? e.message : String(e);
			throw new Error(`${meta.name}(): ${msg}`, { cause: e });
		}
		const [style, rest] = splitStyle(params ?? {});
		const { id, opacity, transform } = rest as NodeOptions;
		if (id === undefined && opacity === undefined && transform === undefined && Object.keys(style).length === 0) {
			return node;
		}
		return {
			kind: 'group',
			children: [node],
			id: id ?? meta.name,
			...(opacity !== undefined && { opacity }),
			...(transform !== undefined && { transform }),
			...(Object.keys(style).length > 0 && { style })
		};
	};
	return Object.assign(factory, { meta });
}

export const isObjectFactory = (x: unknown): x is ObjectFactory<any> =>
	typeof x === 'function' && typeof (x as { meta?: ObjectMeta }).meta?.name === 'string';

/** Markdown catalogue of objects, suitable for including in an LLM prompt. */
export function describeObjects(objects: readonly ObjectFactory<any>[]): string {
	return objects
		.map(({ meta }) => `### ${meta.name} (${meta.category})\n${meta.description}\n\n\`\`\`ts\n${meta.usage.trim()}\n\`\`\``)
		.join('\n\n');
}
