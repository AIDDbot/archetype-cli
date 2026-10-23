---
id: S0003
slug: shell
key: S0003-shell
type: feat
branch: feat/S0003-shell
domain: foundation
---
# S0003-shell — Shell

## Problem

Each interface of the system must have one frame that each feature uses: the same way to find what the interface offers, the same answer to a command that does not exist, and each failure in one shape. Each later feature must add to the frame without a change to it.

### User Stories

- As a user of the `cli`, I want **help for each command, and help when I type a command that does not exist** so that I learn the commands without the documentation.
- As a script author or an agent, I want **each `cli` result as one JSON object, and each failure on standard error with an exit code that tells its kind** so that a script reads the result with no text parser and reacts to a failure.
- As an owner, I want **the name and the description of the application in the `package.json` of each project** so that I change them with no change of code.

### Business rules

- The identity of the application (name, description, author with website, and version) must come from the `package.json` of the project that shows it, and from no other location. Each field is required, with no fallback.
- The shell must know no feature. Each feature must add its own commands through its registration.
- The exit code of the `cli` must be 0 for a success, 1 for a rule that rejects the input, 2 for an incorrect usage, and 3 for a missing configuration or resource.

### Out of context

- The commands of the features. The version (`about`). The components of records, lists and forms (`presentation`).
- Each check, format and order of `platform`: its unit tests prove them with their lists of values. This spec proves only that they are connected.
- Translation. Shell completion for the `cli`.

## Solution

### All projects

- The `Identity` type at the root of `shared` names the fields of `.product/blueprint/ecosystems.md`: `displayName`, `description`, `author` (`name`, `url`) and `version`. It is a type only, with no function. Only the entry `main` imports the `package.json` of the project (`#package`), and gives it to `core` and to the features as an `Identity`. Thus a unit test gives its own identity: no test reads the file or mocks a module.

### cli

- Each command registration gives its name, summary, usage, operations and options. An option is typed data (name, value placeholder, summary, default), never a help text that code parses again. The help comes from the registrations, in the order of the manifest, and from the setting definitions of `platform`: nothing copies them by hand.
- `core` adds the options of each registration to the one parse of `platform`, never a second parse, then runs one pipeline: parse, run, render, report, each in its own function. It reads `--help`, `--json` and the setting options before the command. An option that the command does not declare, or an argument that it does not take, is a `usage` error. A `usage` error of a command shows its declared usage.
- Output contract in `shared/output/`: a command gives its result as data; `core` writes it as text, or as one JSON object with `--json`. A command never writes to the standard output itself.

### e2e

- A helper in `shared` runs one `cli` invocation with `--json` and returns the parsed object and the exit code.
- The tests check that the identity is there, never its values: the owner changes them. The application name and the description are text that is not empty, and the version is a semantic version. No test reads a `package.json` of another project.
- The contract tests (R04, R05) run one invocation each, with one value: the unit tests of `core` prove each check of a setting with its list of values.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings and commands.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs with `--help`, with `help`, or with no command, it SHALL show the application name, the usage line, and each command with its one-line summary; with `help <command>` or `<command> --help`, the usage of that command with each operation and option and its summary. It SHALL stop with exit code 0.
- **R02**: IF the `cli` runs a command that does not exist, or a command gets an option that it does not declare or an argument that it does not take, THEN it SHALL write `error: <message>` to standard error with the help of R01 or the usage of that command, write nothing to standard output, and stop with exit code 2. Test: one unknown command and one unknown option.
- **R03**: WHEN the `cli` runs a command with `--json`, it SHALL write one JSON object, and nothing else, to its standard output: for `help --json`, `{ "name": "<name>", "commands": [ { "name", "summary", "usage" } ] }`. IF the command fails, THEN it SHALL write `{ "error": "<message>" }` to standard output, nothing to standard error, and stop with the exit code of that failure.
- **R04**: IF a setting is not valid or the configuration file does not open, THEN the `cli` SHALL write `error: <message>` with the name of the setting or the path of the file to standard error, and stop with exit code 3. Test: `CONFIG_FILE` set to a folder.
- **R05**: WHEN the `cli` invocation completes, the `cli` SHALL add one line to the log of the day with the command and the exit code, with no argument value. Test: one invocation with a setting as an argument; the line does not contain its value.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `--help`, `help`, no command, `help <command>`, `<command> --help` | Name, usage line, commands with summaries, or the usage of one command. Exit code 0. | R01 |
| command | cli | `{unknown}`, an unknown option | `error: <message>` and the help or the usage. Exit code 2. | R02 |
| command | cli | `<command> --json` | One JSON object; on a failure, `{ "error": "<message>" }` with its exit code | R03 |
| command | cli | any command with an incorrect setting or configuration file | `error: <message>`. Exit code 3. | R04 |
| command | cli | any command | One log line for each invocation | R05 |
