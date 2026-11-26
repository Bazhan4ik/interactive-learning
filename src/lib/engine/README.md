# Engine

A small, manim-inspired engine for **interactive** lesson diagrams. Scenes are
code; the engine turns them into frames that can be rendered as a live
interactive SVG, a static SVG string, or a PNG.

## Pipeline

```
scene.draw(ctx)  ──►  node tree  ──►  compile()  ──►  Frame  ──►  renderer
 (state, t)          (world units)                 (px primitives)   ├─ FrameSvg.svelte  (live, draggable)
                                                                     ├─ renderSvg()      (string: export, tests, SSR)
                                                                     └─ drawFrame()/renderPng()  (canvas)
```

1. **Scene** (`core/scene.ts`): `draw(ctx)` is a *pure function* of the
   interactive `state` and the time `t`. No updaters, no mutation.
   - animation = `draw` reads `ctx.t` or `ctx.p('phase')`
   - interaction = `handle` nodes write into `state`; the scene is redrawn
   - quizzes = `checks` are predicates over `state`
2. **Nodes** (`nodes/`): plain immutable data. Five kinds only: `path`, `text`,
   `marker`, `group`, `handle`. Everything else — arrows, springs, axes — is
   built from these.
3. **Compile** (`core/compile.ts`): flattens the tree, applies transforms and
   the viewport, cascades styles, multiplies opacity, expands pixel-sized
   features (arrow tips, markers, text offsets) and resolves handles.
4. **Primitives** (`core/primitives.ts`): the only renderer input. Paths are
   cubic Béziers in px, text is positioned in px. A new output format only
   needs to handle `PathPrimitive` and `TextPrimitive`.

## Why everything is Bézier paths

Every shape is a `Path`: subpaths of cubic Béziers (`geometry/path.ts`). One
representation means one implementation of: transforms, bounds, partial
drawing (`slicePath` → `create()`), and morphing between *any* two shapes
(`alignPaths` + `lerpPath` → `morph()`). Text is the one exception and stays a
native text primitive (crisp, selectable, cheap).

## Units

| quantity                                   | unit                                   |
| ------------------------------------------ | -------------------------------------- |
| geometry (`from`, `radius`, `center`, ...) | world units, +y up                     |
| `strokeWidth`, `fontSize`, `dash`          | px of the scene's logical size         |
| arrow tips, `dot` radius, `marker` paths   | px                                     |
| text `offset`                              | px, +y up                              |

The logical size defaults to 800×450; renderers scale it to any output size,
so px values look the same everywhere.

## Folder map

| folder         | contents                                                             |
| -------------- | -------------------------------------------------------------------- |
| `math/`        | `vec` (tuples), affine `matrix`, cubic `bezier`, scalar helpers       |
| `geometry/`    | `Path` type + operations; constructors (`circlePath`, `PathBuilder`)  |
| `style/`       | style props + cascade/resolution, theme `colors`, colour mixing       |
| `nodes/`       | node types, factories (`circle`, `arrow`, `text`...), tree helpers    |
| `animation/`   | easings, `createTimeline`, effects (`create`, `morph`, `fadeIn`...)   |
| `interaction/` | drag constraints, pure drag logic                                     |
| `core/`        | viewport, compiler, scene definition/evaluation, `defineObject`       |
| `render/`      | SVG string, canvas/PNG, Svelte components (`render/svelte/`)          |

## Rules

- `index.ts` is the public API (`#engine`). Lessons and the library import
  only from there. Svelte views are in `#engine/svelte`.
- The engine never imports from the library or lessons.
- Everything except `render/svelte` and `render/canvas.ts` is DOM-free and
  runs in Node (tests run there).
- Errors should say *where* and *how to fix*: scene errors are `SceneError`s
  tagged with the phase (`define`/`draw`/`compile`/`checks`); the loader
  knows which file they came from.
- Scenes carry no title or description: all learner-facing text belongs to
  the lesson (`src/lib/lesson/`).
