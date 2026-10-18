# Archetype CLI — cli

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: one local invocation at a time, its settings, its output and its log.
- **Never**: a network server, a database or user accounts.

## 2 · Technology

The Common stack of the root `AGENTS.md`. Node.js runs `src/app.main.ts` with no build.

## 3 · Tooling

| Slot | Blocks | Command |
| --- | --- | --- |
| `test` | Yes | `npm test` |
| `test:spec` | n/a | n/a: no acceptance tests |
| `start` | No | `npm start -- {arguments}` |
| `layers` | No | `npm run layers` |
| `crap` | No | `npm run crap` |
| `upgrade` | No | `npm --prefix ../.. run upgrade` |

## 4 · Architecture

| Item | `cli` |
| --- | --- |
| composition | `app.main.ts` starts `app.compose.ts`: one argument parse, the settings, the logger, the manifest, the output |
| `core` | arguments (`parseArgs`), settings, configuration file, logger, life cycle and exit codes, help, output |
| features | `config` (`get`, `set`), `about`; `help` and `--version` are in `core` |
| `presentation` | `{feature}.command.ts`: the registration, with its options as data |
| `logic` | `{feature}.service.ts` |
| `data` | the configuration file, through `ConfigurationStorage` of `shared` |

**Services of `core`**: arguments of each registration, typed by the contracts in `src/shared/{concern}/`.

## 5 · Folder structure

```text
src/
├── app.main.ts          # entry
├── app.compose.ts       # composition
├── core/app.*.ts        # platform, with its unit tests
├── features/            # features.manifest.ts and one flat folder for each feature
└── shared/              # primitives at the root; errors/, output/, settings/
```

Unit tests sit beside their module as `*.test.ts`.

### Shared primitives

Read this index before you write a check, a conversion or a format.

| Primitive | Contract | Path |
| --- | --- | --- |
| `isRecord`, `isText`, `isOneOf` | Type guards for an object, a text with a character that is not a space, and a closed list. | `src/shared/checks.guard.ts` |
| `findByName`, `requireByName` | The item with a `name`; `require…` raises an expected error with the kind and the name. | `src/shared/checks.guard.ts` |
| `requireText`, `parseInteger` | Checked text or integer, or an expected error with the field. | `src/shared/text.parse.ts`, `src/shared/numbers.parse.ts` |
| `formatDate`, `formatTime`, `formatDateTime` | Local date, time of day and both, for logs and people. | `src/shared/dates.format.ts` |
| `ExpectedError(kind, message)` | `rule` (exit 1), `usage` (2) or `unavailable` (3). | `src/shared/errors/expected.error.ts` |
| `attempt(action, message)` | An external failure as `unavailable`. Only `core` and `data`. | `src/shared/errors/expected.error.ts` |
| `readSetting({ name, fallback, parse })` | The parsed value of the first source, or its fallback. | `src/shared/settings/read.setting.ts` |
| `CommandRegistration`, `CommandResult` | A command and its options as data; its result as data and a view or a text. | `src/shared/output/command.type.ts` |
| `View` (`list`, `record`), `formatView` | A typed table or facts, and their aligned text. | `src/shared/output/view.type.ts`, `src/shared/output/view.format.ts` |
| `formatValue`, `machineValue`, `emptyMessage` | A value for a person or for `--json`, and the text of an empty list. | `src/shared/output/values.format.ts`, `src/shared/output/states.format.ts` |
| `identity` | The name, description, author, website and version of the root `package.json`. | `src/shared/identity.ts` |

## 6 · Coding rules

### Technology rules

The Common stack of the root `AGENTS.md`.

### Project rules

- A command returns data and a view or a text; the composition writes it as text or as `--json`. A feature never writes to the console.
- Only the composition reads the environment and the arguments, and only through the setting definitions of `core`.

## 7 · Connections

- **Needs**: none.
- **Gives to**: `e2e`, through `start`.
- **Port**: n/a: no network server.
- **Environment variables**: `CONFIG_FILE` (`./config.json`), `LOG_DIR` (`./logs`), `LOG_LEVEL` (`info`). An argument (`--config-file`, `--log-dir`, `--log-level`) wins over the environment, and the environment over the file. Paths start at the project folder.
