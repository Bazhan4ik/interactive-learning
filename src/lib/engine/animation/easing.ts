/** Easing functions map linear progress `t ∈ [0, 1]` to eased progress. */

export type EasingFn = (t: number) => number;

export const easings = {
	linear: (t) => t,
	/** Default. Smooth start and stop (smootherstep). */
	smooth: (t) => t * t * t * (t * (t * 6 - 15) + 10),
	easeIn: (t) => t * t * t,
	easeOut: (t) => 1 - (1 - t) ** 3,
	easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
	/** Goes 0 → 1 → 0. */
	thereAndBack: (t) => {
		const u = t < 0.5 ? t * 2 : 2 - t * 2;
		return u * u * u * (u * (u * 6 - 15) + 10);
	},
	/** Overshoots slightly before settling. */
	backOut: (t) => {
		const c = 1.70158;
		return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
	}
} satisfies Record<string, EasingFn>;

export type EasingName = keyof typeof easings;
export type Easing = EasingName | EasingFn;

export function resolveEasing(e: Easing): EasingFn {
	if (typeof e === 'function') return e;
	const fn = easings[e];
	if (!fn) throw new Error(`Unknown easing "${e}". Available: ${Object.keys(easings).join(', ')}`);
	return fn;
}
