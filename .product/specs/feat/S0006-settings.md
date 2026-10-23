---
id: S0006
slug: settings
key: S0006-settings
type: feat
branch: feat/S0006-settings
domain: foundation
---
# S0006-settings — Settings

## Problem

Each user of the `cli` must keep their settings, and change them with no change of code and no help.

### User Stories

- As a user of the `cli`, I want **to keep my settings in a file, see where each value comes from, and change them with a command** so that I do not type them at each invocation.

### Business rules

- A new value must pass the check of its setting before it is kept. A value that does not pass changes nothing.
- The `cli` must read each setting from the first source that has it: argument, environment, configuration file, default (`platform`).

### Out of context

- Translation. A configuration file for each folder or each user.

## Solution

### cli

- Feature `config`, with the operations `get` and `set`, through the settings contract of `platform`, with `readSetting`. `set` checks the value before it writes. An unknown setting is a `usage` error; an invalid value is a `rule` error.
- `config get` is a list view of `presentation` (columns `Setting`, `Value`, `Source`); with a name, only the value. Its JSON: `{ "settings": [ { "name", "value", "source" } ] }`, or one `{ "name", "value", "source" }`.

### e2e

- The tests of the `cli` use the temporary configuration file of the helper of `platform`.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs `config set <name> <value>` with a known setting and a valid value, it SHALL write the value to its configuration file, stop with exit code 0, and the next invocation SHALL use it. IF the setting is unknown, THEN it SHALL stop with exit code 2; IF the value is not valid, THEN with exit code 1. In both cases, it SHALL write a message that contains the name, and not change the file. Test: `config set LOG_LEVEL warn`, `config set NO_SUCH_SETTING x`, `config set LOG_LEVEL loud`.
- **R02**: WHEN the `cli` runs `config get`, it SHALL show a table with the columns `Setting`, `Value` and `Source` (`argument`, `environment`, `file` or `default`), with one row for each setting; with a name, only the value of that setting. Test: check each setting of the foundation, never the whole list or its order, because later specs add settings.
- **R03**: WHEN a setting has a value in more than one source, the `cli` SHALL show and use the first source in this order: argument, environment, configuration file, default. Test: give three values, then remove the argument and then the variable.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `config set <name> <value>` | Writes the file. Exit code 0. An unknown name: exit code 2. An invalid value: exit code 1. The file does not change. | R01 |
| command | cli | `config get [<name>]` | Table `Setting`, `Value`, `Source`, or the value of one setting | R02, R03 |
