import assert from "node:assert/strict";
import { test } from "node:test";
import { join } from "node:path";
import { readConfiguration, projectDirectory } from "./app.config.ts";

void test("database settings resolve from the project and arguments take priority", () => {
  const configuration = readConfiguration(["--version", "--database-url", "argument.sqlite"], {
    DATABASE_URL: "environment.sqlite",
  });
  assert.equal(configuration.databasePath, join(projectDirectory, "argument.sqlite"));
  assert.equal(configuration.isVersion, true);
  assert.equal(
    readConfiguration([], {}).databasePath,
    join(projectDirectory, "data", "cli.sqlite"),
  );
});

void test("an invalid database setting fails with its variable", () => {
  assert.throws(() => readConfiguration([], { DATABASE_URL: " " }), /DATABASE_URL/u);
});
