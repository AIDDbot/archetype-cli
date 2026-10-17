
# Archetype CLI acceptance suite — e2e

Obey the Blueprint of the root `AGENTS.md`. This file gives only the data of this project. Do not explore the code to learn the setup.

## 1 · Purpose and boundary

- **Owns**: Acceptance tests through public commands.
- **Never**: Import application source or provide product behavior.

## 2 · Technology

Use the Common stack of the root `AGENTS.md`.


## 3 · Tooling

| Slot | Blocks | Command | Tool |
| --- | --- | --- | --- |
| `test:spec` | Yes | `npm run test:spec` | Vitest |

## 4 · Architecture

**Services of core**: n/a. The runner controls the suite life cycle.

| Item | e2e |
| --- | --- |
| composition | n/a: the runner is the entry |
| core | Life cycle of the suite |
| features | Tests in one folder for each system feature |
| presentation | n/a: no layers |
| logic | n/a: no layers |
| data | n/a: no layers |
| shared concerns | page-objects, test-data, database, projects |
| test / start | Acceptance tests / runner watch mode |

## 5 · Folder structure

| Concept | Path | Framework mechanism |
| --- | --- | --- |
| entry | vite.config.ts | Vitest configuration |
| core | core/ | Suite life cycle |
| features | features/{feature}/*.cli.spec.ts | Public command tests |
| shared | shared/projects/, shared/test-data/ | Plain TypeScript |
| unit tests | n/a | Each acceptance run proves core |

### Shared primitives

| Primitive | Contract | Path |
| --- | --- | --- |
| `createCliSetup()` | Registers cleanup after each test. Returns a function that creates a CLI fixture for the test. | `shared/projects/setup.ts` |
| list | `readTable` reads each row by its column name. | `shared/table.read.ts` |
| record | `readRecord` reads each fact and its value column. | `shared/record.read.ts` |

## 6 · Coding rules

### Technology rules



### Project rules

| Rule | Scope | Origin |
| --- | --- | --- |

## 7 · Connections

- **Needs**: None.
- **Gives to**: None.
- **Port**: n/a: no network server.
- **Environment variables**: `None` — No environment setting exists in this scaffold.


