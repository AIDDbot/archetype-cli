import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { applyMigrations } from "./app.migrations.ts";

void test("migrations apply once and roll back a failed change", () => {
  const directory = mkdtempSync(join(tmpdir(), "migrations-"));
  const connection = new DatabaseSync(":memory:");
  const database = {
    execute: (sql: string) => connection.exec(sql),
    prepare: (sql: string) => connection.prepare(sql),
  };
  try {
    writeFileSync(
      join(directory, "0001-example.sql"),
      "CREATE TABLE example (id INTEGER PRIMARY KEY);",
    );
    applyMigrations(database, directory);
    applyMigrations(database, directory);
    const rows = connection.prepare("SELECT version, appliedAt FROM applied_migrations").all();
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.version, "0001");
    assert.match(String(rows[0]?.appliedAt), /^\d{4}-\d{2}-\d{2}T/u);
    writeFileSync(
      join(directory, "0002-failure.sql"),
      "CREATE TABLE rolled_back (id INTEGER); INVALID SQL;",
    );
    assert.throws(() => applyMigrations(database, directory));
    assert.equal(
      connection.prepare("SELECT name FROM sqlite_master WHERE name = 'rolled_back'").get(),
      undefined,
    );
    assert.equal(
      connection.prepare("SELECT count(*) AS count FROM applied_migrations").get()?.count,
      1,
    );
  } finally {
    connection.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

void test("migrations stop on an unknown database version", () => {
  const directory = mkdtempSync(join(tmpdir(), "migrations-"));
  const connection = new DatabaseSync(":memory:");
  const database = {
    execute: (sql: string) => connection.exec(sql),
    prepare: (sql: string) => connection.prepare(sql),
  };
  try {
    applyMigrations(database, directory);
    connection.prepare("INSERT INTO applied_migrations VALUES (?, ?)").run("9999", "2026-01-01");
    assert.throws(() => applyMigrations(database, directory), /9999/u);
  } finally {
    connection.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
