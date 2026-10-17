# Archetype CLI

An archetype that follows the AIDDbot Blueprint: a whole solution with a local command-line application and its acceptance suite. AIDDbot copies the whole workspace into a new system, and the system then grows from it.

- Write `AGENTS.md` files, specs and other records in ASD-STE100 Simplified Technical English: short sentences, one statement in each sentence, active voice, and one word for one concept. Technical names are permitted.
- When a request is ambiguous or incomplete, ask one closed question at a time.
- Write code, tests and the texts of the user interface in English. The archetype has no translations.

## Environment

- **Git**: default branch `main`.
- **Runtime**: Node.js 26 or later, npm only. One npm workspace at the root, with each project in `projects/`.

## Projects

| Project | Type | Technology | Source path | Responsibility | Instructions |
| --- | --- | --- | --- | --- | --- |
| cli | cli | Framework-free TypeScript on Node.js | `projects/cli/` | Run local commands and keep the local settings. | `projects/cli/AGENTS.md` |
| e2e | e2e | Vitest, no browser | `projects/e2e/` | Prove each command through its public interface. It is the conformance suite of the archetype. | `projects/e2e/AGENTS.md` |

The cli is local: no server, no port, no `api` and no database. It keeps its settings in a JSON file that `CONFIG_FILE` selects, and writes its logs to `LOG_DIR`. Each acceptance test runs the cli with its arguments, its own configuration file and its own log folder, and reads the standard output, the standard error and the exit code. The identity of a system (`displayName`, `description`, `author`, `homepage`, `license`, `version`) is in the root `package.json`.

`foundation/` holds the instance of each foundation spec for this system, with its ID: `S0001-scaffold`, `S0002-configuration`, `S0004-monitoring`, `S0006-shell`, `S0008-about` and `S0009-presentation`, in the delivery order of AIDDbot. The missing IDs were specs that repaired debt. A local cli has no users, so `users` is not delivered. Each acceptance test has the tag of its requirement (`@S0002-R01`). A system that starts from this archetype gets the same spec IDs, so the tags stay correct. `model/` holds the schema documents. The archetype carries no business feature.

## Common stack

- **Projects**: cli and e2e
- **Language**: TypeScript 7
- **Runtime / framework**: Node.js, framework-free
- **Main dependencies**: Node.js standard library — platform; Vite+ — tooling. The closed list: no other dependency, unless a spec names it
- **Package manager**: npm
- **Pre-commit hook**: `vp staged` — formats, lints and type-checks the staged files with safe fixes, and runs the unit tests that they affect
- **Tooling**: `upgrade` `npm --prefix ../.. run upgrade` (one script at the root, for all the dependencies); `test` `npm test`; `start` `npm start`; `layers` `npm run layers`; `crap` `npm run crap` — Vite+ / npm
- Use erasable TypeScript syntax because Node.js runs source files. Inject external services through shared contracts.

## Blueprint

<!-- Copied as written from the root AGENTS.md of the work system (AIDDbot Halloween 0.4). Never change it here: change it in AIDDbot and copy it again. -->

All projects obey these principles. A project `AGENTS.md` gives only its own data and the limits that its archetype changes. Do not explore the code to learn the setup. First make it work, then make it correct: only the pre-commit hook of the technology (lint and format) and `test` (the unit tests, and the acceptance suite of `e2e`) block a delivery, and a security finding gets one repair first. Any other violation is debt.

### System

- `api` owns the data. Only it connects to persistence. `web` and `cli` get data only through `api`. Exception: an application in a system with no `api`, such as a `cli`, a desktop or a mobile application, owns its local data.
- REST API: paths start with `/api`; a resource is a plural noun; a singleton resource is a singular noun, such as `/api/health`. JSON bodies, ISO 8601 dates, `Authorization: Bearer <token>`. Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 413, 500. Every error has the body `{ "error": "<message>" }`; an input error adds `fields`. An error never shows a stack, SQL or a path.
- Security: no secrets in the code or the repository; a password only as a salted hash; check each input at the edge.

### Containers

| Container | Is | Never |
| --- | --- | --- |
| `core` | The platform that the framework or the entry calls one time at startup: server or shell, router, connections, error handler, global styles. | Business rules. Imports of a feature. |
| `shared` | Generic elements with no domain, and the contracts of the services that features need (such as the logger, the HTTP client or the error type). Primitives at the root, other elements in folders by technical concern (`http`, `database`). | Domain words. Imports of `core` or of a feature. Folders `utils`, `helpers`, `common`, `misc`. |
| feature | One flat folder for one unit of business value. The role in each file name tells its layer. | Subfolders. Imports of `core`. Imports of a different feature, except its facade. |
| composition | The entry. It starts `core`, registers each feature by name in one explicit list (the manifest), and gives the features the services of `core` through the contracts of `shared`. The only part that knows `core` and the features. | Automatic discovery: folder scans, global decorators, file-based routers. |

### Layers

