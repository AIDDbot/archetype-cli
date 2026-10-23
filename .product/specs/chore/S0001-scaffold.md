---
id: S0001
slug: scaffold
key: S0001-scaffold
type: chore
branch: chore/S0001-scaffold
domain: foundation
---
# S0001-scaffold — Scaffold

## Problem

Each project of `.product/system.md` must have its framework, its entry and all its tooling slots, before the first foundation spec adds a behavior. The Bedrock of the archetype is at the root: the workspace, the tooling of each project, the debt checks (`tools/lint/`), the identity and the license.

### User Stories

- As a developer, I want **each project in the shape of its `AGENTS.md`, with its framework and no sample code** so that each later spec adds code in a known place.
- As a developer, I want **each tooling slot to operate and to be registered** so that each step of a delivery checks only its own surface.

### Business rules

- A project has no functional code: no setting, no command, and no acceptance test. The primitives of `shared` in the Bedrock are not functional code: they have no behavior that an observer sees.
- The assets of the Bedrock stay as they are: `tools/lint/`, the license, the identity and the tooling of the workspace. Change one only to add what the framework needs, with the commands of `.product/blueprint/ecosystems.md`.
- Do one project before you start the next. Commit each step alone, so that each step can be reviewed and reverted.

### Out of context

- Each behavior of the foundation specs, from `platform` on.
- The root `AGENTS.md` and the schema documents: `ship-spec` runs `outline-system` for the new projects.

## Solution

### The system

- The Bedrock gives the root: the root `package.json` with the `license` and no identity, the workspace, the pre-commit hook and `tools/lint/`. The `cli` has the identity in its `package.json` (`displayName`, `description`, `author` with `name` and `url`, `version`). The scaffold registers these files with `node .agents/aidd/aidd.mjs config set release.versionFiles '["projects/cli/package.json"]'`: `aidd release` writes each `version`.

### Each project

| Project | Type | Folder | Framework |
| --- | --- | --- | --- |
| `cli` | `cli` | `projects/cli/` | none: TypeScript on Node.js; `bin` and `start` run `src/app.main.ts` |
| `e2e` | `e2e` | `projects/e2e/` | none: Vitest, in the Bedrock |


| Step | Commit | Result |
| --- | --- | --- |
| 1 | `chore({project}): add framework` | The `AGENTS.md` of the project, and its framework on the Bedrock. |
| 2 | `chore({project}): add entry` | The entry and the composition, with their unit tests. |
| 3 | `chore({project}): register tooling` | All tooling slots operate and are registered. |

**Step 1: add framework**

- Fill `.product/blueprint/project.AGENTS.template.md` for the technology, with the column of its type from `.product/blueprint/project-types.md`. `{folder}/AGENTS.md` is the filled template. Put a `CLAUDE.md` next to it that contains only `@AGENTS.md`.
- Add the framework of that `AGENTS.md` with the commands of "Frameworks on the Bedrock" in `.product/blueprint/ecosystems.md`, as they are. Never run a generator of the framework: the Bedrock already has the project. A project with no framework (a `cli`, the `e2e`) skips this commit, except for its `AGENTS.md`.

**Step 2: add entry**

- The entry `main`, alone at the root of `src`; the manifest of the features, empty; and `core/lifecycle/` with the composition and the start. The `start` script of the project runs the entry.
  - Keep the mechanisms of the framework (injector, router, store, file names) and map them to the concepts.
- The primitives of `shared` come with the Bedrock, with their unit tests: the expected error and the identity type at the root of `shared`, the others in `shared/values/`, one folder for each type of value. Use them; never write a second version. The index of `shared` (`src/shared/README.md`, written by `aidd release`) lists them. An `e2e` has only the checks (`shared/values/values.check.ts`), with no unit test: it reads JSON with no type too.

**Step 3: register tooling**

- Run the `upgrade` command one time.
  - If a new major breaks a different tool of the stack, keep the last compatible major. Write the pin and its reason in the project rules of that `AGENTS.md`.
  - Never pin a major that `ecosystems.md` requires. Replace the tool that breaks.
- The ignore file never hides source. Anchor runtime data patterns to the project root.
- Each tooling slot of that `AGENTS.md` operates. The Bedrock gives `test`, `layers` and `crap`; step 2 gives `start`.
- Register the type and the slots with `node .agents/aidd/aidd.mjs config set projects.{project} '{"type":"{type}",...}'`.
- Prove the debt checks: add an import that the architecture forbids, make sure that `layers` fails, then remove the import. Do the same with a function over the limits and `crap`.
- Prove the hook: stage a unit test that fails, make sure that the commit fails, then repair it.

### e2e

- `test` and `test:spec` pass with no acceptance test, so that the scaffold ships before the first spec.

## Verification

### Requirements

None: a `chore` changes nothing that an observer sees. The `crap` of each project, the hook at each commit, the proofs of step 3 and the regression of the release are its verification.

### Expected URLs and APIs

None.
