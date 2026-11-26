import { describe, expect, it } from 'vitest';
import { defineScene, evaluateScene } from '../core/scene';
import { circle, handle, text } from '../nodes/shapes';
import { renderSvg } from './svg-string';

describe('renderSvg', () => {
	const frame = evaluateScene(
		defineScene({
			state: { p: [0, 0] },
			draw: () => [
				circle({ id: 'c', radius: 1, color: '#123456', dash: [4, 2] }),
				text({ text: 'a < b & "c"', at: [0, 0], fontWeight: 'bold' }),
				handle({ bind: 'p' })
			]
		})
	);

	it('produces a standalone document with background and primitives', () => {
		const svg = renderSvg(frame);
		expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="800" height="450" viewBox="0 0 800 450">/);
		expect(svg).toContain('<rect width="800" height="450"');
		expect(svg).toContain('data-id="c"');
		expect(svg).toContain('stroke="#123456"');
		expect(svg).toContain('stroke-dasharray="4 2"');
		expect(svg).toContain('font-weight="bold"');
	});

	it('escapes text', () => {
		expect(renderSvg(frame)).toContain('a &lt; b &amp; &quot;c&quot;');
	});

	it('hides handles unless asked', () => {
		expect(renderSvg(frame)).not.toContain('<circle');
		expect(renderSvg(frame, { showHandles: true })).toContain('<circle');
	});
});
