import assert from "node:assert/strict";
import { test } from "node:test";
import { readCliSettings } from "./cli.config.ts";

void test("suite settings have documented defaults and explicit overrides", () => {
  const settings = readCliSettings(process.env);
  assert.equal(settings.command, "npm");
  assert.deepEqual(settings.arguments, ["start", "--"]);
  const override = readCliSettings({
    ...process.env,
    CLI_START: `"${process.execPath}" --version`,
  });
  assert.equal(override.command, process.execPath);
});

void test("invalid suite settings name the variable and cause", () => {
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_START: '"node' }),
    /CLI_START: has an unclosed quote/u,
  );
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_START: '""' }),
    /CLI_START: executable does not exist/u,
  );
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_DIRECTORY: "" }),
    /CLI_DIRECTORY: must contain text/u,
  );
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_DIRECTORY: "does-not-exist" }),
    /CLI_DIRECTORY: directory does not exist/u,
  );
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_START: "" }),
    /CLI_START: must contain text/u,
  );
  assert.throws(
    () => readCliSettings({ ...process.env, CLI_START: "does-not-exist" }),
    /CLI_START: executable does not exist/u,
  );
});
