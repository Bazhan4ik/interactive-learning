# Writing scenes

A scene is one interactive diagram. Each file in this folder default-exports
one scene. This guide is written for whoever writes scenes, human or LLM.

```ts
import { colors, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

export default defineScene({
	title: 'Vector addition',
	view: { x: [-6, 6], y: [-3.5, 3.5] }, // world region to show (math coords, +y up)
	state: { a: [3, 1] as Vec2, b: [1, 2] as Vec2 }, // what the learner can change
	draw: ({ state }) => [
		axes({ x: [-5, 5], y: [-3, 3], grid: true }),
		vector({ to: state.a, label: 'a', color: colors.blue }),
		vector({ to: state.b, label: 'b', color: colors.red }),
		vector({ to: vec.add(state.a, state.b), label: 'a + b', color: colors.yellow }),
		handle({ bind: 'a' }), // drag the tip of a
		handle({ bind: 'b' })
	]
});
```

## The model

`draw(ctx)` is called for every frame and returns what to show **right now**,
given:

| `ctx.state`     | current interactive state (starts as `state`, changed by handles)  |
| --------------- | ------------------------------------------------------------------ |
| `ctx.t`         | time in seconds                                                    |
| `ctx.p('name')` | 0→1 progress of a timeline phase (eased)                           |
| `ctx.view`      | visible world region                                               |
| `ctx.px(n)`     | n pixels in world units                                            |

Never keep variables that change between frames; compute everything from
`ctx`. Return nodes, arrays, or falsy values (`cond && node`) freely.

## Animation

Name phases in `timeline`; they run one after another unless told otherwise.
Use effects with the phase progress:

```ts
timeline: { axes: 1, a: 1.5, label: { duration: 1, with: 'a' }, b: { duration: 1, delay: 0.5 } },
draw: (ctx) => [
	create(axes(), ctx.p('axes')),             // draw strokes progressively
	create(vector({ to: [2, 1] }), ctx.p('a')),
	fadeIn(text({ text: 'a', at: [2, 1.4] }), ctx.p('label')),
	morph(circle(), rect({ width: 2, height: 2 }), ctx.p('b')), // any shape into any shape
]
```

Effects: `create`, `uncreate`, `fadeIn`, `fadeOut`, `grow`, `morph`, `stagger`.
Easings: `linear`, `smooth` (default), `easeIn`, `easeOut`, `easeInOut`,
`thereAndBack`, `backOut` — e.g. `ctx.p('a', 'linear')`.

For continuous motion (oscillation, rotation) set `duration` (and `loop: true`)
and use `ctx.t` directly.

## Interaction

- `handle({ bind: 'key' })` makes `state.key` (a `[x, y]` point) draggable.
- `constrain` restricts movement: `constraints.snapToGrid(0.5)`,
  `inBox`, `onSegment`, `onCircle`, `inRing`, `horizontal`, `vertical`,
  combined with `constraints.all(...)`.
- To store something other than a point, pass `at` (where to draw it) and
  `map` (point → stored value). `slider` from the library does this for
  numbers.
- Every handle's `bind` key must exist in `state`, and `state` must be plain
  JSON data.

## Quizzes

`checks` are named predicates over state; the app reads them to grade answers:

```ts
checks: { inThirdQuadrant: (s) => vec.quadrant(s.answer) === 3 }
```

## Vocabulary

- Shapes (`#engine`): `line`, `arrow`, `polyline`, `polygon`, `curve`,
  `parametric`, `circle`, `ellipse`, `arc`, `rect`, `regularPolygon`, `dot`,
  `text`, `group`, `path`, `marker`, `handle`.
- Transforms: `translate`, `rotate`, `scale`, `withOpacity`, `withStyle`.
- Math: `vec.*` (`add`, `sub`, `scale`, `len`, `angle`, `rotate`, `quadrant`, ...),
  `lerp`, `clamp`, `remap`, `round`, `TAU`.
- Objects (`#library`): see the library catalogue (`describeLibrary()`),
  or the `examples/library-gallery` scene.
- Colours: `colors.blue | red | green | yellow | orange | purple | teal | pink | foreground | muted | faint`.

## Style

Every factory takes one options object with geometry and style together:
`circle({ center: [0, 0], radius: 1, color: colors.blue, fill: 'currentColor', fillOpacity: 0.2 })`.
`color` is the main colour (stroke of shapes, fill of text) and cascades into
groups. `strokeWidth`, `fontSize` and `dash` are in px.

## Checking a scene

`npm test` renders every scene here at several times and checks handles and
state (`lessons.test.ts`). Open `/dev?scene=<folder>/<file>` to see it live.
