import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Database } from "../shared/database/database.contract.ts";
import { applyMigrations } from "./app.migrations.ts";
import { projectDirectory } from "./app.config.ts";

export function withDatabase(path: string, execute: (database: Database) => void): void {
  mkdirSync(dirname(path), { recursive: true });
  const connection = new DatabaseSync(path);
  const database: Database = {
    execute: (sql) => connection.exec(sql),
    prepare: (sql) => connection.prepare(sql),
  };
  try {
    applyMigrations(database, join(projectDirectory, "migrations"));
    execute(database);
  } finally {
    connection.close();
  }
}
