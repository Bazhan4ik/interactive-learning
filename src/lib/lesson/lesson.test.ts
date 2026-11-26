import { describe, expect, it } from 'vitest';
import { defineScene } from '#engine';
import { defineLesson, lessonQuestions } from './lesson';
import { findMathErrors, renderMarkdown, renderMarkdownInline } from './markdown';

describe('defineLesson', () => {
	const scene = defineScene({ draw: () => null });

	it('numbers sections and normalises missing parts', () => {
		const lesson = defineLesson({
			title: 'T',
			sections: [
				{ title: 'One', text: 'a' },
				{ title: 'Two', text: 'b', scene },
				{ title: 'Quiz only', quiz: [{ type: 'number', prompt: 'x?', answer: 1 }] }
			]
		});
		expect(lesson.sections.map((s) => [s.number, s.scene, s.text, s.quiz.length])).toEqual([
			[1, null, 'a', 0],
			[2, scene, 'b', 0],
			[3, null, '', 1]
		]);
		expect(lessonQuestions(lesson).map((q) => q.question.id)).toEqual(['s3-q1']);
	});

	it('explains what is wrong and where', () => {
		expect(() => defineLesson({ title: '', sections: [] })).toThrow(/`title` must be a non-empty string/);
		expect(() => defineLesson({ title: 'T', sections: [] })).toThrow(/lesson "T": `sections` must be a non-empty array/);
		expect(() => defineLesson({ title: 'T', sections: [{ title: 'S', text: ' ' }] })).toThrow(
			/lesson "T", section 1 \("S"\): needs `text`, a `quiz`, or both/
		);
		expect(() => defineLesson({ title: 'T', sections: [{ title: 'S', text: 'x', scene: {} as never }] })).toThrow(
			/`scene` must be the default export of a \*\.scene\.ts file/
		);
		expect(() =>
			defineLesson({ title: 'T', sections: [{ title: 'S', quiz: [{ type: 'choice', prompt: 'p', options: ['a', 'b'], answer: 5 }] }] })
		).toThrow(/section 1 \("S"\), question 1: `answer` 5 is not an option index/);
	});

	it('rejects duplicate question ids', () => {
		const q = { type: 'number' as const, prompt: 'x?', answer: 1, id: 'same' };
		expect(() => defineLesson({ title: 'T', sections: [{ title: 'S', quiz: [q, q] }] })).toThrow(/duplicate question id "same"/);
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

describe('LaTeX', () => {
	it('renders inline math with KaTeX', () => {
		const html = renderMarkdown(String.raw`the vector $\mathbf{v} = (3, 2)$ here`);
		expect(html).toContain('class="katex"');
		expect(html).not.toContain('class="katex-display"');
		expect(html).not.toContain('$');
	});

	it('renders display math blocks, even right after a paragraph line', () => {
		const html = renderMarkdown(String.raw`By Pythagoras:
$$
|\mathbf{v}| = \sqrt{x^2 + y^2}
$$
done`);
		expect(html).toContain('class="math-display"');
		expect(html).toContain('katex-display');
		expect(html).toContain('<p>done</p>');
	});

	it('keeps markdown syntax inside math literal', () => {
		// underscores and asterisks must not become emphasis
		expect(renderMarkdown('$a_x b_y * c_z$')).not.toContain('<em>');
	});

	it('leaves prices and escaped dollars alone', () => {
		expect(renderMarkdown('costs $5 and $6 today')).not.toContain('katex');
		expect(renderMarkdown('a \\$ sign')).toBe('<p>a $ sign</p>\n');
	});

	it('keeps trailing punctuation on the same line as the formula', () => {
		expect(renderMarkdown(String.raw`arrow on top, $\vec{v}$. Next`)).toMatch(/<span class="math-nowrap">.*<\/span>\.<\/span> Next/s);
	});

	it('renders math in inline contexts (answer options)', () => {
		expect(renderMarkdownInline(String.raw`$\tfrac{5}{2}$`)).toContain('class="katex"');
	});

	it('never executes LaTeX tricks', () => {
		expect(renderMarkdown(String.raw`$\href{javascript:alert(1)}{x}$`)).not.toContain('href="javascript');
	});

	it('reports LaTeX errors instead of throwing', () => {
		expect(() => renderMarkdown(String.raw`$\frac{1}$`)).not.toThrow();
		expect(findMathErrors(String.raw`fine $x^2$, broken $\frac{1}$`)).toHaveLength(1);
		expect(findMathErrors('- list with $\\badcommand$')).toHaveLength(1);
		expect(findMathErrors(String.raw`all good $\sqrt{2}$`)).toEqual([]);
	});
});
