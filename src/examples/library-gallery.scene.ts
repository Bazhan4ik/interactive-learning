/**
 * Library gallery
 *
 * Every object in the library, rendered from its `meta.example`.
 *
 * Renders every library object's `example`, scaled into a grid cell. New
 * library objects show up here automatically — useful when building one.
 * Handles are stripped: this is a visual check, examples have no state.
 */
import { boundsCenter, colors, defineScene, group, mapTree, nodeBounds, renderExample, scale, text, translate, type Node } from '#engine';
import { catalog } from '#library/catalog';

const COLS = 4;
const CELL_W = 4;
const CELL_H = 4.2;
const FIT = 1.4; // half-size of the box each example is scaled into

function fitted(example: Node, center: [number, number]): Node {
	const b = nodeBounds(example);
	if (!b) return translate(example, center);
	const size = Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], 1e-6);
	const c = boundsCenter(b);
	return translate(scale(translate(example, [-c[0], -c[1]]), (FIT * 2) / size), center);
}

const withoutHandles = (node: Node): Node => mapTree(node, (n) => (n.kind === 'handle' ? null : n)) ?? group([]);

export default defineScene({
	size: [800, 450 * Math.ceil(catalog.length / COLS) / 2],
	view: { x: [-8, 8], y: [-(CELL_H * Math.ceil(catalog.length / COLS)) / 2, (CELL_H * Math.ceil(catalog.length / COLS)) / 2] },
	draw: ({ view }) =>
		catalog.map((obj, i) => {
			const col = i % COLS;
			const row = Math.floor(i / COLS);
			const center: [number, number] = [-8 + CELL_W * (col + 0.5), view.y[1] - CELL_H * (row + 0.5) + 0.25];
			return [
				fitted(withoutHandles(group(renderExample(obj))), center),
				text({ text: obj.meta.name, at: [center[0], center[1] - CELL_H / 2 + 0.15], fontSize: 14, color: colors.muted, fontFamily: 'mono' })
			];
		})
});
