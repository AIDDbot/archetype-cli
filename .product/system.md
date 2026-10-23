# Archetype CLI

> Author: Alberto Basalo · Website: https://aiddbot.com · approved: 2026-10-14

## Purpose

A local command-line application and its acceptance suite. It is an archetype: each system that starts from it copies its code, so it ships with zero debt.

## Users and needs

| User | Needs |
| --- | --- |
| Local operator | Run one command at a time, with settings in a file, and read the result as text or as JSON. |

The system has no user accounts.

## Projects

| Project | Type | Folder | Archetype | Responsibility |
| --- | --- | --- | --- | --- |
| cli | cli | `projects/cli/` | Archetype CLI/cli | Run local commands and keep the local settings. |
| e2e | e2e | `projects/e2e/` | Archetype CLI/e2e | Prove each command through its public interface. |

## Technical decisions

- TypeScript on Node.js, with the stack of `.product/blueprint/ecosystems.md`.
- Identity in the `package.json` of `cli`: `displayName` "Archetype CLI", `description` "A local command-line application and its acceptance suite", `author` "Alberto Basalo" with `url` "https://x.com/albertobasalo".
- License: MIT, with the copyright of Alberto Basalo, in `LICENSE` at the root.
- Basic authentication: no, the system has no users.

## Scaffold

The `scaffold` spec of `.product/foundation/` adds the framework of each project to the Bedrock of the archetype.
