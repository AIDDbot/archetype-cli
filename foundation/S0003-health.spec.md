# S0003-health — Health status

## Problem

Before the first business feature, each layer of the CLI must operate with the others, and the acceptance suite must invoke the CLI.

### User Stories

- As an operator, I want **to ask the system if it is alive and how many times it started** so that I know its state quickly.

### Business rules

- The CLI health answer must contain only the status and the startup count.

### Out of context

- Checks of dependencies other than the database of the project. Readiness probes.
- The shell, the menu and the not-found page (`layout`). Authentication (`basic-auth`).
- Uptime, web pages and HTTP endpoints.

## Requirements

- **R01**: WHEN the `cli` runs `health`, it SHALL show the status and the runs, and stop with exit code 0.

## Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `health` | Status and runs. Exit code 0. A database failure uses the CLI failure format of monitoring. | R01 |

## Solution

### cli

- `data` records one run for each invocation in its store, and counts the runs.
- Its table comes in the first migration of the feature (see `configuration`).
- No facade: no other feature uses `health`. The feature gets the database from the composition (see `configuration`).
- The `unit` smoke test checks the `logic` with a fake `data` layer.
- A database failure reaches the top-level handler of `core` (see `monitoring`). It must not produce a successful health answer.

### e2e

- A `cli` has no preflight.
- Run the CLI through the shared invocation helper, with no browser.

## Schema impact

| Schema | Element | Change | Description |
| --- | --- | --- | --- |
| cli store | runs | new | One record for each invocation. |

## Test notes

- **R01**: run `health` two times on one temporary store; the second run shows more runs.
- **R01**: use a store that the database cannot open. Check the CLI failure format and exit code from monitoring. Check that no successful health answer is shown.
