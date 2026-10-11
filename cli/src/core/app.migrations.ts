import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Database } from "../shared/database/database.contract.ts";
import { expectedError } from "../shared/error.make.ts";

const createVersions =
  "CREATE TABLE IF NOT EXISTS applied_migrations (version TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)";
const findVersion = "SELECT version FROM applied_migrations WHERE version = ?";
const recordVersion = "INSERT INTO applied_migrations (version, appliedAt) VALUES (?, ?)";
const listVersions = "SELECT version FROM applied_migrations";

function rejectUnknownVersions(database: Database, known: readonly string[]): void {
  for (const row of database.prepare(listVersions).all()) {
    const version = String(row.version);
    if (!known.includes(version)) throw expectedError(`Unknown database version ${version}.`);
  }
}

function applyMigration(
  database: Database,
  migration: Readonly<{ version: string; sql: string }>,
): void {
  if (database.prepare(findVersion).get(migration.version) !== undefined) return;
  database.execute("BEGIN");
  try {
    database.execute(migration.sql);
    database.prepare(recordVersion).run(migration.version, new Date().toISOString());
    database.execute("COMMIT");
  } catch (error) {
    database.execute("ROLLBACK");
    throw error;
  }
}

export function applyMigrations(database: Database, directory: string): void {
  database.execute(createVersions);
  const files = readdirSync(directory)
    .filter((name) => /^\d{4}-.+\.sql$/u.test(name))
    .sort();
  rejectUnknownVersions(
    database,
    files.map((file) => file.slice(0, 4)),
  );
  for (const file of files) {
    applyMigration(database, {
      version: file.slice(0, 4),
      sql: readFileSync(join(directory, file), "utf8"),
    });
  }
}
