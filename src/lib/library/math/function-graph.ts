import { colors, defineObject, geometry, group, path, type Color, type Range, type Vec2 } from '#engine';

export interface FunctionGraphParams {
	/** The function to plot, `y = f(x)`. */
	f: (x: number) => number;
	/** Domain to plot. */
	x: Range;
	/**
	 * Visible y range. The curve is clipped exactly at its edges, and values
	 * outside it are gaps, so asymptotes (e.g. `Math.tan`) don't draw spikes.
	 */
	y?: Range;
	samples?: number;
	/**
	 * Colour the curve by the sign of another function, e.g. by `f''` to show
	 * concavity or by `f'` to show where f increases.
	 */
	colorBySign?: { of: (x: number) => number; positive: Color; negative: Color };
}

export interface SignRun {
	from: number;
	to: number;
	/** Sign of the function on (from, to); 0 only if it is zero everywhere. */
	sign: 1 | -1 | 0;
}

/**
 * Split `[a, b]` into intervals where `f` has a constant sign. Boundaries are
 * located by bisection. Non-finite values (e.g. at a pole) count as boundaries,
 * and isolated zeros without a sign change (like x² at 0) don't split a run.
 */
export function signRuns(f: (x: number) => number, [a, b]: Range, samples = 400): SignRun[] {
	const sign = (x: number): 1 | -1 | 0 => {
		const v = f(x);
		return !Number.isFinite(v) || v === 0 ? 0 : v > 0 ? 1 : -1;
	};
	const xs = Array.from({ length: samples + 1 }, (_, i) => a + ((b - a) * i) / samples);
	const first = xs.find((x) => sign(x) !== 0);
	if (first === undefined) return [{ from: a, to: b, sign: 0 }];

	const runs: SignRun[] = [];
	let start = a;
	let current = sign(first);
	let lastX = first;
	for (const x of xs) {
		const s = sign(x);
		if (s === 0 || s === current) {
			if (s === current) lastX = x;
			continue;
		}
		// bisect between lastX (sign = current) and x (sign = s)
		let lo = lastX;
		let hi = x;
		for (let i = 0; i < 50; i++) {
			const mid = (lo + hi) / 2;
			if (sign(mid) === current) lo = mid;
			else hi = mid;
		}
		const boundary = (lo + hi) / 2;
		runs.push({ from: start, to: boundary, sign: current });
		start = boundary;
		current = s;
		lastX = x;
	}
	runs.push({ from: start, to: b, sign: current });
	return runs;
}

/** Where `f` changes sign on `[a, b]` (roots with a sign change, poles). */
export const signChanges = (f: (x: number) => number, range: Range, samples?: number): number[] =>
	signRuns(f, range, samples)
		.slice(1)
		.map((r) => r.from);

/**
 * Sample y = f(x) into runs of points, splitting at non-finite values and
 * clipping exactly where the curve leaves the y range.
 */
function sampleRuns(f: (x: number) => number, [x0, x1]: Range, y: Range | undefined, samples: number): Vec2[][] {
	const inside = (v: number) => Number.isFinite(v) && (!y || (v >= y[0] && v <= y[1]));
	const edge = (xa: number, xb: number): Vec2 => {
		// bisect for the x where the curve crosses out of the box; xa inside, xb outside
		for (let i = 0; i < 40; i++) {
			const mid = (xa + xb) / 2;
			if (inside(f(mid))) xa = mid;
			else xb = mid;
		}
		const v = f(xa);
		return [xa, y ? Math.min(y[1], Math.max(y[0], v)) : v];
	};
	const runs: Vec2[][] = [];
	let run: Vec2[] = [];
	let prevX = x0;
	let prevIn = inside(f(x0));
	for (let i = 0; i <= samples; i++) {
		const x = x0 + ((x1 - x0) * i) / samples;
		const v = f(x);
		const isIn = inside(v);
		if (isIn && !prevIn && i > 0 && Number.isFinite(f(prevX)) && Number.isFinite(v)) run.push(edge(x, prevX));
		if (isIn) run.push([x, v]);
		if (!isIn && prevIn && i > 0) {
			if (Number.isFinite(v)) run.push(edge(prevX, x));
			if (run.length >= 2) runs.push(run);
			run = [];
		}
		prevX = x;
		prevIn = isIn;
	}
	if (run.length >= 2) runs.push(run);
	return runs;
}

function curve(f: (x: number) => number, range: Range, y: Range | undefined, samples: number) {
	return sampleRuns(f, range, y, samples).flatMap((points) => geometry.smoothPath(points));
}

export const functionGraph = defineObject<FunctionGraphParams>(
	{
		name: 'functionGraph',
		category: 'math',
		description:
			'Plot of y = f(x) over a domain, clipped to an optional y range. Handles discontinuities and asymptotes by leaving gaps. `colorBySign` colours it by the sign of another function (e.g. f″ for concavity).',
		usage: `functionGraph({ f: (x) => Math.sin(state.k * x), x: [-5, 5], y: [-3, 3], color: colors.yellow })
functionGraph({ f, x: [-3, 3], colorBySign: { of: f2, positive: colors.teal, negative: colors.purple } })`,
		example: (functionGraph) => functionGraph({ f: Math.tan, x: [-4, 4], y: [-3, 3] })
	},
	({ f, x, y, samples = 240, colorBySign, color = colors.yellow }) => {
		if (!colorBySign) return path({ path: curve(f, x, y, samples), color });
		return group(
			signRuns(colorBySign.of, x).map((run) =>
				path({
					path: curve(f, [run.from, run.to], y, Math.max(8, Math.round((samples * (run.to - run.from)) / (x[1] - x[0])))),
					color: run.sign > 0 ? colorBySign.positive : run.sign < 0 ? colorBySign.negative : color
				})
			)
		);
	}
);
