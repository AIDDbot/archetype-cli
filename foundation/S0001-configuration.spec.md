# S0001-configuration — Configuration

## Problem

Each project must start in the same way in each environment, with its settings outside the code.

### User Stories

- As an operator, I want **to set each project with environment variables** so that one build operates in each environment.
- As a developer, I want **an incorrect setting to stop the project when it starts** so that I never examine a system with an incomplete configuration.

### Business rules

- Each setting must have a documented default.
- A project must stop cleanly: it must not lose a request in progress or a log line.

### Out of context

- The log and the error format (`monitoring`), the health status (`health`).
- The management of secrets. Configuration files, other than an optional local `.env` file.

## Requirements

- **R01**: WHEN the `cli` runs with `--version`, it SHALL show its version and stop with exit code 0.
- **R02**: WHEN the `cli` starts, it SHALL apply each migration that the database does not have, in order, and record the version of each one.
- **R03**: IF the database has a schema version that the `cli` does not know, THEN the `cli` SHALL stop with a non-zero exit code and a message that contains that version.

## Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `--version` | The version. Exit code 0. | R01 |
| process | cli | start on a database | Applies the missing migrations, or stops on an unknown version | R02, R03 |

## Solution

### cli

- `core` reads the arguments and the environment. An argument has priority.
- The cli is local and owns its store: no port, no server. Each invocation does one command and stops.
- Settings: `DATABASE_URL` (default `./data/cli.sqlite`) for its store. `core` checks it one time, before the command, with `readSetting`.
- A relative path in a setting starts at the project folder, never at the working directory.
- `core` opens the database from `DATABASE_URL`. The composition gives it to the features through its contract in `shared`.
- Migrations: one numbered file for each schema change (`0001-{name}`), all in one folder. A feature adds its own there. The runner of `core` applies each missing one before the command, each in one transaction, and records its version and time. No feature creates a table.
- Clean stop, checked by `review-implementation`: the database closes before the invocation stops.

### e2e

- `core` reads `CLI_DIRECTORY` (default `../cli`) and `CLI_START` (default `npm start --`). An invalid value stops the suite; it never falls back to the default.
- The suite never starts a `cli` for the run. Each test runs it with the helper below.
- A helper in `shared` starts one CLI invocation with the environment and arguments that the test gives. It waits until the CLI stops, and returns its standard output, standard error and exit code, with no base URL. Tests use only the test runner, with no browser.
- Each invocation has its own temporary database when the test gives no `DATABASE_URL`. The helper never takes `DATABASE_URL` from the environment of the runner, and deletes the database after the stop. No retries and no single worker to hide a shared database.
- Checked by `review-implementation`, not by an acceptance test: an invalid setting stops the suite before the first test, with the variable and the cause. A unit test of `core` can prove it.

### All projects

- An example environment file lists each variable and its default.

## Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| cli.db | table of applied versions | new | `version`, `appliedAt`. One row for each applied migration. |

## Test notes

- **R01**: run the CLI with the helper. Check the shape of the version, never an exact value.
- **R02**: run a command two times on one temporary database: no version has two rows.
- **R03**: record an unknown version in a temporary database before the run.
