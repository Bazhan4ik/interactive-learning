/**
 * Markdown → HTML for lesson text.
 *
 * Lesson text will be LLM-generated, so it's treated as untrusted: raw HTML is
 * escaped (shown as text, never executed), links are limited to safe
 * protocols, and images are rendered as their alt text for now.
 */
import { Marked, type RendererObject } from 'marked';

const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SAFE_HREF = /^(https?:|mailto:|#|\/(?!\/))/i;

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

const md = new Marked({ gfm: true, renderer });

export function renderMarkdown(source: string): string {
	return md.parse(source, { async: false });
}
