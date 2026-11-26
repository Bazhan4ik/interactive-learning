# learn

Web app for interactive learning: a user describes what they want to learn,
an LLM writes a lesson plan and lessons **as code**, and the code renders
interactive diagrams. A lesson is a topic split into sections; each section is
markdown + LaTeX text (left), an optional scene (right) and an optional quiz.
`/` plays lessons, `/dev` is the engine test bench.

## Commands

Requires Node ≥ 22.17 (`nvm use`, see `.nvmrc`).

- `npm run dev` — dev server; lessons at `/`, engine test bench at `/dev`
- `npm test` — vitest (engine units, library contracts, every scene and lesson)
- `npm run check` — svelte-check / TypeScript

## Layout

| path                 | what                                                              | changes          |
| -------------------- | ----------------------------------------------------------------- | ---------------- |
| `src/lib/engine/`    | core engine: geometry, nodes, animation, compile, renderers       | rarely; stable   |
| `src/lib/library/`   | reusable objects (`spring`, `axes`, `vector`, ...)                | often; additive  |
| `src/lib/lesson/`    | lesson model, markdown + KaTeX, quiz (`quiz/`), `LessonView`      |                  |
| `src/lessons/<id>/`  | lessons: `lesson.ts` + `N-name.md` + `N-name.scene.ts`            | generated        |
| `src/examples/`      | engine showcase scenes (`*.scene.ts`), reference for authors      |                  |
| `src/lib/dev/`       | helpers for the `/dev` page                                       |                  |
| `src/routes/`        | `/` lesson player, `/dev` test bench                              |                  |

Read `src/lib/engine/README.md`, `src/lib/library/README.md` and
`src/lessons/README.md` before working in those areas.

## Dependency direction

`lessons → library → engine`, and `lessons → lesson model → engine`. Never
the reverse. Lessons and library import only the public APIs:

- `#engine` — `src/lib/engine/index.ts`
- `#engine/svelte` — Svelte views (`SceneView`, `FrameSvg`)
- `#library` — `src/lib/library/index.ts`; `#library/catalog` for metadata
- `#lesson` — `src/lib/lesson/index.ts` (`defineLesson`)

Aliases are Node subpath imports in `package.json` (SvelteKit 3 has no
`$lib`). Wildcard aliases need the extension: `#lib/dev/scenes.ts`.

## Conventions

- Svelte 5 runes only. Run the Svelte MCP autofixer on `.svelte` files.
- Scenes are pure: `draw(ctx)` depends only on `ctx.state` and `ctx.t`.
- Scene files are `*.scene.ts`, have no title/description (header comment
  instead), and contain no prose; learner-facing text lives in lesson markdown.
- All math in lesson text and quizzes is LaTeX (`$…$`, `$$…$$`); use `String.raw` in `.ts` strings.
- Quiz results live in a `QuizResults` store provided via Svelte context from the
  root layout (never a module singleton: the server would share it between users).
- `import.meta.glob` needs inline literal patterns (not variables).
- Nodes, paths and state are immutable plain data; helpers return new values.
- Every factory takes a single options object (geometry + style + `id`/`opacity`/`transform`).
- Errors explain where and how to fix (they are read by LLMs that must fix their own code).
- New library objects and lessons are covered by existing generic tests; add
  unit tests for new engine behaviour next to the file (`*.test.ts`).
