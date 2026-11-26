import { untrack } from 'svelte';

/**
 * Playback clock for a scene: owns `t` and advances it with
 * requestAnimationFrame while playing.
 *
 * Commands (`play`, `pause`, ...) read state untracked, so calling them from
 * an `$effect` never makes the effect depend on (and loop over) `t`/`playing`.
 */
export class Player {
	t = $state(0);
	playing = $state(false);

	readonly duration: number;
	readonly loop: boolean;
	#raf = 0;
	#last = 0;

	constructor(duration: number, loop = false) {
		this.duration = duration;
		this.loop = loop;
	}

	play() {
		untrack(() => {
			if (this.duration <= 0 || this.playing) return;
			if (this.t >= this.duration) this.t = 0;
			this.playing = true;
			this.#last = performance.now();
			this.#raf = requestAnimationFrame(this.#tick);
		});
	}

	pause() {
		this.playing = false;
		cancelAnimationFrame(this.#raf);
	}

	toggle() {
		if (untrack(() => this.playing)) this.pause();
		else this.play();
	}

	seek(t: number) {
		this.t = Math.min(this.duration, Math.max(0, t));
	}

	destroy() {
		this.pause();
	}

	#tick = (now: number) => {
		if (!this.playing) return;
		const dt = (now - this.#last) / 1000;
		this.#last = now;
		let t = this.t + dt;
		if (t >= this.duration) {
			if (this.loop) t %= this.duration;
			else {
				this.t = this.duration;
				this.playing = false;
				return;
			}
		}
		this.t = t;
		this.#raf = requestAnimationFrame(this.#tick);
	};
}
