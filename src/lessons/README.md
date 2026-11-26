# Writing lessons

This guide is for whoever writes lessons, human or LLM.

## Lesson structure

A lesson is one topic, split into sections shown one at a time. Each section
has explanation text and, optionally, a scene (an interactive diagram) shown
next to it. A lesson is a folder:

```
src/lessons/intro-to-vectors/
  lesson.ts                 ← the manifest: title + ordered sections
  1-what-is-a-vector.md     ← section text (markdown)
  2-addition.md
  2-addition.scene.ts       ← section scene (optional)
  3-scaling.md
  3-scaling.scene.ts
```

```ts
// lesson.ts
import { defineLesson } from '#lesson';
import definition from './1-what-is-a-vector.md?raw';
import addition from './2-addition.md?raw';
import additionScene from './2-addition.scene';

export default defineLesson({
	title: 'Introduction to vectors',
	sections: [
		{ title: 'Vector definition and notation', text: definition }, // text only
		{ title: 'Vector addition and subtraction', text: addition, scene: additionScene }
	]
});
```

Rules:

- The folder name is the lesson id (`/?lesson=intro-to-vectors`).
- Number files by section (`2-addition.md`, `2-addition.scene.ts`). Every
  `.md` and `.scene.ts` in the folder must be used by a section (tests check).
- **All learner-facing prose lives in the markdown.** Scenes have no title or
  description and should not contain explanatory sentences — only labels and
  live values (`a + b = (4, 3)`).
- The text should refer to what the scene shows ("drag the tip of **a**"),
  using the same names and colours.
- Markdown: paragraphs, `**bold**`, `*italic*`, `### headings`, lists, `code`,
  links. Raw HTML is shown as text. Write maths in plain Unicode for now:
  `|v| = √(x² + y²)`, `aₓbₓ + aᵧbᵧ`, `θ`.

# Writing scenes

A scene is one interactive diagram: a `*.scene.ts` file that default-exports
`defineScene({...})`. Describe it in a header comment (that's for developers
and the `/dev` page; learners never see it).

```ts
/**
 * Vector addition: drag the tips of a and b; a + b follows.
 */
import { colors, defineScene, handle, vec, type Vec2 } from '#engine';
import { axes, vector } from '#library';

export default defineScene({
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

More complete examples: `src/examples/*.scene.ts` and the scenes of existing
lessons.

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

`checks` are named predicates over state, for grading answers. (`/dev` shows
them; the lesson page doesn't use them yet.)

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

## Checking your work

`npm test` renders every scene at several times, checks handles and state
(`src/scenes.test.ts`), and checks each lesson's structure
(`src/lessons/lessons.test.ts`). Open `/?lesson=<id>` to see the lesson, or
`/dev?scene=lessons/<id>/<file>` to see a scene next to its source.
