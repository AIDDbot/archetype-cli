---
id: S0004
slug: presentation
key: S0004-presentation
type: chore
branch: chore/S0004-presentation
domain: foundation
---
# S0004-presentation — Presentation

## Problem

Each feature shows records, lists of records, and forms that collect data. When each feature makes its own format or validation, the views do not look the same, the outputs do not have the same shape, and the same debt comes back in each feature.

A record is one thing that the application shows, such as the application itself. A list is many records of one kind, such as the settings of the `cli` or the technology of each project. A form collects the fields of one record, from the options of a command.

### User Stories

- As a developer, I want **one primitive for each list, record, form, state and value** so that each feature composes them and writes no format or validation of its own.

### Business rules

- A feature must not write its own text format or output shape for a list, a record or a form. It must compose the primitives of this spec.
- A value for a machine (`--json`) must be in a standard format. A value for a person must be in a form that a person reads.
- A decision of a primitive (a format, an order, a state, the fields of a record) is in a `.ts` file of `shared`, with its unit test.

### Out of context

- Each view of a feature: the feature adds it with its requirements.
- Colors, charts and pages of output.

## Solution

### All projects

- The five primitives, in the `shared` folder of their concern (`output/` in the `cli`, `page-objects/` in the `e2e`; values in `values/`), each listed in the index of `shared`:

| Primitive | `cli` | `e2e` |
| --- | --- | --- |
| **list** | text table, with each column aligned | table reader |
| **record** | `{label}: {value}` lines, with each value in the same column | record reader |
| **form** | `readOptions`: the error names the option | n/a: a test gives the options as arguments |
| **states** | empty message (`No {records}.`), the error of `shell` | n/a: the `cli` has no loading state |
| **values** | readable; standard with `--json` | n/a: tests check the shape of a value |

- Unit tests prove each decision with its list of values: each value format, the missing value, the empty list, the alignment of the columns, the order of the facts, each state.

### cli

- The output contract of `shell` gets a typed view (list or record); `core` writes it as text, or as JSON with `--json`. A command never formats a value or pads a column.

### e2e

- The readers of tables and records are in `shared`, for the tests of the features: they read the text output of one invocation.

## Verification

### Requirements

None: a `chore` changes nothing that a person or a client sees, because no feature uses the primitives yet. The unit tests prove each decision; the review checks the rules of this spec; each feature proves the view that it shows.

### Expected URLs and APIs

None.
