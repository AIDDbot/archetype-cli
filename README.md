# Archetype CLI

Reference archetypes for local command-line systems that [AIDDbot](https://aiddbot.com) scaffolds. Each archetype follows the AIDDbot Blueprint and implements its foundation specs for a local cli: configuration, monitoring and health. No archetype has a business feature.

| Folder | Project type | Technology |
| --- | --- | --- |
| [`cli/`](./cli/) | `cli` | Framework-free TypeScript 7 on Node.js, local SQLite (`node:sqlite`) |
| [`e2e/`](./e2e/) | `e2e` | Playwright Test with no browser; it is also the conformance suite of the archetypes |

The cli is local: no server and no back-end API. It keeps its data in a SQLite file that `DATABASE_URL` selects (default `./data/cli.sqlite`).

[`foundation/`](./foundation/) holds the instance of each foundation spec (`S0001`–`S0003`). Each acceptance test has the tag of its requirement. [`model/`](./model/) holds the schema documents of the archetypes: the conceptual model and the database of `cli`.

Common tooling: npm, oxlint (lint, type check, layer boundaries and quality limits), oxfmt, and the Node.js test runner.

## Use an archetype

AIDDbot copies the archetypes for you when it founds a system. To copy one by hand:

```sh
npx degit AIDDbot/archetype-cli/cli cli
```

Then put the identity of your system in the root `package.json` (`displayName`, `description`, `author`, `homepage`, `version`). The cli reads its version from there.

## Versions

Archetype CLI has the same version as AIDDbot, patch included: AIDDbot {version} pins `v{version}`. Each AIDDbot release publishes Archetype CLI first with its version, also when nothing changed here. Use that tag in the copy command, for example `npx degit AIDDbot/archetype-cli/cli#v{version} cli`.

## Run the archetypes

Requirements: Node.js 26 or later.

```sh
cd cli && npm ci && cd ..
cd e2e && npm ci && cd ..
```

In each project: `npm test` (unit tests in `cli`, acceptance in `e2e`), `npm run lint`, `npm run quality` and `npm run format`. Run a command with `npm start -- health` in `cli/`. Copy `.env.example` to `.env` to change a setting.

The acceptance suite runs the cli itself, with a temporary database for each test:

```sh
cd e2e && npm test
```

## Contribute

Read [`AGENTS.md`](./AGENTS.md). It holds the Blueprint and the gate that each archetype change must pass: green checks, a `quality` run with no warning, a green acceptance run, and no open technical debt.

## License

[MIT](./LICENSE)
