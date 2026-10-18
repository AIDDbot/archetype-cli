# Archetype CLI — cli

Obey the Blueprint of the root `AGENTS.md`. This file gives the architecture and the data of this project. Do not explore the code to learn the setup.

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
| services of `core` | arguments of each registration, typed by the contracts in `src/shared/{concern}/` |

### Containers and layers

| Container | Is | Never |
| --- | --- | --- |
| `core` | The platform that the framework or the entry calls one time at startup: server or shell, router, connections, error handler, global styles. | Business rules. Imports of a feature. |
| `shared` | Generic elements with no domain, and the contracts of the services that features need (such as the logger, the HTTP client or the error type). Primitives at the root, other elements in folders by technical concern (`http`, `database`). | Domain words. Imports of `core` or of a feature. Folders `utils`, `helpers`, `common`, `misc`. |
| feature | One flat folder for one unit of business value. The role in each file name tells its layer. | Subfolders. Imports of `core`. Imports of a different feature, except its facade. |
| composition | The entry. It starts `core`, registers each feature by name in one explicit list (the manifest), and gives the features the services of `core` through the contracts of `shared`. The only part that knows `core` and the features. | Automatic discovery: folder scans, global decorators, file-based routers. |

- composition → `presentation` → `logic` → `data`. A different feature → `facade` → `logic`. A layer never skips the next one: only the registration creates `data` and gives it to `logic`. Types are not a layer: each layer can use types, `shared` and the facades of other features.
- `presentation`: input, output and the registration of the feature (route, page, command). No business rules. Only the composition imports it.
- `facade`: the public functions and types for other features. Only other features import it. A feature that gives nothing has no facade.
- `logic`: rules and decisions. It does not know how data is stored.
- `data`: all that the project reads or writes outside itself (database, remote API, files).
- A feature that the manifest loads on demand has no other import. Tests start the application through the composition, without a port.
- Unit tests prove `logic`, at least one for each business rule, with a fake `data`. They also prove `shared` and `core`. They are fast and independent, and touch no disk, database, network or process: the acceptance tests prove `data`. Each one sits beside its module, with the same name. The pre-commit hook runs the ones that a commit affects. A business rule without a unit test is debt.

## 5 · Folder structure

```text
src/
├── app.main.ts          # entry; app.compose.ts: composition
├── core/app.*.ts        # platform, with its unit tests
├── features/            # features.manifest.ts and one flat folder for each feature
└── shared/              # primitives at the root; errors/, output/, settings/
```

### Shared primitives

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
