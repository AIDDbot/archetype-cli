# Model schema — Archetype CLI

## Entity-Relationship diagram

The system has no domain entity or relation.

## Entities

The CLI owns one local configuration file. It stores setting names and values as a JSON object.

## Settings

| Setting | Default | Check |
| --- | --- | --- |
| `CONFIG_FILE` | `./config.json` | A path with a character that is not a space. |
| `LOG_DIR` | `./logs` | A path with a character that is not a space. |
| `LOG_LEVEL` | `info` | One of `debug`, `info`, `warn`, or `error`. |

The CLI selects each value from the argument, environment, file, then default. `CONFIG_FILE` ignores the file source. A relative path starts at the CLI project folder.

`config get` shows each selected value and its source. `config get <name>` shows one value. `config set <name> <value>` checks the value before it writes the file.

The acceptance suite reads `CLI_DIRECTORY` and `CLI_START` from the environment. Their defaults are `../cli` and `node src/app.main.ts`. Each value must contain a character that is not a space. A relative `CLI_DIRECTORY` starts at the acceptance project folder.

## Monitoring

The CLI writes plain-text invocation records to `{LOG_DIR}/{yyyy-mm-dd}.log`. Each record has the local time, source `cli`, level, command, exit code, and duration in milliseconds. Records omit argument values. `LOG_LEVEL` filters records. The CLI writes queued records before it stops.

The exit code is 0 for success, 1 for a rejected rule, 2 for incorrect usage, and 3 for an unavailable setting or resource. The invocation level is `INFO`, `WARN`, `WARN`, and `ERROR`, respectively.

Results use standard output. Errors and console records at `WARN` or `ERROR` use standard error. Errors have the prefix `error:`. Unexpected failures return code 1 and the message `Unexpected failure`. Their records name only a safe exception class.

## Shell

The application reads its name, description, author, website, and version from its own `package.json`, a copy of the identity of the root `package.json`.

Each feature registers its command name, summary, usage, operations, and options. Help lists the registrations in manifest order. The shell parses options once. It accepts help, JSON, version, and setting options before the command.

Commands return result data and a typed list or record view, or scalar text. The shell writes the selected format. With `--json`, standard output contains one JSON object. A failure returns `{ "error": "<message>" }` and its exit code. Standard error stays empty in JSON mode.

`config get --json` returns a `settings` array. A named setting returns one object with `name`, `value`, and `source`.

## Presentation

Shared primitives format lists, records, empty states, and values. A record has one `{label}: {value}` line for each fact. Its values start in the same column. A list has aligned columns. An empty list shows `No {records}.`.

`config get` shows the columns `Setting`, `Value`, and `Source`. `about` uses the record view. Their JSON data keeps its declared shape.

Human values use local dates and readable duration units. Machine values use ISO 8601 dates and milliseconds. The acceptance suite has shared readers for tables and records.

## About

`--version` writes only the root identity version and one line break. It uses text even with `--json`.

`about` shows the application name, description, version, author, website, and the technology of each project. It reads the shared identity. When the author is absent, it uses `AIDDbot` and `https://aiddbot.com`.

`about --json` returns `name`, `description`, `version`, `author`, `homepage`, and a `projects` array. Each project has `name`, `type`, and `technologies`. The feature holds the technology list as a constant. Both projects use TypeScript 7, Node.js, Node.js standard library, framework-free, Vite+, and Vitest.

---

> last updated: 2026-10-17T10:50:40Z
