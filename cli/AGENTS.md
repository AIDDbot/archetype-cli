# cli — cli

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: local commands and the local SQLite store.
- **Never**: start a server or read the acceptance suite.

## 2 · Technology

- **Runtime / framework**: no framework. Use the Common stack of the root `AGENTS.md`.
- **Main dependencies**: `node:util` — argument parser; `node:sqlite` — local SQLite.

## 3 · Tooling

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `unit` | Yes | `npm test` | node --test |
| `start` | No | `n/a` | No server. Run commands with `npm start -- <arguments>`. |
| `acceptance` | Yes | `n/a` | The e2e project owns acceptance. |

## 4 · Architecture

**Services of `core`**: registration arguments, contracts in `src/shared/database/` and `src/shared/output/`.

| Item | cli |
| --- | --- |
| composition | executable entry and explicit manifest |
| `core` | argument parser, configuration, database connection, migrations, output and error handler |
| features | commands |
| `presentation` | command and its registration |
| `logic` | service |
| `data` | SQLite repository |
| `shared` concerns | `database`, `output` |
| `unit` / `start` / `acceptance` | yes / n/a: no server / through e2e |

## 5 · Folder structure

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `src/app.main.ts`, `src/app.compose.ts`, `src/features/features.manifest.ts` | Plain functions and an explicit list. |
| `core` | `src/core/` | Plain functions. |
| features | `src/features/{feature}/` | One flat folder for each command. |
| facade | `src/features/{feature}/{feature}.api.ts` | Public functions and types, when needed. |
| `presentation` / `logic` / `data` / types | `*.command.ts` / `*.service.ts` / `*.repository.ts` / `*.type.ts`, `*.value.ts` | Plain TypeScript modules. |
| `shared` | `src/shared/`, `src/shared/{concern}/` | Primitives and service contracts. |
| unit tests | Beside the tested module: `*.test.ts`. | Node.js test runner. |

```text
src/
├── app.main.ts
├── app.compose.ts
├── core/
├── features/
│   ├── features.manifest.ts
│   └── health/
└── shared/
```

### Shared primitives

The index of `shared`. Read it before you write a check or a conversion. Helpers of one feature follow `src/shared/{feature}.{role}.ts` and have no row.

| Primitive | Contract | Path |
| --- | --- | --- |
| `parseInteger(value, field, range)` | Integer in `range`, or an expected error with the field and range. | `src/shared/numbers.parse.ts` |
| `requireText(value, field)` | Text without end spaces, or an expected error with the field. | `src/shared/text.check.ts` |
| `isRecord(value)` | True for a key-value object. | `src/shared/types.check.ts` |
| `readSetting(name, fallback, parse)` | The parsed setting or its fallback. An invalid value stops startup. | `src/shared/settings.read.ts` |
| `fail(message)` | Write `error: <message>` to standard error and stop with exit code 1. | `src/shared/output/error.write.ts` |

## 6 · Coding rules

### Technology rules

- The lint configuration contains the foundation import-boundary overrides.
- Read arguments with `node:util` `parseArgs`. An argument has priority over an environment variable.
- Read `DATABASE_URL` once in `core`. Resolve a relative path from the project folder.
- Keep migrations in `migrations/`. Name each file `0001-{name}.sql`. Apply each missing migration in one transaction.
- The composition gives database and output contracts to command registrations. Features never import `core`.

### Project rules

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

- **Needs**: local file system for SQLite.
- **Gives to**: e2e, through process arguments, standard output, standard error and exit code.
- **Port**: n/a. The CLI has no server.
- **Environment variables**: `DATABASE_URL` — SQLite path, default `./data/cli.sqlite`.
