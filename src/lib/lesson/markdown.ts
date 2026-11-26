/**
 * Markdown + LaTeX → HTML for lesson text, quiz prompts and answers.
 *
 * Math: `$…$` inline, `$$…$$` display (rendered with KaTeX, also during SSR).
 * Like Pandoc, inline math must not start or end with a space, so prices like
 * "$5 and $6" stay plain text; write `\$` for a literal dollar sign.
 *
 * Lesson text will be LLM-generated, so it's treated as untrusted: raw HTML is
 * escaped (shown as text, never executed), links are limited to safe
 * protocols, images render as their alt text, and KaTeX runs with `trust: false`.
 */
import katex from 'katex';
import { Marked, type RendererObject, type Token, type TokenizerAndRendererExtension, type Tokens } from 'marked';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SAFE_HREF = /^(https?:|mailto:|#|\/(?!\/))/i;

interface MathToken extends Tokens.Generic {
	type: 'mathBlock' | 'mathInline';
	text: string;
	display: boolean;
	/** Punctuation right after inline math, kept on the same line as the formula. */
	trailing?: string;
}

const BLOCK_MATH = /^\$\$([\s\S]+?)\$\$[^\S\n]*(?:\n+|$)/;
// $$…$$ inside a paragraph, or $…$ with no space just inside the delimiters
// and no digit right after the closing $ (so "$5" is never the end of math).
// Trailing punctuation is captured so "$\vec v$." can't wrap before the dot.
const INLINE_MATH = /^(?:\$\$([\s\S]+?)\$\$|\$(?!\s)((?:\\[\s\S]|[^\\$\n])+?)(?<!\s)\$(?!\d))([.,;:!?)]*)/;

function renderTex(tex: string, display: boolean): string {
	return katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, output: 'htmlAndMathml' });
}

const math: TokenizerAndRendererExtension[] = [
	{
		name: 'mathBlock',
		level: 'block',
		// index of a `$$` at the start of a line, so it can interrupt a paragraph
		start(src) {
			const i = src.search(/(?:^|\n)\$\$/);
			if (i >= 0) return src[i] === '\n' ? i + 1 : i;
		},
		tokenizer(src) {
			const m = BLOCK_MATH.exec(src);
			if (m) return { type: 'mathBlock', raw: m[0], text: m[1].trim(), display: true } satisfies MathToken;
		},
		renderer: (token) => `<div class="math-display">${renderTex(token.text, true)}</div>\n`
	},
	{
		name: 'mathInline',
		level: 'inline',
		start: (src) => src.indexOf('$') >= 0 ? src.indexOf('$') : undefined,
		tokenizer(src) {
			const m = INLINE_MATH.exec(src);
			if (!m) return;
			const display = m[1] !== undefined;
			return { type: 'mathInline', raw: m[0], text: (m[1] ?? m[2]).trim(), display, trailing: m[3] } satisfies MathToken;
		},
		renderer: (token) =>
			token.trailing
				? `<span class="math-nowrap">${renderTex(token.text, token.display)}${escapeHtml(token.trailing)}</span>`
				: renderTex(token.text, token.display)
	}
];

const renderer: RendererObject = {
	html({ text }) {
		return escapeHtml(text);
	},
	link({ href, title, tokens }) {
		const inner = this.parser.parseInline(tokens);
		if (!SAFE_HREF.test(href)) return inner;
		const t = title ? ` title="${escapeHtml(title)}"` : '';
		return `<a href="${escapeHtml(href)}"${t} target="_blank" rel="noopener noreferrer">${inner}</a>`;
	},
	image({ text }) {
		return escapeHtml(text);
	}
};

const md = new Marked({ gfm: true, renderer, extensions: math });

/** Block markdown (paragraphs, lists, headings, display math). */
export function renderMarkdown(source: string): string {
	return md.parse(source, { async: false });
}

/** Inline markdown only (no paragraphs), e.g. for answer options. */
export function renderMarkdownInline(source: string): string {
	return md.parseInline(source, { async: false });
}

/**
 * LaTeX errors in a markdown string, e.g. `["\\frac{1}: Expected group after '\\frac'"]`.
 * Rendering never throws (bad math is shown in red); tests use this to reject it.
 */
export function findMathErrors(source: string): string[] {
	const errors: string[] = [];
	const visit = (tokens: Token[] | undefined) => {
		for (const t of tokens ?? []) {
			if (t.type === 'mathBlock' || t.type === 'mathInline') {
				try {
					katex.renderToString((t as MathToken).text, { displayMode: (t as MathToken).display, throwOnError: true, trust: false });
				} catch (e) {
					errors.push(`$${(t as MathToken).text}$: ${e instanceof Error ? e.message : String(e)}`);
				}
			}
			const nested = t as { tokens?: Token[]; items?: Token[] };
			visit(nested.tokens);
			visit(nested.items);
		}
	};
	visit(md.lexer(source));
	return errors;
}
