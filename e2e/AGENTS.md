# e2e — e2e

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: acceptance tests of the local CLI and the suite life cycle.
- **Never**: import CLI source modules or open a browser.

## 2 · Technology

- **Runtime / framework**: Playwright Test. Use the Common stack of the root `AGENTS.md`.
- **Main dependencies**: `@playwright/test` — acceptance runner; `node:child_process` — CLI invocations.

## 3 · Tooling

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `unit` | Yes | `npm run unit` | node --test, for suite core |
| `start` | No | `n/a` | No server. `npm start` opens the runner UI for a human. |
| `acceptance` | Yes | `npm test` | Playwright Test; forwards `--grep @S{nnnn}-` |

## 4 · Architecture

**Services of `core`**: runner configuration and fixtures, contracts in `shared/projects/`.

| Item | e2e |
| --- | --- |
| composition | n/a: the test runner is the entry |
| `core` | configuration and suite life cycle |
| features | tests, one folder for each feature of the system |
| `presentation` | n/a: no layers |
| `logic` | n/a: no layers |
| `data` | n/a: no layers |
| `shared` concerns | `projects`, `test-data` |
| `unit` / `start` / `acceptance` | yes: suite core / n/a: no server / yes |

## 5 · Folder structure

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| composition | `playwright.config.ts` | Test runner entry. No manifest. |
| `core` | `core/` | Suite settings and fixtures. |
| features | `features/{feature}/` | Playwright Test files. |
| facade | n/a | No layers. |
| `presentation` / `logic` / `data` / types | n/a | No layers. |
| `shared` | `shared/`, `shared/projects/`, `shared/test-data/` | Plain functions and runner fixtures. |
| unit tests | Beside the tested core module: `core/*.test.ts`. | Node.js test runner. |

```text
e2e/
├── playwright.config.ts
├── core/
├── features/
│   └── health/
└── shared/
    ├── projects/
    └── test-data/
```

### Shared primitives

The index of `shared`. Read it before you write a check or a conversion. Helpers of one feature follow `shared/test-data/{feature}.{role}.ts` and have no row.

| Primitive | Contract | Path |
| --- | --- | --- |
| `parseInteger(value, field, range)` | Integer in `range`, or an error with the field and range. | `shared/numbers.parse.ts` |
| `requireText(value, field)` | Text without end spaces, or an error with the field. | `shared/text.check.ts` |
| `isRecord(value)` | True for a key-value object. | `shared/types.check.ts` |
| `uniqueValue(prefix)` | A value that no other test run uses. | `shared/test-data/unique.make.ts` |
| `runCli(options)` | Run one CLI invocation. Return its standard output, standard error and exit code. | `shared/projects/cli.run.ts` |

## 6 · Coding rules

### Technology rules

- The lint configuration contains the e2e import-boundary overrides.
- The quality configuration uses the Blueprint test limits for every file.
- Run CLI acceptance files as `features/{feature}/*.cli.spec.ts`. There is no API or screen in this system.
- Use only runner fixtures. No test requests a browser fixture.
- Keep no browser project or web server in the runner configuration.
- Give each invocation a temporary database unless the test supplies one. Delete the temporary database after the invocation.
- Never inherit the runner's `DATABASE_URL` in a CLI invocation.
- Do not use retries or one worker to hide shared data.
- Forward acceptance filter arguments to Playwright Test.

### Project rules

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

- **Needs**: cli, through its npm start command.
- **Gives to**: no project. The suite returns verification evidence.
- **Port**: n/a. The CLI has no server.
- **Environment variables**: `CLI_DIRECTORY` — CLI project folder, default `../cli`; `CLI_START` — invocation command, default `npm start --`.
