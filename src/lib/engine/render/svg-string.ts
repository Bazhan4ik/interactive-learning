/**
 * Frame → standalone SVG document string. Pure, works in Node and the browser
 * (used for exports, snapshot tests and server-side rendering).
 */
import type { Frame } from '../core/scene';
import { pathAttrs, textAttrs, type SvgAttrs } from './attributes';

export interface SvgRenderOptions {
	/** Draw handles as rings (they are interactive-only by default). */
	showHandles?: boolean;
	/** Output width/height attributes. Defaults to the frame's logical size. */
	width?: number;
	height?: number;
}

export function renderSvg(frame: Frame, opts: SvgRenderOptions = {}): string {
	const { width = frame.width, height = frame.height, showHandles = false } = opts;
	const body: string[] = [`<rect width="${frame.width}" height="${frame.height}" fill="${esc(frame.background)}"/>`];
	for (const p of frame.primitives) {
		if (p.kind === 'path') body.push(`<path${attrs(pathAttrs(p))}/>`);
		else body.push(`<text${attrs(textAttrs(p))}>${esc(p.text)}</text>`);
	}
	if (showHandles) {
		for (const h of frame.handles) {
			body.push(
				`<circle cx="${h.at[0]}" cy="${h.at[1]}" r="${h.radius}" fill="none" stroke="${esc(h.color)}" stroke-width="2"/>`
			);
		}
	}
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
		`viewBox="0 0 ${frame.width} ${frame.height}">${body.join('')}</svg>`
	);
}

const attrs = (a: SvgAttrs) =>
	Object.entries(a)
		.map(([k, v]) => ` ${k}="${esc(String(v))}"`)
		.join('');

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
