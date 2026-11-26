/**
 * Default visual theme. Colours are tuned for a dark background; scene code
 * should use these names (`colors.blue`) rather than raw hex values so lessons
 * look consistent and can be re-themed later.
 */

export const colors = {
	background: '#191919',
	foreground: '#e6e4df',
	muted: '#8b909a',
	faint: '#333333',
	blue: '#5b9cf5',
	red: '#f0656b',
	green: '#5fd08a',
	yellow: '#f2c94c',
	orange: '#f29b4a',
	purple: '#b18cf0',
	teal: '#4fd1c5',
	pink: '#f78fb3'
} as const;

export type ColorName = keyof typeof colors;

export interface Theme {
	readonly background: string;
	readonly foreground: string;
	readonly strokeWidth: number;
	readonly fontSize: number;
	readonly fonts: { readonly sans: string; readonly serif: string; readonly mono: string };
	/** Arrow tip length in px for a stroke of `strokeWidth`. */
	readonly tipSize: number;
	readonly handle: { readonly radius: number; readonly color: string };
}

export const defaultTheme: Theme = {
	background: colors.background,
	foreground: colors.foreground,
	strokeWidth: 3,
	fontSize: 22,
	fonts: {
		sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
		serif: '"Latin Modern Roman", "Computer Modern", Georgia, "Times New Roman", serif',
		mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
	},
	tipSize: 14,
	handle: { radius: 9, color: colors.yellow }
};
