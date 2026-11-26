export const TAU = Math.PI * 2;

export const clamp = (x: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, x));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Inverse of `lerp`: where `x` sits between `a` and `b` (unclamped). */
export const inverseLerp = (a: number, b: number, x: number): number =>
	a === b ? 0 : (x - a) / (b - a);

/** Map `x` from range `[a0, a1]` to range `[b0, b1]` (unclamped). */
export const remap = (x: number, a0: number, a1: number, b0: number, b1: number): number =>
	lerp(b0, b1, inverseLerp(a0, a1, x));

export const degToRad = (deg: number): number => (deg * Math.PI) / 180;
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Round to a fixed number of decimals (useful for labels). */
export const round = (x: number, decimals = 0): number => {
	const k = 10 ** decimals;
	return Math.round(x * k) / k;
};

/** Snap `x` to the nearest multiple of `step`. */
export const snap = (x: number, step: number): number => Math.round(x / step) * step;
