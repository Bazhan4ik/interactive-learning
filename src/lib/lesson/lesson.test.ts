import { describe, expect, it } from 'vitest';
import { defineScene } from '#engine';
import { defineLesson } from './lesson';
import { renderMarkdown } from './markdown';

describe('defineLesson', () => {
	const scene = defineScene({ draw: () => null });

	it('numbers sections and normalises missing scenes to null', () => {
		const lesson = defineLesson({
			title: 'T',
			sections: [
				{ title: 'One', text: 'a' },
				{ title: 'Two', text: 'b', scene }
			]
		});
		expect(lesson.sections.map((s) => [s.number, s.scene])).toEqual([
			[1, null],
			[2, scene]
		]);
	});

	it('explains what is wrong and where', () => {
		expect(() => defineLesson({ title: '', sections: [] })).toThrow(/`title` must be a non-empty string/);
		expect(() => defineLesson({ title: 'T', sections: [] })).toThrow(/lesson "T": `sections` must be a non-empty array/);
		expect(() => defineLesson({ title: 'T', sections: [{ title: 'S', text: ' ' }] })).toThrow(
			/lesson "T", section 1 \("S"\): `text` must be non-empty markdown/
		);
		expect(() => defineLesson({ title: 'T', sections: [{ title: 'S', text: 'x', scene: {} as never }] })).toThrow(
			/`scene` must be the default export of a \*\.scene\.ts file/
		);
	});
});

describe('renderMarkdown', () => {
	it('renders markdown', () => {
		expect(renderMarkdown('**v** = (3, 2)')).toBe('<p><strong>v</strong> = (3, 2)</p>\n');
	});

	it('escapes raw HTML instead of rendering it', () => {
		const html = renderMarkdown('hi <script>alert(1)</script> <img src=x onerror=alert(1)>');
		expect(html).not.toContain('<script');
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;script&gt;');
	});

	it('only links to safe URLs', () => {
		expect(renderMarkdown('[ok](https://example.com)')).toContain('<a href="https://example.com"');
		expect(renderMarkdown('[bad](javascript:alert(1))')).not.toContain('<a');
		expect(renderMarkdown('[bad](//evil.example)')).not.toContain('<a');
	});

	it('renders images as alt text', () => {
		expect(renderMarkdown('![a diagram](https://example.com/x.png)')).not.toContain('<img');
	});
});
