# Archetype CLI — e2e

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: the acceptance suite. Each test proves one requirement of `.product/specs/` through the commands of the `cli`.
- **Never**: an import of the code of the `cli`, or a unit test.

## 2 · Technology

The Common stack of the root `AGENTS.md`. Vitest runs the suite; the `cli` runs as a process.

## 3 · Tooling

| Slot | Blocks | Command |
| --- | --- | --- |
| `test` | Yes | `npm test`: the full suite, the acceptance evidence |
| `test:spec` | Yes | `npm run test:spec`: the core adds the tag, such as `@S0002-` |
| `start` | No | `npm start`: watch mode, for a human only |
| `layers` | No | `npm run layers` |
| `crap` | No | `npm run crap` |
| `upgrade` | No | `npm --prefix ../.. run upgrade` |

## 4 · Architecture

| Item | `e2e` |
| --- | --- |
| entry | `vite.config.ts`: it checks the settings of the suite before the first test |
| `core` | the settings check |
| features | one folder for each feature of the system, with `*.cli.spec.ts` |
| `shared` | `projects/` (the settings and the client of the `cli`), `test-data/`, the readers of tables and records |

## 5 · Folder structure

```text
core/          # life cycle of the suite
features/      # {feature}/*.cli.spec.ts
shared/        # projects/, test-data/, readers
```

### Shared primitives

| Primitive | Contract | Path |
| --- | --- | --- |
| `createCliSetup()` | A function that gives each test its own `cli`: a temporary configuration file and log folder, deleted after the test. `cli.run(args, options)` returns the exit code, `stdout` and `stderr`; `cli.copy()` gives a copy of the project for a test of the defaults. | `shared/projects/setup.ts`, `shared/projects/cli.ts` |
| `expectFailure(result, code)` | The exit code and one `error:` line on standard error. | `shared/projects/failure.ts` |
| `runJson(cli, args)` | One invocation with `--json`, and its parsed data. | `shared/projects/json.ts` |
| `readTable(text)`, `readRecord(text)` | The rows of a text table by column name, and the facts of a record. | `shared/table.read.ts`, `shared/record.read.ts` |

## 6 · Coding rules

### Technology rules

The Common stack of the root `AGENTS.md`.

### Project rules

- The tag of each requirement goes in the title of its test (`"@S0002-R01 …"`). A test keeps the tags of other specs.
- No test writes a file inside the repository: each path comes from the helper.

## 7 · Connections

- **Needs**: the `cli`, through its `start` command.
- **Gives to**: none.
- **Port**: n/a: no network server.
- **Environment variables**: `CLI_DIRECTORY` (`../cli`) and `CLI_START` (`node src/app.main.ts`, without npm; a value with npm ends in `--`). An invalid value stops the suite.
