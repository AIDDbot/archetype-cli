# Archetype CLI

An archetype for local command-line systems that [AIDDbot](https://aiddbot.com) scaffolds: a whole solution that follows the AIDDbot Blueprint and implements its foundation specs for a local cli. It has no business feature.

| Folder | Project type | Technology |
| --- | --- | --- |
| [`projects/cli/`](./projects/cli/) | `cli` | Framework-free TypeScript on Node.js |
| [`projects/e2e/`](./projects/e2e/) | `e2e` | Vitest with no browser; it is also the conformance suite of the archetype |

The cli is local: no server, no API and no database. It keeps its settings in a JSON file that `CONFIG_FILE` selects (default `./config.json`) and writes daily logs to `LOG_DIR` (default `./logs`). Commands: `config`, `about`, `help`, and the options `--json`, `--version` and `--help`.

The repository is an AIDDbot system: [`.product/specs/`](./.product/specs/) holds the shipped foundation specs (`S0001` scaffold to `S0006` presentation), [`.product/PRD.md`](./.product/PRD.md) lists them, and [`.product/model/`](./.product/model/) holds the schema documents. Each acceptance test has the tag of its requirement.

Common tooling: npm workspaces and [Vite+](https://viteplus.dev) (format, lint, type check, Vitest, and the `vp staged` pre-commit hook).

## Use the archetype

AIDDbot copies the archetype for you when it founds a system. To copy it by hand:

```sh
npx degit AIDDbot/archetype-cli#v{version} my-system
cd my-system && npm ci
```

`npm ci` runs `prepare`, which installs the pre-commit hook. Then put the identity of your system in `projects/cli/package.json`: `displayName`, `description`, `author` (`name`, `url`) and `version`. Each field is required: the type check rejects a `package.json` without one. The cli imports its own `package.json`, and the root has no identity.

## Versions

Archetype CLI has the `major.minor` and the codename of the AIDDbot release that pins it. It releases its patches on its own.

## Run the archetype

Requirements: Node.js 26 or later.

```sh
npm ci
npm test
```

`npm test` at the root runs the unit tests of `cli` and the full acceptance suite of `e2e`. `npm run check` formats, lints and type-checks the whole repository and runs every unit test, with no fix; `npm run fix` applies the safe fixes. In each project: `npm test`, `npm run layers` (import boundaries) and `npm run crap` (complexity and coverage). Run a command with `npm start -- about` in `projects/cli/`.

## Contribute

Read [`AGENTS.md`](./AGENTS.md). It holds the Blueprint and the gate that each archetype change must pass: green checks, a clean working tree after the full run, tags that match `.product/specs/`, and no open technical debt.

## About

- **Author**: [Alberto Basalo](https://albertobasalo.dev)
- **Socials**:
  - [X](https://x.com/albertobasalo)
  - [LinkedIn](https://www.linkedin.com/in/albertobasalo/)
  - [GitHub](https://github.com/albertobasalo)
- **Cursos en Español**: [AI code Academy](https://aicode.academy)
- **AIDDbot.com**: [AIDDbot.com](https://aiddbot.com)
- **The main Repository for AIDDBot**: [AIDDbot](https://github.com/AIDDbot/AIDDbot)

## License

[MIT](./LICENSE)
