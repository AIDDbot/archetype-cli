---
id: S0006
slug: presentation
key: S0006-presentation
type: feat
branch: feat/S0006-presentation
domain: foundation
---
# S0006-presentation — Presentation

## Problem

Each feature shows records, lists of records, and forms that collect data. When each feature makes its own format or validation, the output does not have the same shape, and the same debt comes back in each feature.

A record is one thing that the application shows, such as the application itself. A list is many records of one kind, such as the settings of the CLI. A form collects the fields of one record from the options of a command.

### User Stories

- As a user, I want **records, lists and forms that look the same and show the important value first** so that I understand them at a glance.
- As a user, I want **dates, durations and states that a person reads** so that I do not decode raw values.
- As a script author, I want **each value in a standard format** so that I read each answer with the same code.

### Business rules

- A feature must not write its own text format or response shape for a list, a record or a form. It must compose the primitives of this spec.
- A value for a machine (`--json`) must be in a standard format. A value for a person must be in a form that a person reads.

### Out of context

- New business data, charts, animations, and changes to the texts of earlier specs, other than the views that this spec names.
- Pages, sort, filter and search of a list. Business specs add them when they need them, with the list primitive.
- A new style sheet library or new brand tokens.
- API and browser interfaces. User accounts.

## Solution

### All projects

- The five primitives, in `shared`, each with a row in the shared primitives of the `AGENTS.md` where it applies:

| Primitive | `cli` | `e2e` |
| --- | --- | --- |
| **list** | text table | table reader |
| **record** | `{label}: {value}` lines | record reader |
| **form** | n/a in the foundation: no command has options of its own. A business command uses `readOptions`: the error names the option | n/a: no browser form |
| **states** | empty message, error of `monitoring` | n/a: the readers report what they find |
| **values** | readable; standard with `--json` | n/a: tests check the shape of a value |

- The features of the earlier specs (`about`, `config`) use the primitives. Their texts and tests stay as their specs say, except the `config get` table that this spec replaces.

### cli

- The output contract of `shell` gets a typed view (list or record); `core` writes it as text, or as JSON with `--json`. A command never formats a value or pads a column.
- `config get` becomes a list. Its table replaces the text of `S0002-R03`, which shows each setting with its value and source. Update that acceptance test to read the table. Its JSON shape stays as `S0004-R09` says.
- Unit tests prove the empty list (`No {records}.`) and the alignment of a table. No public foundation command can produce an empty list.
- Value primitives keep machine values in their standard format. Human output uses readable values. Unit tests prove date and duration formatting because the foundation commands have no date or duration fact.

### e2e

- The readers of tables and records are in `shared`.

## Verification

### Requirements

- **R01**: WHEN the `cli` shows one record (`about`), it SHALL write one line for each fact, as `{label}: {value}`, with each value in the same column. Test: read the identity from `about --json`; read each fact with the record reader and check its label, value and value column. Keep the project technology facts that `S0005-R02` names. Tag: `@S0006-R01`.
- **R02**: WHEN the `cli` runs `config get`, it SHALL show the settings as a table with the columns `Setting`, `Value` and `Source`. Replaces: `S0002-R03`. Test: use the table reader to check each existing setting, its selected value and its source; cover the defaults and the argument, environment and file sources. Never assert the whole list or its order. Also invoke `config get` with an extra argument and an unknown option; check the error, command usage and exit code 2 under `S0004-R07`. Tag: `@S0006-R02`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `about` | One `{label}: {value}` line for each fact. Values start in the same column. | R01 |
| command | cli | `config get` | Table `Setting`, `Value`, `Source`. An extra argument or an unknown option shows an error and command usage, with exit code 2 under `S0004-R07`. | R02 |
