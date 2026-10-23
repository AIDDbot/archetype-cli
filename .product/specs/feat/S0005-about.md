---
id: S0005
slug: about
key: S0005-about
type: feat
branch: feat/S0005-about
domain: foundation
---
# S0005-about — About

## Problem

A person or a script that uses the `cli` must see what it is, which version runs, who made it, and the technology of each project.

### User Stories

- As a user, I want **to see what the application is and which version runs** so that I know what I use, and I can tell it in a failure report.
- As an owner, I want **my name, a link to my website and a summary of the technology** so that the application shows my work.
- As a script author, I want **only the version, with one option** so that a script can check it.

### Business rules

- The identity must come from the `package.json` of the project, through the composition of `shell`.
- No project must ask for the identity or the technology at runtime.

### Out of context

- Licenses of the dependencies, release notes, contact forms, update checks.

## Solution

### All projects

- The technology summary is a constant of the `about` feature, made at the foundation from `.product/system.md` and the `AGENTS.md` of each project: project, type, language, framework, main libraries and test tools.

### cli

- `--version` is a global option of `core`. It writes the version as text, also with `--json`.
- Feature `about`: command `about`, a record view of `presentation`. No `logic` or `data`.

### e2e

- The tests read the facts of `about` with the record reader of `presentation`.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs with `--version`, it SHALL write only the version and one line break to its standard output, and stop with exit code 0.
- **R02**: WHEN the `cli` runs `about`, it SHALL write one line for each fact, as `{label}: {value}`, with each value in the same column: the application name, its description, its version, the author with the website, and for each project its name, its type and its main technologies. It SHALL stop with exit code 0. With `--json`, it SHALL write `{ "name", "description", "version", "author": { "name", "url" }, "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system. Test: read each fact with the record reader, and check its label, its value and its column.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `--version` | Only the version. Exit code 0. | R01 |
| command | cli | `about` | One `{label}: {value}` line for each fact. Exit code 0. With `--json`, one JSON object with the same facts. | R02 |