- composition → `presentation` → `logic` → `data`. A different feature → `facade` → `logic`. A layer never skips the next one: only the registration creates `data` and gives it to `logic`.
- `presentation`: input, output and the registration of the feature (route, page, command). No business rules. Only the composition imports it.
- `facade`: the public functions and types for other features. Only other features import it. A feature that gives nothing has no facade.
- `logic`: rules and decisions. It does not know how data is stored.
- `data`: all that the project reads or writes outside itself (database, remote API, files).
- Types are not a layer. Each layer can use types, `shared` and the facades of other features.
- `layers` checks the imports with the dependency rules of the linter. A broken boundary is `medium` debt.
- A feature that the manifest loads on demand has no other import. Tests start the application through the composition, without a port.

### Tests

- Unit tests prove `logic`, at least one for each business rule, with a fake `data`. They also prove `shared` and `core`. They are fast and independent, and touch no disk, database, network or process: the acceptance tests prove `data`. The pre-commit hook runs the ones that a commit affects. A business rule without a unit test is debt.
- An acceptance test proves one requirement. Its name contains the identifier of that requirement.
- `e2e` has no layers, no manifest, no composition and no unit tests; the runner is the entry, and each run proves its `core`. `core` is the life cycle of the suite (setup, teardown, startup check of the projects). Features: one folder for each feature of the system, with `.api.spec`, `.web.spec` and `.cli.spec` tests. `shared`: primitives, `page-objects/`, `test-data/`.
- An e2e test uses only the API, the screens and the commands. It starts each project only with its start command, and never injects code into its process. It never uses `core` or a different feature. Only the migration tests of `configuration` open the database. Each test makes its own data with unique values. One browser engine (Chromium), unless the system asks for more.

### Code

| Limit | Code | Tests (all `e2e` files) |
| --- | --- | --- |
| Cyclomatic complexity of a function | 8 | 8 |
| Statements in a function | 16 | 64 |
| Nesting depth | 2 | 4 |
| Parameters of a function | 2 | 4 |
| Lines in a file | 128 | 256 |
| Entries in a folder | 16 | 16 |

- `crap` checks the limits of functions and files, and `layers` the entries in a folder. A callback whose signature the framework sets (such as a middleware) is outside the parameter limit: disable the limit for it with a lint comment. A folder over the limit has more than one concern: divide it by concern.
- Strictest typed form of the language and its strictest type check. One type for each domain concept, never a bare string, number, object or array. A value object for a value with rules, made at the edge; it checks only what the spec states. A closed type for a closed set: an enum or a union of literals, as the type check permits. Composition, not inheritance. Generic types in `shared`, domain types in their feature.
- DRY: `shared` has one function to check, convert or format each common type. Look there before you write one. `layers` reports each duplicated block of code as debt.
- One source for each definition: a default, an option, a usage text or a list of names is data in one place. Help, checks and error messages read it. Never parse a display text to get the data again.
- Names: idiomatic, words of the domain. A function is a verb. A boolean is a question (`isActive`, `canEdit`). No negative names, no abbreviations except standard ones.
- Early returns; no `else` on the main path. A long or deep block: a function with a domain name. More than one logical operator: a named variable or predicate. More than two values: one typed object.
- Errors: never hide them. Catch only at the edges: the error handler of `core`, and `data` when it changes an external failure into the expected error.
- Configuration from outside the code. Query statements as named constants in the `data` file that uses them. Migrations as numbered files. A dependency only with the package manager.
- No check, limit or default value that the spec does not state.


## Archetype gate

The archetype enters or changes in this repository only when all of these are true:

- In each project, `npm test`, `npm run layers` and `npm run crap` pass. The pre-commit hook (`vp staged`) passes.
- `npm test` at the root, the unit tests and the full acceptance run, passes against the reference `cli`.
- No test writes a file inside the repository: `git status` is clean after the full run.
- Each requirement in `foundation/` has a test with its tag, and each tag names a requirement in `foundation/`.
- The schema documents in `model/` match the code. AIDDbot copies them into each system and never derives them again.
- The archetype has no open technical debt and no exception in a `lint/` file. Debt in an archetype goes into each system that starts from it.
- A boundary canary fails `layers`: a `core` file that imports a feature. Undo the canary.

A new archetype of a type (for example a `cli` in a different language) passes the same `e2e` suite. Change the suite only when the foundation specs change: first change the instance in `foundation/`, then the tests, then the code.

## Versions

- The root `package.json` has the `major.minor` and the `codename` of the AIDDbot release that pins this repository. This repository releases its patches on its own.
- Each version has a tag `v{version}`. Never move a published tag.

## Git

- MANDATORY: Preserve work; no secrets; no destructive commands.
- Conventional commits: `{feat|refactor|fix|chore|docs|test}({project}): {description}`.
- One archetype change in each commit, with the gate green.

## Project decisions

- The cli owns its local settings in a JSON file. It has no database.
- The cli writes command results to standard output, and errors to standard error as `error: <message>`, never with a stack trace. Exit codes: 0 success, 1 rule, 2 usage, 3 unavailable.
- Each acceptance test has its own configuration file and log folder. A test that needs the default values runs on a copy of the project.
