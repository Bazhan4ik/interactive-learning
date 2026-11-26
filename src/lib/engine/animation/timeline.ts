/**
 * Timelines: named phases laid out in time.
 *
 * Scenes don't mutate objects over time. Instead `draw(ctx)` is a pure function
 * of `(state, t)`, and asks the timeline "how far along is phase X?" via
 * `ctx.p('X')`. This makes every frame reproducible and seekable.
 *
 *   timeline: {
 *     axes: 1,                          // 0s – 1s
 *     a: 1.5,                           // 1s – 2.5s (phases run in sequence)
 *     label: { duration: 1, with: 'a' }, // starts together with `a`
 *     pause: { duration: 0.5 },         // just waits
 *     b: { duration: 1, delay: 0.25 },  // 0.25s gap after the previous phase
 *     glow: { duration: 2, start: 0 }   // absolute start time
 *   }
 */
import { clamp } from '../math/scalar';
import { resolveEasing, type Easing } from './easing';

export type PhaseSpec =
	| number
	| {
			duration: number;
			/** Absolute start time in seconds. */
			start?: number;
			/** Start at the same time as another (earlier) phase. */
			with?: string;
			/** Start when another (earlier) phase ends. */
			after?: string;
			/** Extra offset in seconds, added to whichever start rule applies. */
			delay?: number;
	  };

export type TimelineSpec = Record<string, PhaseSpec>;

export interface Phase {
	readonly name: string;
	readonly start: number;
	readonly end: number;
}

export interface Timeline {
	readonly phases: readonly Phase[];
	readonly duration: number;
	/** Progress of `phase` at time `t`, clamped to [0, 1] and eased (default `'smooth'`). */
	progress(phase: string, t: number, ease?: Easing): number;
	/** Name of the last phase that has started at time `t`. */
	activePhase(t: number): string | null;
}

export function createTimeline(spec: TimelineSpec = {}): Timeline {
	const phases: Phase[] = [];
	const byName = new Map<string, Phase>();
	let cursor = 0;

	const lookup = (ref: string, from: string): Phase => {
		const p = byName.get(ref);
		if (!p) throw new Error(`timeline: phase "${from}" refers to unknown or later phase "${ref}"`);
		return p;
	};

	for (const [name, raw] of Object.entries(spec)) {
		const s = typeof raw === 'number' ? { duration: raw } : raw;
		if (!(s.duration >= 0)) throw new Error(`timeline: phase "${name}" needs a duration >= 0`);
		let start =
			s.start !== undefined
				? s.start
				: s.with !== undefined
					? lookup(s.with, name).start
					: s.after !== undefined
						? lookup(s.after, name).end
						: cursor;
		start += s.delay ?? 0;
		const phase = { name, start, end: start + s.duration };
		phases.push(phase);
		byName.set(name, phase);
		cursor = Math.max(cursor, phase.end);
	}

	return {
		phases,
		duration: phases.reduce((d, p) => Math.max(d, p.end), 0),
		progress(name, t, ease = 'smooth') {
			const p = byName.get(name);
			if (!p) {
				const known = phases.map((x) => `"${x.name}"`).join(', ') || '(none)';
				throw new Error(`timeline: unknown phase "${name}". Known phases: ${known}`);
			}
			const linear = p.end === p.start ? (t >= p.start ? 1 : 0) : clamp((t - p.start) / (p.end - p.start), 0, 1);
			const eased = resolveEasing(ease)(linear);
			// Snap float noise (e.g. backOut(0) = 4e-16) so "not started" is exactly 0.
			return Math.abs(eased) < 1e-9 ? 0 : eased;
		},
		activePhase(t) {
			let active: string | null = null;
			for (const p of phases) if (t >= p.start) active = p.name;
			return active;
		}
	};
}
