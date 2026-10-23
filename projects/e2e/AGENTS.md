# Archetype CLI acceptance — e2e

## Purpose

- **Owns**: Acceptance checks through the public command interface.
- **Never**: Application code, unit tests or direct persistence access.

## Technology

- **Stack**: TypeScript 7; Node.js 26; Vitest from Vite+; npm 12.
- **Dependencies**: Workspace Vite+ — format, lint, types and Vitest; workspace `@types/node` — Node.js types. No other dependency unless a spec names it.
- **Slots**: `test` `npm test`; `test:spec` `npm run test:spec --`; `start` `npm start`; `layers` `npm run layers`; `crap` `npm run crap`; `upgrade` `npm --prefix ../.. run upgrade`.

## Folders

| Concept | Path | Mechanism |
| --- | --- | --- |
| composition | `vite.config.ts` | Vitest runner |
| `core` | `core/{concern}/`; folders: `lifecycle/`, `settings/` | Suite setup and teardown |
| features | `features/{feature}/` | Acceptance tests, no layers |
| `shared` | `shared/`; folders: `values/`, `page-objects/`, `test-data/`, `projects/`; index: `shared/README.md` | Checks and public test helpers |
| imports out of a folder | `#shared/*` | Package imports; no parent imports |

## Platform

- **Needs**: The `cli` project through its start command. **Gives to**: Delivery acceptance evidence.
- **Port**: n/a: local commands. **Variables**: `CLI_DIRECTORY=../cli`, `CLI_START=node src/app.main.ts`; both must contain text. Relative paths start at this project folder. See `.env.example`.
- `core/settings/`: Check the CLI directory and start command; provide them to each worker through the suite setup.
- `shared/page-objects/output.read.ts`: Read aligned public text tables and records.
- `shared/projects/`: Start direct CLI processes, capture results, check public errors, and provide the `cli` fixture and JSON invocation helper. Shared checks assert public output contracts. `about.check.ts` checks identity records, JSON and version text.
- `shared/projects/config.check.ts`: Check settings tables, JSON values, text values and rejected changes. Invocation environment values can be unset with `undefined`.

## Project rules

- Put each requirement tag in its Vitest test title, as `@S0001-R01`.
- Start the CLI with its registered start command directly, without npm.
- Keep the runner parallel; each test creates unique data.
- `start` runs watch mode for a human only.
- Import `test` from `#shared/projects/cli.fixture.ts` to use the `cli` fixture. Each test gets a unique temporary folder with a configuration file and a log folder. Set any path override to a path in `cli.directory`.
- The fixture stops its own processes, waits for them and removes its folder with retries. No test writes a file in the repository.
- Shell acceptance tests are in `features/shell/`. Import public result checks from `shared/projects/`; the fixture test import is not a Vitest assertion block for the linter.

