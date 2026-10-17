---
id: S0008
slug: about
key: S0008-about
type: feat
branch: feat/S0008-about
domain: foundation
---
# S0008-about — About

## Problem

A person or a client that uses the system must see what it is, which version runs, who made it, and the technology of each project.

### User Stories

- As a user, I want **to see what the application is and which version runs** so that I know what I use, and I can tell it in a failure report.
- As an owner, I want **my name, a link to my website and a summary of the technology** so that the application shows my work.
- As a script author, I want **only the version, with one option** so that a script can check it.

### Business rules

- The identity must come from the identity file of `shell`.
- No project must ask for the identity or the technology at runtime.

### Out of context

- Licenses of the dependencies, release notes, contact forms, update checks.
- API and browser interfaces.

## Solution

### All projects

- With no author in the identity: `AIDDbot` and `https://aiddbot.com`.
- The technology summary is a constant of the `about` feature, made at the foundation from `.product/system.md` and the `AGENTS.md` of each project: project, type, language, framework, main libraries and test tools.

| Project | Type | Technologies |
| --- | --- | --- |
| cli | cli | TypeScript 7, Node.js, Node.js standard library, framework-free, Vite+, Vitest |
| e2e | e2e | TypeScript 7, Node.js, Node.js standard library, framework-free, Vite+, Vitest |

### cli

- `--version` is a global option of `core`. It writes the version as text, also with `--json`.
- Feature `about`: command `about`. No `logic` or `data`.
- The command reads the identity contract of `shell`. The website comes from `homepage` in the root `package.json`.

### e2e

- Tests read the expected identity from the root `package.json`.
- A test of the missing author uses a temporary copy of the CLI and its root identity file. It changes only that copy.

## Verification

### Requirements

- **R01**: WHEN the `cli` runs with `--version`, it SHALL write only the version and one line break to its standard output, and stop with exit code 0. Test: compare standard output with the version from the root `package.json` and one line break. Tag: `@S0008-R01`.
- **R02**: WHEN the `cli` runs `about`, it SHALL show the application name, its description, its version, the author, the website, and for each project of the system its name, its type and its main technologies, and stop with exit code 0. Test: check the identity and both projects against the technology table. Also invoke `about` with an extra argument and an unknown option; check the error, command usage and exit code 2 under `S0006-R07`. Tag: `@S0008-R02`.
- **R03**: WHEN the `cli` runs `about --json`, it SHALL write `{ "name", "description", "version", "author", "homepage", "projects": [ { "name", "type", "technologies": [ "<technology>" ] } ] }`, with one entry for each project of the system. Test: parse the one JSON object; check each identity field and both projects against the technology table. Tag: `@S0008-R03`.
- **R04**: WHEN the `cli` runs with `--version` and `--json`, it SHALL write only the version as text and one line break to its standard output, and stop with exit code 0. Test: cover `--version --json` and `--json --version`; compare the output with R01. Tag: `@S0008-R04`.
- **R05**: IF the identity has no author, THEN `about` SHALL show `AIDDbot` as the author and `https://aiddbot.com` as the website. Test: remove the author from a temporary identity file; check text output and the `author` and `homepage` fields in JSON output. Tag: `@S0008-R05`.

### Expected URLs and APIs

| Kind | Project | Address | Expected answer | Requirements |
| --- | --- | --- | --- | --- |
| command | cli | `--version` | Only the version and one line break. Exit code 0. | R01 |
| command | cli | `about` | Identity and technology. Exit code 0. An extra argument or an unknown option shows an error and command usage, with exit code 2 under `S0006-R07`. | R02, R05 |
| command | cli | `about --json` | One identity object with the technology of each project. | R03, R05 |
| command | cli | `--version --json`, `--json --version` | Only the version as text and one line break. Exit code 0. | R04 |
