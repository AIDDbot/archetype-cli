---
id: S0006
slug: shell
key: S0006-shell
type: feat
branch: feat/S0006-shell
domain: foundation
---
# S0006-shell — Shell

## Problem

The CLI must have one frame that each feature uses. Users need one way to find the commands and one answer to an unknown command. Each later feature must add to the frame without a change to it.

### User Stories

- As a user of the `cli`, I want **help for each command, and help when I type a command that does not exist** so that I learn the commands without the documentation.
- As a script author or an agent, I want **each `cli` result as one JSON object** so that I read it with no text parser.
- As an owner, I want **the name and the description of the application in one location** so that I change them one time.

### Business rules

- The identity of the application (name, description, author, website and version) must come from the root `package.json`, and each project must keep it in one location only.
- The shell must know no feature. Each feature must add its own commands through its registration.

### Out of context

- The commands of the features. The version (`about`).
- Translation. Shell completion for the `cli`.
- API and browser interfaces.

## Solution

### All projects

- One identity file in `shared` reads `displayName` (or `name`), `description`, `author`, `homepage` and `version` from the root `package.json`. Nothing copies them by hand.

### cli

- Each command registration gives its name, summary, usage, operations and options. An option is typed data (name, value placeholder, summary, default), never a help text that code parses again. The help comes from the registrations, in the order of the manifest, and from the setting definitions of `configuration`: nothing copies them by hand.
- `core` adds the options of each registration to the one parse of `configuration`, never a second parse, then runs one pipeline: parse, run, render, report, each in its own function. It reads `--help`, `--json` and the setting options before the command. An option that the command does not declare, or an argument that it does not take, is a `usage` error. A `usage` error of a command shows its declared usage.
- Output contract in `shared`: a command gives its result as data; `core` writes it as text, or as one JSON object with `--json`. A command never writes to the standard output itself.
- `config get` uses this contract: `{ "settings": [ { "name", "value", "source" } ] }`, or one `{ "name", "value", "source" }`.

### e2e

- A helper in `shared` runs one `cli` invocation with `--json` and returns the parsed object and the exit code.
- The tests read the expected identity from the root `package.json`, never from fixed text.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings, migrations and commands.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs with `--help`, with `help`, or with no command, it SHALL show the application name, the usage line, and each command with its one-line summary, and stop with exit code 0. Test: cover all three forms; read the expected name from the root `package.json`. Tag: `@S0006-R01`.
- **R02**: WHEN the `cli` runs `help <command>` or `<command> --help`, it SHALL show the usage of that command, with each operation and option and its summary, and stop with exit code 0. Test: cover both forms for `config`; check `get`, `set` and the setting options. Tag: `@S0006-R02`.
- **R03**: WHEN the `cli` runs a command that does not exist, it SHALL write `error: Unknown command: <name>` and the help of R01 to standard error, write nothing to standard output, and stop with exit code 2. Test: invoke a distinct unknown command; check its name, the help, both output streams and the exit code. Tag: `@S0006-R03`.
- **R04**: WHEN the `cli` runs a command with `--json`, it SHALL write one JSON object, and nothing else, to its standard output. Test: each command of the foundation; include `help`, `config get` and `config set`. Tag: `@S0006-R04`.
- **R05**: IF a command with `--json` fails, THEN the `cli` SHALL write `{ "error": "<message>" }` to standard output, nothing to standard error, and stop with the exit code of that failure. Test: cover an invalid setting value (1), an unknown command or option (2), and an unavailable configuration file (3). Tag: `@S0006-R05`.
- **R06**: WHEN the `cli` runs `help --json`, it SHALL write `{ "name": "<name>", "commands": [ { "name": "<command>", "summary": "<summary>", "usage": "<usage>" } ] }`. Test: read the name from the root `package.json`; check the `config` command and its summary and usage. Tag: `@S0006-R06`.
- **R07**: IF a command gets an option that it does not declare or an argument that it does not take, THEN the `cli` SHALL write `error: <message>` and the usage of that command to standard error, and stop with exit code 2. Test: one extra argument and one unknown option of a foundation command. Tag: `@S0006-R07`.
- **R08**: WHEN `--help`, `--json` or a setting option comes before the command, the `cli` SHALL apply that option to the command. Test: invoke `--help config`, `--json config get LOG_LEVEL`, and `--log-level debug config get LOG_LEVEL`; check command help, the JSON object, and the value from the argument source. Tag: `@S0006-R08`.
- **R09**: WHEN the `cli` runs `config get --json`, it SHALL write `{ "settings": [ { "name", "value", "source" } ] }`. WHEN it runs `config get <name> --json` with a known setting, it SHALL write one `{ "name", "value", "source" }`. Test: check each existing setting in the list and one named setting; check its selected value and source. Tag: `@S0006-R09`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `--help`, `help`, no command | Name, usage line, commands with summaries. Exit code 0. | R01 |
| command | cli | `help <command>`, `<command> --help` | Usage of the command. Exit code 0. | R02 |
| command | cli | `{unknown}` | `error: Unknown command: {unknown}` and the help. Exit code 2. | R03 |
| command | cli | `<command> --json` | One JSON object; on a failure, `{ "error": "<message>" }` with its exit code. | R04–R06 |
| command | cli | `<command> {extra-argument}`, `<command> --no-such-option` | `error: <message>` and the command usage on standard error. Exit code 2. | R07 |
| command | cli | `--help <command>`, `--json <command>`, `--log-level debug <command>` | The option applies to the command. | R08 |
| command | cli | `config get [<name>] --json` | A settings array, or one named setting, with each value and source. | R09 |
