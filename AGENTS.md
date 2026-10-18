# Archetype CLI

An archetype of AIDDbot: a whole solution with a local command-line application and its acceptance suite. AIDDbot copies the whole workspace into a new system, and the system grows from it. The archetype carries no business feature.

- Write `AGENTS.md` files, specs and other records in ASD-STE100 Simplified Technical English: short sentences, one statement in each sentence, active voice, and one word for one concept. Technical names are permitted.
- When a request is ambiguous or incomplete, ask one closed question at a time.
- Write code, tests and the texts of the user interface in English. The archetype has no translations.

## Environment

- **Git**: default branch `main`.
- **Runtime**: Node.js 26 or later, npm only. One npm workspace: the shared tooling at the root, each project in `projects/`.

## Projects

| Project | Type | Responsibility | Instructions |
| --- | --- | --- | --- |
| cli | cli | Run one local command with its settings, output and log. | `projects/cli/AGENTS.md` |
| e2e | e2e | Prove each requirement through the commands. It is the conformance suite of the archetype. | `projects/e2e/AGENTS.md` |

The identity of a system (`displayName`, `description`, `author`, `homepage`, `license`, `version`) is in the root `package.json`.

## Product

The repository is an AIDDbot system: `.product/PRD.md` lists the shipped foundation specs of `.product/specs/` (`S0001` to `S0006`; no `users`, because a local cli has none), and `.product/model/` holds the schema documents. A system that starts from the archetype keeps the specs and their tags; its first business spec is `S0007`.

## Common stack

- **Language**: TypeScript 7, on Node.js with no build and no framework. Use erasable syntax.
- **Dependencies**: the Node.js standard library and Vite+. The list is closed: no other dependency unless a spec names it.
- **Pre-commit hook**: `vp staged` formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect.
- **Debt checks**: in `.lint/` at the root. The scripts `layers` and `crap` of each project point there.

## Blueprint

<!-- Copied as written from the root AGENTS.md of the work system (AIDDbot Halloween 0.4). Never change it here: change it in AIDDbot and copy it again. -->

All projects obey these principles. Each project `AGENTS.md` gives its architecture (containers, layers, tests), its data and the limits that its archetype changes. Do not explore the code to learn the setup. First make it work, then make it correct: only the pre-commit hook of the technology (lint and format) and `test` (the unit tests, and the acceptance suite of `e2e`) block a delivery, and a security finding gets one repair first. Any other violation is debt.

### Code

- Limits: `crap` checks `.lint/complexity*.json`; `layers` checks 16 entries in a folder. A framework callback (such as a middleware) goes in `core/{concern}.middleware.ts`, never a lint comment or an exception in `.lint/`. A folder over the limit: divide it by concern.
- One type for each domain concept, never a bare primitive. Generic types in `shared`, domain types in their feature.
- `shared` has one function to check, convert or format each common type: look there before you write one.
- One source for each definition: a default, an option, a usage text or a list of names is data in one place. Never parse a display text to get the data again.
- Catch errors only at the edges: the error handler of `core`, and `data` when it changes an external failure into the expected error.
- No check, limit or default value that the spec does not state.

## Archetype gate

Changes pass the archetype gate of [the Builder](https://github.com/AIDDbot/archetype-builder/blob/main/seed.md).

## Versions

- The root `package.json` has the `major.minor` and the `codename` of the AIDDbot release that pins this repository. This repository releases its patches on its own.
- Each version has a tag `v{version}`. Never move a published tag.

## Git

- MANDATORY: Preserve work; no secrets; no destructive commands.
- Conventional commits: `{feat|refactor|fix|chore|docs|test}({project}): {description}`.
- One archetype change in each commit, with the gate green.
