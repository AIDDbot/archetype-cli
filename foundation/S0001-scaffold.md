---
id: S0001
slug: scaffold
key: S0001-scaffold
type: chore # fix, chore
branch: chore/S0001-scaffold
domain: foundation
---
# S0001-scaffold — Scaffold

## Problem

Each project of `.product/system.md` must exist, with the shape of the Blueprint and all its tooling slots, before the first foundation spec adds a behavior.

### User Stories

- As a developer, I want **each project in the shape of its `AGENTS.md`, with no sample code** so that each later spec adds code in a known place.
- As a developer, I want **each tooling slot to operate and to be registered** so that each step of a delivery checks only its own surface.

### Business rules

- A project has no functional code: no setting, no command, no route, no page, and no acceptance test. The seed primitives of `shared` are not functional code: they have no behavior that an observer sees.
- Do one project before you start the next. Commit each step alone, so that each step can be reviewed and reverted.

### Out of context

- Each behavior of the foundation specs, from `configuration` on.
- The root `AGENTS.md` and the schema documents: `ship-spec` runs `outline-system` for the new projects.

## Solution

### The system

- The root `package.json` holds the identity of `.product/system.md`: `displayName`, `description`, `author`, `homepage` and `license`. `shell` and `about` read it; `aidd release` writes its `version`. Commit it as `chore: set the system identity`, before the first project.
- The root of the system holds the tooling that all projects share: the pre-commit hook of the technology, the format and lint configuration, and the limits of complexity of the Blueprint. For JS / TS, it is the Vite+ workspace of `.product/blueprint/ecosystems.md`, with each project in `projects/` and `.product/blueprint/lint/complexity.json` and `complexity.tests.json` in `projects/lint/`. The format leaves Markdown out. Commit it as `chore: set the system tooling`, before the first project; each project adds itself to it.

### Each project

| Step | Commit | Result |
| --- | --- | --- |
| 1 | `chore({project}): generate` | The output of the official generator of the framework, not changed. |
| 2 | `refactor({project}): shape to blueprint` | The project has the shape of its `AGENTS.md`. |
| 3 | `chore({project}): register tooling` | All tooling slots operate and are registered. |

**Step 1: generate**

- Fill `.product/blueprint/project.AGENTS.template.md` for the technology, with the column of its type from `.product/blueprint/project-types.md`. Use `.product/blueprint/ecosystems.md` as guidance, not as rules.
- Run the official generator with no functional code. Use the scaffold commands of `ecosystems.md` as they are.

**Step 2: shape to blueprint**

- `{folder}/AGENTS.md` is the filled template. Put a `CLAUDE.md` next to it that contains only `@AGENTS.md`.
- Reorganize the generator output into the architecture of that `AGENTS.md`: the composition and its manifest, `core`, features, and `shared` with the contracts of the `core` services.
  - Keep the mechanisms of the framework (injector, router, store, file names) and map them to the concepts.
  - Move folders by technical layer (such as `components/`, `views/`, `stores/`) into `shared` as primitives, or into features.
- Remove each sample of the generator (demo pages, images, icons).
- Make the seed primitives of the shared primitives table in `shared`, with their unit tests. An `e2e` makes only the ones that it uses, with no unit tests. Each primitive keeps its row.
- Keep only the package manager of that `AGENTS.md`. Remove the files of all other package managers.

**Step 3: register tooling**

- Run the `upgrade` command one time, because models remember old releases.
  - If a new major breaks a different tool of the stack, keep the last compatible major. Write the pin and its reason in the technology rules of that `AGENTS.md`.
  - Never pin a major that `ecosystems.md` requires. Replace the tool that breaks.
- The ignore file never hides source. Anchor runtime data patterns to the project root.
- Each tooling slot of that `AGENTS.md` operates. If a mandatory slot is missing (`test`, `start`, `layers`, `crap`), install the usual tool of the stack.
- The pre-commit hook of the root runs the unit tests of the project that a commit affects.
- For JS / TS, start the dependency rules from `.product/blueprint/lint/dependencies.json` (or `dependencies.e2e.json` for `e2e`), and extend the complexity limits of the root.
- Register the type and the slots with `node .agents/aidd/aidd.mjs config set projects.{project} '{"type":"{type}",...}'`.
- Prove the debt checks: add an import that the architecture forbids, make sure that `layers` fails, then remove the import. Do the same with a function over the limits and `crap`.
- Prove the hook: stage a unit test that fails, make sure that the commit fails, then repair it.

### cli — `cli`, `projects/cli/`

- Apply the three project steps to `cli` before `e2e`.
- Use the `cli` column of `.product/blueprint/project-types.md`.
- Use TypeScript on Node.js and the required Vite+ workspace of `.product/blueprint/ecosystems.md`.
- Use npm as the package manager.
- Make the executable entry, composition, explicit empty manifest, `core`, features, and `shared`.
- Make the seed primitives of the shared primitives table, with their unit tests.
- Add the `cli` environment primitive from the project types table.
- Register the `upgrade`, `test`, `start`, `layers`, and `crap` slots.
- Mark `test:spec` as `n/a`: `cli` has no acceptance tests.
- Add no command, setting, logger, output behavior, or local store.

### e2e — `e2e`, `projects/e2e/`

- Apply the three project steps to `e2e` after `cli`.
- Use the `e2e` column of `.product/blueprint/project-types.md`.
- Use TypeScript on Node.js, npm, and Vitest through Vite+.
- Make the runner configuration and the containers of the acceptance suite.
- Add no composition, manifest, layers, unit tests, or acceptance tests.
- Make only the shared primitives that this scaffold uses.
- Register the `upgrade`, `test`, `test:spec`, `start`, `layers`, and `crap` slots.

- `test` and `test:spec` pass with no acceptance test, so that the scaffold ships before the first spec.

## Verification

### Requirements

None: a `chore` changes nothing that an observer sees. The regression of the release (`test` of all projects), the hook at each commit, and the proofs of step 3 are its verification.

### Expected URLs and APIs

None.
