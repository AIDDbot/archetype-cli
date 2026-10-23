# Archetype CLI — cli

## Purpose

- **Owns**: Local command execution and local settings.
- **Never**: A server or user accounts.

## Technology

- **Stack**: TypeScript 7; Node.js 26, no framework; npm 12.
- **Dependencies**: Node.js — runtime; workspace Vite+ — format, lint, types and Vitest; workspace `@vitest/coverage-v8` — coverage; workspace `@types/node` — Node.js types. No other dependency unless a spec names it.
- **Slots**: `test` `npm test`; `test:spec` n/a: no acceptance tests; `start` `node src/app.main.ts`; `layers` `npm run layers`; `crap` `npm run crap`; `upgrade` `npm --prefix ../.. run upgrade`.

## Folders

| Concept | Path | Mechanism |
| --- | --- | --- |
| composition | `src/app.main.ts`, `src/features/features.manifest.ts`, `src/core/lifecycle/app.compose.ts` | Explicit manifest and identity arguments |
| `core` | `src/core/{concern}/{topic}.{role}.ts`; folders: `lifecycle/`, `settings/`, `logging/`, `arguments/`, `output/` | Plain TypeScript |
| features | `src/features/{feature}/` | Commands and registrations |
| facade | `src/features/{feature}/{feature}.api.ts` | Named exports |
| `presentation` / `logic` / `data` / types | `*.command.ts`, `*.routes.ts` / `*.service.ts` / `*.repository.ts` / `*.type.ts` | Plain TypeScript |
| `shared` | `src/shared/`; folders: `values/`, `settings/`, `logging/`, `output/`; index: `src/shared/README.md` | Bedrock primitives and service contracts |
| services of `core` | Registration arguments; contracts in `src/shared/{concern}/*.contract.ts` | Explicit injection |
| imports out of a folder | `#shared/*`, `#core/*` for core and composition, `#api/{feature}` for facades | Package imports; no parent imports |
| unit tests | Beside their module, `*.test.ts` | Vitest |

## Platform

- **Needs**: Node.js. **Gives to**: The local operator and `e2e`.
- **Port**: n/a: local invocation. **Variables**: `CONFIG_FILE`, `LOG_DIR`, `LOG_LEVEL`; defaults in `.env.example`.
- `src/core/lifecycle/`: Compose the manifest and identity; run one invocation, map errors to exit codes, classify unexpected errors with safe built-in categories, validate registered command input before help or execution, select failure and log output from parsed options, write the supplied version as plain text, and flush logs.
- `src/core/settings/`: Define, check, read and write settings; report their sources and resolve paths from the project folder. Write configuration to a temporary sibling before replacement; preserve the original if persistence fails.
- `src/core/arguments/`: Parse setting, shell and registration options one time with `node:util`; publish parsed options before token validation, including the global version flag.
- `src/core/output/`: Build help from identity, registrations and setting definitions, including the version option; render command data and typed shared list or record views as text or JSON.
- `src/core/logging/`: Queue plain text log lines and write one local file for each day.

| Setting | Default | Check |
| --- | --- | --- |
| `CONFIG_FILE` | `./config.json` | Non-empty path; an absent file gives no file settings |
| `LOG_DIR` | `./logs` | Non-empty path |
| `LOG_LEVEL` | `info` | `debug`, `info`, `warn`, `error` |

Options take precedence over environment variables, file keys and defaults. `CONFIG_FILE` never comes from the file. Relative paths start at this project folder.

## Project rules

- Run TypeScript directly with Node.js; use erasable syntax only.
- Parse command arguments with `node:util` `parseArgs` when the platform spec adds them.
- The manifest contains explicit feature registration functions. Each registration returns typed command data and result data.
- Text results use standard output. Text errors and urgent logs use standard error. JSON results and failures use standard output only.
- `shared/output/command.contract.ts` defines command registrations, typed options, operations and result data. Typed views use `shared/output/view.contract.ts`; `view.render.ts` renders them. `options.read.ts` reads form fields through supplied value parsers. `shared/values/presentation.value.ts` defines readable and standard values.
- Command exit codes: success 0, rejected rule 1, usage 2, unavailable setting or resource 3.

