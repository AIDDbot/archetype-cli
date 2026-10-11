# S0002-monitoring — Monitoring

## Problem

When a command fails, the operator must see what occurred in one message shape.

### Business rules

- An error response must not show internal details.
- A console line must never contain a password, a token or a form value.

### Out of context

- Metrics, tracing, log shipping, rate limits.
- Daily log files and log rotation. The system has no server.

## Requirements

- **R01**: WHEN a `cli` command fails, it SHALL write `error: <message>` to standard error and stop with exit code 1.

## Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `{unknown-command}` | `error: <message>` on standard error. Exit code 1. | R01 |

## Solution

### cli

- `core` catches each failure at the top level. Features raise the expected error of `shared`.
- The result of a command goes to standard output; errors go to standard error. An unexpected failure shows a short message, never a stack trace.

### e2e

- Run the CLI through the shared invocation helper. Check standard error and the exit code.
