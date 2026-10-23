import { expectExit } from "#shared/projects/cli.check.ts";
import {
  expectSetting,
  expectInvalidSetting,
  expectUnchangedSettings,
  expectSettingsTable,
  expectSettingsList,
  expectSettingText,
} from "#shared/projects/config.check.ts";
import { test } from "#shared/projects/cli.fixture.ts";
import { invokeJson } from "#shared/projects/cli.json.ts";

test("@S0008-R01 writes a valid setting for the next invocation", async ({ cli }) => {
  const set = await cli.run({ arguments: ["config", "set", "LOG_LEVEL", "warn"] });
  expectExit(set, 0);
  const get = await invokeJson({
    cli,
    input: { arguments: ["config", "get", "LOG_LEVEL"], environment: { LOG_LEVEL: undefined } },
  });
  expectSetting(get, { name: "LOG_LEVEL", value: "warn", source: "file" });
});

for (const [name, value, code] of [
  ["NO_SUCH_SETTING", "x", 2],
  ["LOG_LEVEL", "loud", 1],
] as const) {
  test(`@S0008-R01 rejects ${name}=${value} without changing settings`, async ({ cli }) => {
    await cli.run({ arguments: ["config", "set", "LOG_LEVEL", "warn"] });
    const before = await cli.run({ arguments: ["--json", "config", "get"] });
    const invalid = await cli.run({ arguments: ["config", "set", name, value] });
    expectInvalidSetting(invalid, { name, code });
    const after = await cli.run({ arguments: ["--json", "config", "get"] });
    expectUnchangedSettings(before, after);
  });
}

test("@S0008-R02 lists each foundation setting with its value and source", async ({ cli }) => {
  const environment = { LOG_LEVEL: undefined };
  const result = await cli.run({ arguments: ["config", "get"], environment });
  expectSettingsTable(result, cli.directory);
  const json = await invokeJson({ cli, input: { arguments: ["config", "get"], environment } });
  expectSettingsList(json, cli.directory);
  const single = await cli.run({ arguments: ["config", "get", "LOG_LEVEL"], environment });
  expectSettingText(single, "info");
});

test("@S0008-R03 resolves argument, environment, file and default in order", async ({ cli }) => {
  const base = ["config", "get", "LOG_LEVEL"];
  const fresh = await invokeJson({
    cli,
    input: { arguments: base, environment: { LOG_LEVEL: undefined } },
  });
  expectSetting(fresh, { name: "LOG_LEVEL", value: "info", source: "default" });
  await cli.run({ arguments: ["config", "set", "LOG_LEVEL", "warn"] });
  const argument = await invokeJson({
    cli,
    input: { arguments: [...base, "--log-level", "debug"], environment: { LOG_LEVEL: "error" } },
  });
  expectSetting(argument, { name: "LOG_LEVEL", value: "debug", source: "argument" });
  const environment = await invokeJson({
    cli,
    input: { arguments: base, environment: { LOG_LEVEL: "error" } },
  });
  expectSetting(environment, { name: "LOG_LEVEL", value: "error", source: "environment" });
  const file = await invokeJson({
    cli,
    input: { arguments: base, environment: { LOG_LEVEL: undefined } },
  });
  expectSetting(file, { name: "LOG_LEVEL", value: "warn", source: "file" });
});
