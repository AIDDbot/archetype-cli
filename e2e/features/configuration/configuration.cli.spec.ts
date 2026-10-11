import { test, expect } from "../../shared/projects/cli.fixture.ts";
import { DatabaseSync } from "node:sqlite";
import { withTemporaryStore } from "../../shared/test-data/store.make.ts";

test("shows the version and stops successfully", { tag: "@S0001-R01" }, async ({ cli }) => {
  const result = await cli({ arguments: ["--version"] });
  expect(result.exitCode).toBe(0);
  expect(result.stdout.trim().split("\n").at(-1)).toMatch(/^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/u);
});

test("applies each missing migration one time", { tag: "@S0001-R02" }, async ({ cli }) => {
  await withTemporaryStore(async ({ database }) => {
    for (let run = 0; run < 2; run++)
      expect((await cli({ arguments: ["health"], database })).exitCode).toBe(0);
    const connection = new DatabaseSync(database);
    const rows = connection.prepare("SELECT version, appliedAt FROM applied_migrations").all();
    connection.close();
    expect(rows.length).toBeGreaterThan(0);
    expect(new Set(rows.map((row) => row.version)).size).toBe(rows.length);
    for (const row of rows) expect(Number.isNaN(Date.parse(String(row.appliedAt)))).toBe(false);
  });
});

test("stops on an unknown database version", { tag: "@S0001-R03" }, async ({ cli }) => {
  await withTemporaryStore(async ({ database }) => {
    const unknown = "9999";
    const connection = new DatabaseSync(database);
    connection.exec(
      "CREATE TABLE applied_migrations (version TEXT PRIMARY KEY, appliedAt TEXT NOT NULL)",
    );
    connection
      .prepare("INSERT INTO applied_migrations VALUES (?, ?)")
      .run(unknown, new Date().toISOString());
    connection.close();
    const result = await cli({ arguments: ["health"], database });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain(unknown);
  });
});
