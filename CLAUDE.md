# learn

Web app for interactive learning: a user describes what they want to learn,
an LLM writes a lesson plan and lessons **as code**, and the code renders
interactive diagrams. Currently being built: the diagram engine and its
`/dev` test bench. The learner-facing app comes later.

## Commands

Requires Node ≥ 22.17 (`nvm use`, see `.nvmrc`).

- `npm run dev` — dev server; engine test bench at `/dev`
- `npm test` — vitest (engine units, library contracts, smoke tests of every lesson)
- `npm run check` — svelte-check / TypeScript

## Layout

| path                 | what                                                             | changes          |
| -------------------- | ---------------------------------------------------------------- | ---------------- |
| `src/lib/engine/`    | core engine: geometry, nodes, animation, compile, renderers      | rarely; stable   |
| `src/lib/library/`   | reusable objects (`spring`, `axes`, `vector`, ...)               | often; additive  |
| `src/lessons/`       | scene files (later: LLM-generated lessons)                       | generated        |
| `src/lib/dev/`       | helpers for the `/dev` page                                      |                  |
| `src/routes/dev/`    | engine test bench: source + live render + inspector              |                  |

Read the README in each of the first three folders before working there.

## Dependency direction

`lessons → library → engine`. Never the reverse. Lessons and library import
only the public APIs:

- `#engine` — `src/lib/engine/index.ts`
- `#engine/svelte` — Svelte views (`SceneView`, `FrameSvg`)
- `#library` — `src/lib/library/index.ts`; `#library/catalog` for metadata

Aliases are Node subpath imports in `package.json` (SvelteKit 3 has no
`$lib`). Wildcard aliases need the extension: `#lib/dev/scenes.ts`.

## Conventions

- Svelte 5 runes only. Run the Svelte MCP autofixer on `.svelte` files.
- Scenes are pure: `draw(ctx)` depends only on `ctx.state` and `ctx.t`.
- Nodes, paths and state are immutable plain data; helpers return new values.
- Every factory takes a single options object (geometry + style + `id`/`opacity`/`transform`).
- Errors explain where and how to fix (they are read by LLMs that must fix their own code).
- New library objects and lessons are covered by existing generic tests; add
  unit tests for new engine behaviour next to the file (`*.test.ts`).
