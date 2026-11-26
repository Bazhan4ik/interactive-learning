# Library

Higher-level objects for lessons (`spring`, `axes`, `vector`, ...). Each one
is a function `params => Node` built from engine primitives, so lesson code
stays short: `spring({ from, to, coils: 10 })` instead of drawing coils by hand.

## Adding an object

1. Create `src/lib/library/<category>/<name>.ts` (category = folder, e.g.
   `math`, `physics`, `chemistry`, `ui`). Import only from `#engine` (and
   other library files when composing).
2. Export it from `index.ts`.
3. Run `npm test`. The contract tests in `library.test.ts` check it
   automatically, and it shows up in the `examples/library-gallery` scene on
   `/dev`.

```ts
import { colors, defineObject, group, line, type Vec2 } from '#engine';

export interface PulleyParams {
	/** Centre of the wheel (world units). */
	center: Vec2;
	radius?: number;
}

export const pulley = defineObject<PulleyParams>(
	{
		name: 'pulley', // must equal the export name
		category: 'physics', // must equal the folder
		description: 'A fixed pulley wheel with an axle. Use for rope-and-mass problems.',
		usage: `pulley({ center: [0, 2], radius: 0.5 })`, // shown to the lesson-writing LLM
		example: (pulley) => pulley({ center: [0, 0] }) // rendered by tests and the gallery
	},
	({ center, radius = 0.5, color = colors.foreground }) =>
		group([/* ...circle, axle dot, ... */], { color })
);
```

## Conventions

- **One params object.** Geometry in world units; anything visual that should
  not scale with zoom (label gaps, tick lengths) in px via `text({ offset })`
  or `marker`.
- **Common options are free.** `defineObject` applies `id`, `opacity`,
  `transform` and style props (`color`, `strokeWidth`, ...) to the object's
  root. Read `color` from params with a default if parts should use it, and
  don't hard-code colours on parts that should follow the object's colour.
- **Stateless.** Objects never hold state. If something is draggable, take a
  `bind` key and the current `value`, and emit a `handle` (see `ui/slider.ts`).
- **Validate and throw** with a clear message for bad params; the wrapper
  prefixes it with the object name (`spring(): coils must be >= 1`).
- **Document every param** with a JSDoc comment on the params interface —
  it is what authors (and LLMs) see.
