---
id: S0002
slug: platform
key: S0002-platform
type: chore
branch: chore/S0002-platform
domain: foundation
---
# S0002-platform — Platform

## Problem

Each project must start in the same way in each environment, with its settings outside the code, and the operator must see what occurred when a failure occurs. Each later spec must use these services, never make its own.

### User Stories

- As a user, I want **to set the `cli` with an option, an environment variable or a configuration file, and an incorrect setting to stop it before it does the command** so that it never runs with an incomplete configuration.
- As an operator, I want **one short log line for each command and each error, in a daily file** so that I can find the cause of a failure.

### Business rules

- Each setting must have a documented default and a check. A relative path in a setting starts at the project folder, never at the working directory.
- An invocation must stop cleanly: it must not lose a log line.
- A log line must be plain text that a person can read, never JSON. A log line or a console line must never contain a password, a token or a form value.
- An error must not show internal details.

### Out of context

- What a person sees: the `error:` line of the `cli` and the contract tests (`shell`), the `config` command (`settings`).
- The management of secrets. Metrics, tracing, log shipping, rate limits. Log rotation, other than one file for each day.

## Solution

### All projects

- Each file of `core` is in the folder of its concern, from the closed list of `core` folders of `project-types.md` (section 3), with its unit test: `lifecycle/`, `settings/`, `logging/`, `arguments/`. Only the entry `main` is at the root of `src`: it gives the manifest and the identity to `start` of `core/lifecycle/`, which composes the application, starts it and stops it.
- An example environment file lists each variable and its default.
- Settings of the `cli`: `CONFIG_FILE` (`./config.json`), `LOG_DIR` (`./logs`), `LOG_LEVEL` (`info`). The check of each setting: a path (`CONFIG_FILE`, `LOG_DIR`, `CLI_DIRECTORY`) or a command (`CLI_START`) is not empty; `LOG_LEVEL` is one of `debug`, `info`, `warn`, `error`. A setting that a feature adds has its own check. A unit test of `core` proves each check with its list of values: the invalid ones and each limit.
- Logger in `core/logging/`, contract in `shared/logging/`: one line for each event in `{LOG_DIR}/{yyyy-mm-dd}.log`, with the columns `time source LEVEL message` (local time `HH:MM:SS.mmm`; `source` is the project name), ` | ` for line breaks, `WARN` and `ERROR` also to standard error. `LOG_LEVEL` filters each line below it. It never blocks the work, and writes each queued line before the stop. A failed write never stops the project: that line goes to standard error, and the next lines go on. The logger reads `LOG_DIR` and `LOG_LEVEL` only through their definitions, also before the configuration loads, so that a failure at startup has a log line. An invalid `LOG_DIR` writes no file; an invalid `LOG_LEVEL` takes its fallback. The file of each line comes from the time of that line, never from the time of the start: after midnight, the next line goes to the file of the new day. A unit test of `core` proves the format, the filter, the change of day and the stop, with the clock and the life cycle as arguments.
- The expected error of the Bedrock (`shared/expected.error.ts`) has a kind, a message and optional `fields`; `platform` gives each kind its exit code or status. Each check of a setting uses the primitives of `shared/values/`, never one of its own.

### cli

- A local cli: no server; each invocation does one command and stops. No database: a spec that stores data adds it.
- Sources, in this order: the option `--{name}` (such as `--config-file`), the variable `{NAME}`, the key `{NAME}` of the configuration file, the default. `CONFIG_FILE` never comes from the file. A unit test of `core` proves the order with the sources as arguments.
- `core` parses the arguments one time, in one function, from options as data: each setting gives its option. A later spec adds its options to that parse, never a second parse.
- The settings contract is in `shared/settings/`, with `readSetting`. A configuration file that is not a valid JSON object is an `unavailable` error with its path.
- The expected error gives each kind its exit code: `rule` (1), `usage` (2) or `unavailable` (3). `core` catches each failure at the top level and is the only code that makes an exit code. An unexpected failure writes `error: Unexpected failure`, exit code 1, and logs its cause. Never a stack trace on the console. A unit test of `core` proves it: no test injects a failure into the `cli` process.
- One log line for each invocation: the command, the exit code and the duration in whole milliseconds with `formatMilliseconds` (`12ms`), with no argument value; `ERROR` for exit code 3, `WARN` for 1 and 2, `INFO` for 0.
- Results go to standard output; messages and errors go to standard error.

### e2e

- `core` reads `CLI_DIRECTORY` (`../cli`) and `CLI_START` (the command of the `start` slot, run directly and never through npm). An invalid value stops the suite. No server and no preflight.
- A helper in `shared` runs one `cli` invocation, with the environment and arguments of the test. It gives each test a temporary folder, and each setting that is a path points into it: a folder setting (`LOG_DIR`) is a folder there, and a file setting (`CONFIG_FILE`) is a file there, never the folder itself. After the test, it stops each process that it started, waits until each one has ended, and deletes the folders with retries. No test writes a file inside the repository.
- Helpers in `shared` check the `error:` line and the exit code of the `cli`.
- No acceptance test in this spec: the suite is ready for the contract tests of `shell`. Checked by `review-implementation`.

## Verification

### Requirements

None: a `chore` changes nothing that a person or a client sees. The unit tests of `core` prove each check, format and order with its list of values; the review checks the rules of this spec; the regression of the release runs all the tests. The contract tests of `shell` prove the wiring.

### Expected URLs and APIs

None.
