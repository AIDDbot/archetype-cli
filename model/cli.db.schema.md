# Relational database schema — cli

Source of truth inspected: `cli/src/core/app.database.ts`, `cli/src/core/app.migrations.ts`, `cli/migrations/0001-health-runs.sql` and `cli/src/features/health/health.repository.ts`.

The CLI opens a local SQLite database. `DATABASE_URL` selects the file. Its default is `./data/cli.sqlite`. A relative path starts at the CLI project folder.

## Tables

### applied_migrations

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| `version` | `TEXT` | Primary key | The four-digit migration version. |
| `appliedAt` | `TEXT` | Not null | The application time in ISO 8601 format. |

The migration runner creates this table before it applies numbered SQL files. It applies each missing migration and records its version in one transaction. A recorded version with no migration file stops the CLI with that version in the message.

### runs

| Column | SQLite type | Constraint | Meaning |
| --- | --- | --- | --- |
| `id` | `INTEGER` | Primary key | The identifier of one invocation. SQLite assigns it. |

Migration `0001-health-runs.sql` creates this table. The health repository inserts one row during feature registration. The health command counts the rows. This table has no foreign keys.

---

> last updated: 2026-10-11T09:26:00Z
