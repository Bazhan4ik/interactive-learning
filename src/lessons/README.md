# Writing lessons

This guide is for whoever writes lessons, human or LLM.

## Lesson structure

A lesson is one topic, split into sections shown one at a time. Each section
has explanation text, optionally a scene (an interactive diagram) shown next
to it, and optionally a quiz shown after the text. A lesson is a folder:

```
src/lessons/intro-to-vectors/
  lesson.ts                      ← the manifest: title + ordered sections + quizzes
  1-what-is-a-vector.md          ← section text (markdown + LaTeX)
  2-addition.md
  2-addition.scene.ts            ← section scene (optional)
  2-quiz-sum-direction.scene.ts  ← scene used by a quiz question
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
		{ title: 'Vector addition and subtraction', text: addition, scene: additionScene, quiz: [/* questions */] },
		{ title: 'Review', quiz: [/* questions */] } // quiz-only section
	]
});
```

Rules:

- The folder name is the lesson id (`/?lesson=intro-to-vectors`).
- Number files by section (`2-addition.md`, `2-addition.scene.ts`). Every
  `.md` and `.scene.ts` in the folder must be used by a section or question
  (tests check).
- **All learner-facing prose lives in the markdown** (and quiz text). Scenes
  have no title or description and contain no sentences — only labels and
  live values (`a + b = (4, 3)`).
- The text should refer to what the scene shows ("drag the tip of $\mathbf{a}$"),
  using the same names and colours.
- Markdown: paragraphs, `**bold**`, `*italic*`, `### headings`, lists, `code`,
  links. Raw HTML is shown as text.

## Math (LaTeX)

**Every formula, equation, variable and vector name is LaTeX**, rendered by
KaTeX — never Unicode look-alikes like `√`, `²` or `aₓ`.

- Inline: `$|\mathbf{v}| = \sqrt{x^2 + y^2}$`. No space just inside the
  dollars (`$x$`, not `$ x $`). Keep inline formulas short; they don't wrap.
- Display, on its own lines:

  ```
  $$
  \mathbf{a} \cdot \mathbf{b} = |\mathbf{a}|\,|\mathbf{b}|\cos\theta
  $$
  ```

- A literal dollar sign is `\$`.
- Conventions: vectors `\mathbf{v}`, components `v_x`, units `3\,\text{kg}`,
  degrees `90^\circ`.
- In `.ts` strings (quiz prompts), use `String.raw` so backslashes need no
  escaping: ``prompt: String.raw`What is $|\mathbf{v}|$?` ``.
- Tests reject any LaTeX that KaTeX can't parse.

## Quizzes

Add `quiz: [...]` to any section: after each section, only at the end (a
quiz-only section), or anywhere in between. Questions are shown one at a time
after the section text. Every question has a `prompt` (markdown + LaTeX) and
should have an `explanation`, shown once it's solved or the answer is revealed.

```ts
quiz: [
	{
		type: 'choice', // one answer: radio buttons
		prompt: String.raw`What is $(2, -1) + (-3, 4)$?`,
		options: ['$(-1, 3)$', '$(5, -5)$', '$(-1, -5)$'],
		answer: 0, // index into options; [0, 2] for "select all that apply"
		explanation: String.raw`Add matching components: $(2 - 3,\; -1 + 4) = (-1, 3)$.`
	},
	{
		type: 'number', // the learner types a number (also accepts 1/2, -3, 2.5e3)
		prompt: String.raw`What is $|(6, 8)|$? Round to 2 decimal places if needed.`,
		answer: 10,
		tolerance: 0.01, // absolute; default 0.01
		unit: '°' // optional, shown after the input
	},
	{
		type: 'scene', // the learner answers by interacting with a diagram
		prompt: String.raw`Drag $\mathbf{b}$ so that it is perpendicular to $\mathbf{a}$.`,
		scene: perpendicularScene,
		check: 'perpendicular', // which of the scene's `checks` grades it
		explanation: '...'
	}
]
```

- **`scene` questions** are graded by a named predicate in the scene's
  `checks` (see "Quizzes" under scenes below). `check` can be omitted if the
  scene has exactly one. Put the scene in its own file
  (`4-quiz-perpendicular.scene.ts`) and make sure nothing in it reveals
  whether the current answer is right (no colour change, no live value of
  the quantity being asked about).
- Any question can also show a diagram with `scene` (for `choice` and
  `number` it's just for reference). Otherwise the section's scene stays visible.
- Results (every attempt, reveals) are tracked per session and can be turned
  into a JSON report for an LLM with `buildQuizReport` (`src/lib/lesson/quiz/report.ts`).

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

`checks` are named predicates over state. A lesson's `scene` question names
one of them to grade the learner's answer; `/dev` shows them all live.

```ts
checks: { inThirdQuadrant: (s) => vec.quadrant(s.answer) === 3 }
```

Use snapping constraints (`snapToGrid`) when an exact answer is expected, or
compare with a tolerance. `src/examples/function-minimum.scene.ts` shows a
"point to the global minimum on this interval" question.

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
