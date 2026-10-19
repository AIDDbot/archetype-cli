import { expect, test } from "vite-plus/test";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createCliSetup } from "#shared/projects/setup.ts";
import { runJson } from "#shared/projects/json.ts";
import { cliDirectory } from "#shared/projects/settings.ts";
const identity = JSON.parse(await readFile(resolve(cliDirectory, "../../package.json"), "utf8"));
const setup = createCliSetup();
test("@S0004-R01 root help forms show identity and commands", async () => {
  const cli = await setup();
  for (const args of [[], ["help"], ["--help"]]) {
    const result = await cli.run(args);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(identity.displayName ?? identity.name);
    expect(result.stdout).toContain("Usage:");
    expect(result.stdout).toContain("config  Read and write local settings");
  }
});
test("@S0004-R02 command help forms describe operations and options", async () => {
  const cli = await setup();
  for (const args of [
    ["help", "config"],
    ["config", "--help"],
  ]) {
    const result = await cli.run(args);
    expect(result.code).toBe(0);
    for (const text of [
      "config get [name]",
      "get  Read",
      "set  Save",
      "--config-file",
      "Set CONFIG_FILE",
      "--log-dir",
      "Set LOG_DIR",
      "--log-level",
      "Set LOG_LEVEL",
    ])
      expect(result.stdout).toContain(text);
  }
});
test("@S0004-R03 unknown command reports root help only on stderr", async () => {
  const cli = await setup();
  const name = `unknown-${Date.now()}`;
  const result = await cli.run([name]);
  expect(result.code).toBe(2);
  expect(result.stdout).toBe("");
  expect(result.stderr).toContain(`error: Unknown command: ${name}`);
  expect(result.stderr).toContain(identity.displayName ?? identity.name);
  expect(result.stderr).toContain("config  Read and write local settings");
});
test("@S0004-R04 foundation commands return exactly one JSON object @S0004-R06 help data", async () => {
  const cli = await setup();
  const help = await runJson(cli, ["help"]);
  expect(help.code).toBe(0);
  expect(help.data).toMatchObject({
    name: identity.displayName ?? identity.name,
    commands: expect.arrayContaining([
      {
        name: "config",
        summary: "Read and write local settings",
        usage: "config get [name] | config set <name> <value>",
      },
    ]),
  });
  for (const args of [
    ["config", "get"],
    ["config", "set", "LOG_LEVEL", "debug"],
  ]) {
    const result = await runJson(cli, args);
    expect(result.code).toBe(0);
    expect(result.data).toBeTypeOf("object");
  }
});
test("@S0004-R05 JSON failures preserve exit codes and use stdout", async () => {
  const cli = await setup();
  for (const [args, code] of [
    [["config", "set", "LOG_LEVEL", "invalid"], 1],
    [["missing-command"], 2],
    [["config", "get", "--unknown"], 2],
  ] as const) {
    const result = await runJson(cli, [...args]);
    expect(result.code).toBe(code);
    expect(result.data).toMatchObject({ error: expect.any(String) });
  }
  await writeFile(cli.file, "{");
  const result = await runJson(cli, ["config", "get"]);
  expect(result.code).toBe(3);
  expect(result.data).toMatchObject({ error: expect.any(String) });
});
test("@S0004-R07 extra arguments and unknown options show command usage", async () => {
  const cli = await setup();
  for (const args of [
    ["config", "get", "LOG_LEVEL", "extra"],
    ["help", "config", "extra"],
    ["config", "get", "--unknown"],
  ]) {
    const result = await cli.run(args);
    expect(result.code).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("error:");
    expect(result.stderr).toContain("Usage: config get [name]");
  }
});
test("@S0004-R08 options before command apply to command", async () => {
  const cli = await setup();
  const help = await cli.run(["--help", "config"]);
  expect(help.code).toBe(0);
  expect(help.stdout).toContain("Usage: config get");
  const json = await cli.run(["--json", "config", "get", "LOG_LEVEL"]);
  expect(json.code).toBe(0);
  expect(JSON.parse(json.stdout)).toMatchObject({
    name: "LOG_LEVEL",
    value: "info",
    source: "default",
  });
  const argument = await cli.run(["--log-level", "debug", "config", "get", "LOG_LEVEL"]);
  expect(argument.code).toBe(0);
  expect(argument.stdout.trim()).toBe("debug");
});
test("@S0004-R09 settings data include values and sources", async () => {
  const cli = await setup();
  const result = await runJson(cli, ["config", "get"]);
  expect(result.data).toMatchObject({
    settings: expect.arrayContaining([
      { name: "CONFIG_FILE", value: cli.file, source: "argument" },
      { name: "LOG_DIR", value: cli.logs, source: "environment" },
      { name: "LOG_LEVEL", value: "info", source: "default" },
    ]),
  });
  const named = await runJson(cli, ["config", "get", "CONFIG_FILE"]);
  expect(named.data).toEqual({ name: "CONFIG_FILE", value: cli.file, source: "argument" });
});
