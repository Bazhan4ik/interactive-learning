/**
 * Minimal colour utilities (hex / rgb() parsing, mixing). Used by `morph` to
 * interpolate styles and available to scenes for derived colours.
 */
import { clamp } from '../math/scalar';

export interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

export function parseColor(input: string): Rgba | null {
	const s = input.trim().toLowerCase();
	if (s.startsWith('#')) {
		let hex = s.slice(1);
		if (hex.length === 3 || hex.length === 4) hex = [...hex].map((c) => c + c).join('');
		if (hex.length !== 6 && hex.length !== 8) return null;
		const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
		return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? n(6) / 255 : 1 };
	}
	const m = s.match(/^rgba?\(([^)]+)\)$/);
	if (m) {
		const [r, g, b, a = '1'] = m[1].split(/[\s,/]+/).filter(Boolean);
		return { r: +r, g: +g, b: +b, a: +a };
	}
	return null;
}

const hex2 = (x: number) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, '0');

export function formatColor({ r, g, b, a }: Rgba): string {
	return a >= 1 ? `#${hex2(r)}${hex2(g)}${hex2(b)}` : `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`;
}

/** Blend two colours. Falls back to a hard switch at t = 0.5 for unparseable colours. */
export function mix(a: string, b: string, t: number): string {
	if (t <= 0) return a;
	if (t >= 1) return b;
	const ca = parseColor(a);
	const cb = parseColor(b);
	if (!ca || !cb) return t < 0.5 ? a : b;
	return formatColor({
		r: ca.r + (cb.r - ca.r) * t,
		g: ca.g + (cb.g - ca.g) * t,
		b: ca.b + (cb.b - ca.b) * t,
		a: ca.a + (cb.a - ca.a) * t
	});
}

export function withAlpha(color: string, alpha: number): string {
	const c = parseColor(color);
	return c ? formatColor({ ...c, a: alpha }) : color;
}
