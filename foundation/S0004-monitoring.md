---
id: S0004
slug: monitoring
key: S0004-monitoring
type: feat
branch: feat/S0004-monitoring
domain: foundation
---
# S0004-monitoring — Monitoring

## Problem

When a failure occurs, the operator must see what occurred. Each command must report failures in one shape.

### User Stories

- As an operator, I want **one short log line for each command and each error, in a daily file** so that I can find the cause of a failure.
- As a script author, I want **each `cli` failure on standard error with an exit code that tells its kind** so that a script can react to it.

### Business rules

- A log line must be plain text that a person can read, never JSON.
- An error must not show internal details.
- A log line or a console line must never contain a password, a token or a form value.
- The exit code of a `cli` must be 0 for a success, 1 for a rule that rejects the input, 2 for an incorrect usage, and 3 for a missing configuration or resource.

### Out of context

- The answer to an unknown command, and the `--json` output (`shell`).
- Metrics, tracing, log shipping, rate limits. Log rotation, other than one file for each day.
- Servers, API responses and browser clients.

## Solution

### cli

- Logger in `core`, contract in `shared`: one line for each event, ` | ` for line breaks, `WARN` and `ERROR` to standard error. It never blocks a command, and writes each queued line before the stop.
- The logger reads `LOG_DIR` and `LOG_LEVEL`: `configuration` declares them, with their checks. No new setting is needed.
- The `source` column of a log line is the project name, `cli`.
- The expected error of `shared`, a seed of the scaffold, gives each kind its exit code: `rule` (1), `usage` (2) or `unavailable` (3). In `config set`, an unknown setting is `usage` and an invalid value is `rule`; an invalid setting or a configuration file that does not open is `unavailable`.
- `core` catches each failure at the top level and is the only code that makes an exit code. An unexpected failure writes `error: Unexpected failure`, exit code 1, and logs its cause. Never a stack trace on the console. No public command can cause an unexpected failure: a unit test of `core` proves it, never an acceptance test, and no test injects a failure into the `cli` process.
- Results go to standard output; messages and errors go to standard error.
- Unit tests prove line-break conversion and the unexpected-failure path with injected services.

### e2e

- Helpers in `shared` check the `error:` line and exit code of the `cli`. All tests use them.
- Each test uses its own log directory. Tests read the log after the invocation stops, to prove that queued lines reach the daily file before the stop.

## Verification

### Requirements

- **R01**: WHEN a `cli` invocation completes, the `cli` SHALL add one plain-text line to `{LOG_DIR}/{yyyy-mm-dd}.log` with the columns `time source LEVEL message`, separated by spaces. The `time` SHALL be the local time of day `HH:MM:SS.mmm`. The message SHALL contain the command, the exit code and the duration in milliseconds, and no argument value. Test: give a setting as an argument; read the daily file after exit and check that the line does not contain its value. Tag: `@S0004-R01`.
- **R02**: WHEN an invocation completes, the `cli` SHALL log it at level `ERROR` for exit code 3, at `WARN` for exit codes 1 and 2, and at `INFO` for exit code 0. Test: run one invocation for each exit code and check its daily log level. Tag: `@S0004-R02`.
- **R03**: WHILE `LOG_LEVEL` is set, the `cli` SHALL write no log line below that level. Test: with `LOG_LEVEL=warn`, a success writes no log line. Tag: `@S0004-R03`.
- **R04**: IF a `cli` command rejects its input by a rule, THEN the `cli` SHALL write `error: <message>` to standard error and stop with exit code 1. Test: `config set LOG_LEVEL loud`. Tag: `@S0004-R04`.
- **R05**: IF a `cli` invocation has an option that its command does not know, THEN the `cli` SHALL write `error: <message>` with the name of that option to standard error and stop with exit code 2. Test: `config get --no-such-option`. Tag: `@S0004-R05`.
- **R06**: IF a setting of the `cli` is not valid, or the `cli` cannot open its configuration file, THEN the `cli` SHALL write `error: <message>` with the setting or the resource to standard error and stop with exit code 3. Test: give `CONFIG_FILE` a path that is a folder; also select an invalid `LOG_LEVEL` from the environment. Tag: `@S0004-R06`.
- **R07**: IF `config set` gets an unknown setting, THEN the `cli` SHALL write `error: <message>` to standard error and stop with exit code 2. Test: `config set NO_SUCH_SETTING value`. Tag: `@S0004-R07`.
- **R08**: WHEN the `cli` returns a result, it SHALL write the result to standard output. WHEN it writes a message, an error or a log line at `WARN` or `ERROR` to the console, it SHALL use standard error. Test: check the value on standard output for `config get LOG_LEVEL`; check an invalid value has an empty standard output and its error and warning on standard error. Tag: `@S0004-R08`.
- **R09**: WHEN the `cli` writes a log line or an error to the console, it SHALL omit passwords, tokens, argument values and stack traces. Test: reject a distinctive value in `config set LOG_LEVEL`; check that neither standard error nor the daily log contains that value or a stack trace. Tag: `@S0004-R09`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | any command | One log line for each invocation, subject to `LOG_LEVEL`. Results on standard output; messages on standard error. | R01, R02, R03, R08, R09 |
| command | cli | `config set LOG_LEVEL {incorrect}` | `error: <message>`. Exit code 1. | R04, R08, R09 |
| command | cli | `config get --no-such-option` | `error: <message>`. Exit code 2. | R05 |
| command | cli | any command with a configuration file that does not open, or an invalid selected setting | `error: <message>`. Exit code 3. | R06 |
| command | cli | `config set {unknown} <value>` | `error: <message>`. Exit code 2. | R07 |
