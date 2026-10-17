
# Archetype CLI — cli

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: Local command invocations and local settings.
- **Never**: Serve a network API or manage user accounts.

## 2 · Technology

Use the Common stack of the root `AGENTS.md`.


## 3 · Tooling

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `test:spec` | Yes | n/a: no acceptance tests | Vite+ / npm |
| `crap` | No | `npm run crap:complexity`; `npm run crap:coverage` | Vite+ / npm |

## 4 · Architecture

**Services of `core`**: registration arguments, contracts in `src/shared/{concern}/`

| Item | `cli` |
| --- | --- |
| composition | executable entry and explicit manifest |
| `core` | Platform services. Later specs add them. |
| features | commands; none in the scaffold |
| `presentation` | command and registration |
| `logic` | service |
| `data` | repository / file system / API client |
| `shared` concerns | output |

## 5 · Folder structure

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `src/app.main.ts`, `src/app.compose.ts`, `src/features/features.manifest.ts` | Plain TypeScript |
| `core` | `src/core/app.{service}.ts`, such as `app.config.ts` | Plain TypeScript |
| features | `src/features/` | Plain TypeScript |
| facade | `features/{feature}/{feature}.api.ts` | Plain TypeScript |
| `presentation` / `logic` / `data` / types | `*.command.ts` / `*.service.ts` / `*.repository.ts, *.client.ts` / `*.type.ts, *.value.ts` | Plain TypeScript |
| `shared` | `src/shared/`, `src/shared/{concern}/` | Plain TypeScript |
| unit tests | `Beside the module, *.test.ts` | Plain TypeScript |

```text
src/
├── app.main.ts           # entry: starts the composition
├── app.compose.ts        # composition: starts core, registers the features
├── core/        # platform, called one time at startup
├── features/    # one flat folder for each feature, and the manifest
└── shared/      # primitives and service contracts at the root, folders by technical concern
```

### Shared primitives

The index of `shared`. Read it before you write a check or a conversion. Helpers of one feature follow `src/shared/{concern}/{topic}.{verb}.ts` and have no row.

| Primitive | Contract | Path |
| --- | --- | --- |
| `isRecord(value)` | True for a key-value object. Other type guards use it. | `src/shared/checks.guard.ts` |
| `isText(value)` | True for a text with a character that is not a space. | `src/shared/checks.guard.ts` |
| `isOneOf(value, options)` | True for one of a closed list of values; narrows the type. | `src/shared/checks.guard.ts` |
| `findByName(items, name)` | The item with that `name`, or nothing. | `src/shared/checks.guard.ts` |
| `requireByName(items, { name, kind })` | The item with that `name`, or an expected error that names the kind and the name. | `src/shared/checks.guard.ts` |
| `requireText(value, field)` | Text without end spaces, or an expected error with the field. | `src/shared/text.parse.ts` |
| `parseInteger(value, { field, min, max })` | Integer from `min` to `max`, or an expected error with the field and the range. | `src/shared/numbers.parse.ts` |
| `formatDate(date)` | `YYYY-MM-DD` in local time. | `src/shared/dates.format.ts` |
| `formatTime(date)` | `HH:MM:SS.mmm` in local time. | `src/shared/dates.format.ts` |
| `formatDateTime(date)` | `YYYY-MM-DD HH:MM:SS` in local time, for a person. | `src/shared/dates.format.ts` |
| `ExpectedError(kind, message)` | The expected error, with its kind: `rule`, `usage` or `unavailable`. Each failed check raises it; `monitoring` gives each kind its exit code or status. | `src/shared/errors/expected.error.ts` |
| `attempt(action, message)` | The result of `action`, or the expected error `unavailable` with `message` when an external resource fails. Only `data` and `core` use it. | `src/shared/errors/expected.error.ts` |
| `readSetting({ name, fallback, parse })` | The parsed value from the injected first source, or its fallback. An invalid value propagates. | `src/shared/settings/read.setting.ts` |
| list | Typed columns and rows. `formatView` writes an aligned table. | `src/shared/output/view.type.ts`, `src/shared/output/view.format.ts` |
| record | Typed facts. `formatView` aligns their values. | `src/shared/output/view.type.ts`, `src/shared/output/view.format.ts` |
| form | Shell option parsing names an invalid option. Business commands use the shell option contract. | `src/shared/output/command.type.ts` |
| states | `emptyMessage` names an empty list. Monitoring reports errors. | `src/shared/output/states.format.ts` |
| values | `formatValue` writes readable values. `machineValue` preserves standard values. | `src/shared/output/values.format.ts` |

## 6 · Coding rules

### Technology rules

The Common stack of the root `AGENTS.md` holds the technology rules.

### Project rules

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

- **Needs**: None.
- **Gives to**: None.
- **Port**: n/a: no network server.
- **Environment variables**: `None` — No environment setting exists in this scaffold.

