---
id: S0002
slug: configuration
key: S0002-configuration
type: feat
branch: feat/S0002-configuration
domain: foundation
---
# S0002-configuration — Configuration

## Problem

Each project must start in the same way in each environment, with its settings outside the code.

### User Stories

- As an operator, I want **to set each project with environment variables** so that one build operates in each environment.
- As a developer, I want **an incorrect setting to stop the project when it starts** so that I never examine a system with an incomplete configuration.
- As a user of the `cli`, I want **to keep my settings in a file and change them with a command** so that I do not type them at each invocation.

### Business rules

- Each setting must have a documented default.
- A project must stop cleanly: it must not lose a log line.
- The `cli` must read each setting from the first source that has it: argument, environment, configuration file, default.

### Out of context

- The log, the error format and the exit codes (`monitoring`). The version (`about`).
- The management of secrets.
- A server, database or API client.

## Solution

### cli

- A local cli: no server; each invocation does one command and stops. No database: a spec that stores data adds it.
- Settings: `CONFIG_FILE` (`./config.json`), `LOG_DIR` (`./logs`), and `LOG_LEVEL` (`debug`, `info`, `warn`, `error`; `info`). One list of settings in `core` (name, default, check); a feature adds its settings there.
- Sources: the option `--{name}` (such as `--config-file`), the variable `{NAME}`, the key `{NAME}` of the configuration file, the default. `CONFIG_FILE` never comes from the file.
- `core` parses the arguments one time, in one function, from options as data: each setting gives its option. A later spec adds its options to that parse, never a second parse.
- Feature `config`, with the operations `get` and `set`, through the settings contract of `shared`. `set` checks the value before it writes.

### e2e

- `core` reads `CLI_DIRECTORY` (`../cli`, the sibling folder of the project) and `CLI_START` (`node src/app.main.ts`, the command of the `start` slot of `cli` without npm, which adds about half a second to each invocation; a value with npm ends in `--`). An invalid value stops the suite. Checked by `review-implementation`, never by an acceptance test: no test runs the suite, and `e2e` has no unit tests.
- The `cli` has no preflight.
- A helper in `shared` runs one `cli` invocation, with the environment and arguments of the test. It gives each test its own temporary configuration file, which all the invocations of that test share, and deletes it after the test. A test that needs a clean one makes a second helper. A test that copies the `cli` project to a temporary folder, such as for relative paths, copies only that project: its own `package.json` has the identity.
- A test checks what its spec adds and the order that it needs, never that nothing else exists: later specs add settings and commands.

### All projects

- An example environment file lists each variable and its default.
- A relative path in a setting starts at the project folder, never at the working directory.
- The check of each setting: a path (`CONFIG_FILE`, `LOG_DIR`, `CLI_DIRECTORY`) or a command (`CLI_START`) is not empty; `LOG_LEVEL` is one of its four values. A setting that a feature adds has its own check.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs `config set <name> <value>` with a known setting and a valid value, it SHALL write the value to its configuration file and stop with exit code 0. The next invocation SHALL use that value. Test: set `LOG_LEVEL`, then read it in a separate invocation with the same file.
- **R02**: IF `config set` gets an unknown setting or a value that is not valid for that setting, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the name of the setting, and SHALL not change the configuration file. Test: cover an unknown name, an invalid `LOG_LEVEL`, and empty path values; compare the file before and after each failure.
- **R03**: WHEN the `cli` runs `config get`, it SHALL show each setting with its value and its source: `argument`, `environment`, `file` or `default`. Test: check `CONFIG_FILE`, `LOG_DIR` and `LOG_LEVEL` with their values and sources; never the whole list or its order, because later specs add settings. With no override, check the defaults `./config.json`, `./logs` and `info`; a resolved path may be absolute.
- **R04**: WHEN the `cli` runs `config get <name>` with a known setting, it SHALL show only the value of that setting. Test: read each setting by name.
- **R05**: WHEN a setting has a value in more than one source, the `cli` SHALL use the value of the first source in this order: argument, environment, configuration file, default. Test: give `LOG_LEVEL` three values, then remove the argument and then the variable; remove the file value to prove the default.
- **R06**: IF the configuration file is not a valid JSON object, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the path of the file. Test: cover malformed JSON and a valid JSON array.
- **R07**: WHEN the `cli` uses a relative `CONFIG_FILE` or `LOG_DIR`, it SHALL resolve the path from its project folder. Test: invoke a temporary copy from a different working directory; prove the file location and the resolved log path through `config get`.
- **R08**: IF a selected setting value from an argument, the environment or the configuration file is not valid, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains the setting name. Test: cover each source with an invalid `LOG_LEVEL`; cover empty `CONFIG_FILE` and `LOG_DIR` values in their applicable sources.
- **R09**: WHEN the configuration file has a `CONFIG_FILE` key, the `cli` SHALL select its configuration file only from the argument, the environment or the default. Test: give the selected file a `CONFIG_FILE` key that names a second file; prove that `config get CONFIG_FILE` and the other settings use the selected file.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `config set <name> <value>` | Writes the file. Exit code 0. An unknown name or an invalid value: the file does not change. | R01, R02 |
| command | cli | `config get [<name>]` | Each setting with its value and source, or the value of one setting. Sources follow the precedence order. | R03–R05, R07, R09 |
| process | cli | any command with an incorrect configuration file | Stops with a message that contains the path. | R06 |
| process | cli | any command with an incorrect setting | Stops with a message that contains the setting name. | R08 |
