# Project instructions

## Assistant

- Use the OS and the shell that your harness gives. When it gives none, find them before the first command.
- **Talk** in the language of the human — **Documents** in ASD-STE100, in English — **Code** in English
- When a request is ambiguous or incomplete, ask one closed question at a time (yes/no or pick-one).

## System

- **Problem**: New local command-line applications need a common foundation for commands, settings, logs and output.
- **Solution**: Archetype CLI supplies a local command-line application with its help, its JSON output, its settings in a file and its about command, with no business feature.
- **Verification**: Unit tests prove the internal rules; the acceptance suite proves each requirement through the public command interface.

| Project | Type | Path |
| --- | --- | --- |
| cli | cli | `projects/cli/`, with its `AGENTS.md` |
| e2e | e2e | `projects/e2e/`, with its `AGENTS.md` |

- **Folders**: the product folder is `.product/` (system, specs, model, PRD); the source folders are the paths above.
- **Model**: `.product/model/model.schema.md`. No project owns relational persistence or exposes endpoints.
- The system has no user accounts. `e2e` uses only the public command interface.

## Commands

- `npm test` runs the unit tests, and `npm run test:e2e` runs the acceptance suite. `npm run check` checks format, lint, types, `layers` and `crap` with no fix, and `npm run fix` applies the safe fixes. `npm start -- <command>` in `projects/cli/` runs one command.
- **Pre-commit hook**: `vp staged --relative` formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect. A failure stops the commit.

## Git

- MANDATORY: Preserve work; no secrets; no destructive commands.
- Conventional commits: `{feat|refactor|fix|chore|docs|test}(scope): {description}`. Work on a branch, never on `main`.
