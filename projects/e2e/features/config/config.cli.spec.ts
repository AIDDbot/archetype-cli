import { expect, test } from "vite-plus/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { createCliSetup } from "../../shared/projects/setup.ts";
import { readTable } from "../../shared/table.read.ts";
const setup = createCliSetup();

test("@S0006-R02 @S0004-R07 config get rejects extra arguments and unknown options", async () => {
  const cli = await setup();
  for (const args of [
    ["config", "get", "LOG_LEVEL", "extra"],
    ["config", "get", "--unknown"],
  ]) {
    const result = await cli.run(args);
    expect(result.code).toBe(2);
    expect(result.stdout).toBe("");
    expect(result.stderr).toContain("error:");
    expect(result.stderr).toContain("Usage: config get [name] | config set <name> <value>");
    expect(result.stderr).toContain(
      args.includes("--unknown") ? "Unknown option --unknown" : "Use config get [name]",
    );
  }
});
test("@S0002-R01 set persists across invocations", async () => {
  const cli = await setup();
  expect((await cli.run(["config", "set", "LOG_LEVEL", "debug"])).code).toBe(0);
  expect((await cli.run(["config", "get", "LOG_LEVEL"])).output).toContain("debug");
});
test("@S0002-R02 invalid set preserves the file", async () => {
  const cli = await setup();
  const original = '{"LOG_LEVEL":"warn"}';
  await writeFile(cli.file, original);
  for (const [name, value] of [
    ["UNKNOWN", "value"],
    ["LOG_LEVEL", "invalid"],
    ["CONFIG_FILE", ""],
    ["LOG_DIR", ""],
  ]) {
    const result = await cli.run(["config", "set", name ?? "", value ?? ""]);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain(name);
    expect(await readFile(cli.file, "utf8")).toBe(original);
  }
});
test("@S0002-R03 @S0006-R02 lists values and sources @S0002-R04 reads each setting", async () => {
  const cli = await setup();
  const result = await cli.run(["config", "get"]);
  expect(result.code).toBe(0);
  const rows = readTable(result.stdout);
  expect(rows).toContainEqual({ Setting: "CONFIG_FILE", Value: cli.file, Source: "argument" });
  expect(rows).toContainEqual({ Setting: "LOG_DIR", Value: cli.logs, Source: "environment" });
  expect(rows).toContainEqual({ Setting: "LOG_LEVEL", Value: "info", Source: "default" });
  for (const [name, value] of [
    ["CONFIG_FILE", cli.file],
    ["LOG_DIR", cli.logs],
    ["LOG_LEVEL", "info"],
  ]) {
    expect((await cli.run(["config", "get", name ?? ""])).output.trim().split("\n").at(-1)).toBe(
      value,
    );
  }
});
test("@S0002-R03 @S0006-R02 reports environment and file origins", async () => {
  const cli = await setup();
  await writeFile(cli.file, '{"LOG_LEVEL":"warn"}');
  const result = await cli.run(["config", "get"], {
    file: null,
    environment: { CONFIG_FILE: cli.file, LOG_DIR: join(cli.directory, "custom-logs") },
  });
  expect(result.code).toBe(0);
  const rows = readTable(result.stdout);
  expect(rows).toContainEqual({ Setting: "CONFIG_FILE", Value: cli.file, Source: "environment" });
  expect(rows).toContainEqual({
    Setting: "LOG_DIR",
    Value: join(cli.directory, "custom-logs"),
    Source: "environment",
  });
  expect(rows).toContainEqual({ Setting: "LOG_LEVEL", Value: "warn", Source: "file" });
});
test("@S0002-R05 sources use declared precedence", async () => {
  const cli = await setup();
  await writeFile(cli.file, '{"LOG_LEVEL":"warn"}');
  const environment = { LOG_LEVEL: "error" };
  expect(
    (await cli.run(["--log-level", "debug", "config", "get", "LOG_LEVEL"], { environment })).output,
  ).toContain("debug");
  expect((await cli.run(["config", "get", "LOG_LEVEL"], { environment })).output).toContain(
    "error",
  );
  expect((await cli.run(["config", "get", "LOG_LEVEL"])).output).toContain("warn");
  await writeFile(cli.file, "{}");
  expect((await cli.run(["config", "get", "LOG_LEVEL"])).output).toContain("info");
});
test("@S0002-R06 invalid configuration names its path", async () => {
  const cli = await setup();
  for (const content of ["{", "[]"]) {
    await writeFile(cli.file, content);
    const result = await cli.run(["config", "get"]);
    expect(result.code).not.toBe(0);
    expect(result.output).toContain(cli.file);
  }
});
test("@S0002-R08 rejects invalid settings from every source", async () => {
  const cli = await setup();
  const copy = await cli.copy();
  for (const [name, value] of [
    ["LOG_LEVEL", "invalid"],
    ["LOG_DIR", ""],
    ["CONFIG_FILE", ""],
  ] as const) {
    const option = `--${name.toLowerCase().replaceAll("_", "-")}`;
    const argument = await cli.run([option, value, "config", "get"]);
    expect(argument.code).not.toBe(0);
    expect(argument.output).toContain(name);
    const environmental = await cli.run(["config", "get"], {
      file: null,
      environment: { CONFIG_FILE: cli.file, [name]: value },
    });
    expect(environmental.code).not.toBe(0);
    expect(environmental.output).toContain(name);
    if (name === "CONFIG_FILE") continue;
    await writeFile(cli.file, JSON.stringify({ [name]: value }));
    const stored = await cli.run(["config", "get"], name === "LOG_DIR" ? copy : {});
    expect(stored.code).not.toBe(0);
    expect(stored.output).toContain(name);
    await writeFile(cli.file, "{}");
  }
});
test("@S0002-R09 CONFIG_FILE in the file cannot redirect it", async () => {
  const cli = await setup();
  const second = join(cli.directory, "second.json");
  await writeFile(second, '{"LOG_LEVEL":"error"}');
  await writeFile(cli.file, JSON.stringify({ CONFIG_FILE: second, LOG_LEVEL: "debug" }));
  expect((await cli.run(["config", "get", "CONFIG_FILE"])).output).toContain(cli.file);
  expect((await cli.run(["config", "get", "LOG_LEVEL"])).output).toContain("debug");
});
test("@S0002-R07 resolves paths from the project folder @S0002-R03 @S0006-R02 defaults", async () => {
  const cli = await setup();
  const copy = await cli.copy();
  const { project } = copy;
  const elsewhere = join(cli.directory, "elsewhere");
  await mkdir(elsewhere);
  const result = await cli.run(["config", "get"], {
    ...copy,
    cwd: elsewhere,
    file: null,
  });
  const rows = readTable(result.stdout);
  expect(rows).toContainEqual({
    Setting: "CONFIG_FILE",
    Value: join(project, "config.json"),
    Source: "default",
  });
  expect(rows).toContainEqual({
    Setting: "LOG_DIR",
    Value: join(project, "logs"),
    Source: "default",
  });
  const saved = await cli.run(["config", "set", "LOG_LEVEL", "debug"], {
    ...copy,
    cwd: elsewhere,
    file: null,
  });
  expect(saved.code).toBe(0);
  expect(JSON.parse(await readFile(join(project, "config.json"), "utf8"))).toMatchObject({
    LOG_LEVEL: "debug",
  });
});
