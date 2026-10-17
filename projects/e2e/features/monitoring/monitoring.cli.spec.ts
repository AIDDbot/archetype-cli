import { afterEach, expect, test } from "vite-plus/test";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createCli } from "../../shared/projects/cli.ts";
import { expectFailure } from "../../shared/projects/failure.ts";
const helpers: Awaited<ReturnType<typeof createCli>>[] = [];
async function setup() {
  const cli = await createCli();
  helpers.push(cli);
  const directory = join(cli.directory, "logs");
  return {
    ...cli,
    run: (args: string[], environment: Record<string, string> = {}) =>
      cli.run(args, {
        environment: { LOG_DIR: directory, npm_config_loglevel: "silent", ...environment },
      }),
    logs: async () => {
      const files = await readdir(directory).catch(() => []);
      for (const file of files) expect(file).toMatch(/^\d{4}-\d{2}-\d{2}\.log$/);
      return (await Promise.all(files.map((file) => readFile(join(directory, file), "utf8")))).join(
        "",
      );
    },
  };
}
afterEach(async () => {
  await Promise.all(helpers.splice(0).map((cli) => cli.dispose()));
});
test("@S0004-R01 flushes a plain invocation record without argument values", async () => {
  const cli = await setup();
  const value = join(cli.directory, "distinctive-value");
  expect((await cli.run(["config", "set", "LOG_DIR", value])).code).toBe(0);
  const logs = await cli.logs();
  expect(logs).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3} cli INFO config exit=0 duration=\d+ms\n$/);
  expect(logs).not.toContain(value);
});
test("@S0004-R02 maps every exit code to its log level", async () => {
  const cli = await setup();
  const cases = [
    { args: ["config", "get", "LOG_LEVEL"], code: 0, level: "INFO" },
    { args: ["config", "set", "LOG_LEVEL", "loud"], code: 1, level: "WARN" },
    { args: ["config", "set", "NO_SUCH_SETTING", "value"], code: 2, level: "WARN" },
    { args: ["--config-file", cli.directory, "config", "get"], code: 3, level: "ERROR" },
  ];
  for (const item of cases) {
    const result = await cli.run(item.args);
    expect(result.code).toBe(item.code);
    if (item.code !== 0) expectFailure(result, item.code);
    expect((await cli.logs()).trim().split("\n").at(-1)).toContain(
      ` cli ${item.level} config exit=${item.code} `,
    );
  }
});
test("@S0004-R03 filters information below warn", async () => {
  const cli = await setup();
  expect((await cli.run(["config", "get"], { LOG_LEVEL: "warn" })).code).toBe(0);
  expect(await cli.logs()).toBe("");
});
test("@S0004-R04 @S0004-R08 @S0004-R09 separates streams and conceals invalid values", async () => {
  const cli = await setup();
  const result = await cli.run(["config", "get", "LOG_LEVEL"]);
  expect(result.stdout.trim()).toBe("info");
  expect(result.stderr).toBe("");
  const secret = "distinctive-password-token-value";
  const rejected = await cli.run(["config", "set", "LOG_LEVEL", secret]);
  expectFailure(rejected, 1);
  expect(rejected.stdout).toBe("");
  expect(rejected.stderr).toContain(" cli WARN ");
  for (const text of [rejected.stderr, await cli.logs()]) {
    expect(text).not.toContain(secret);
    expect(text).not.toMatch(/\n\s+at /);
  }
});
test("@S0004-R05 rejects unknown options as usage", async () => {
  const cli = await setup();
  const result = await cli.run(["config", "get", "--no-such-option"]);
  expectFailure(result, 2);
  expect(result.stderr).toContain("--no-such-option");
});
test("@S0004-R06 reports invalid settings and unavailable configuration", async () => {
  const cli = await setup();
  const unavailable = await cli.run(["--config-file", cli.directory, "config", "get"]);
  expectFailure(unavailable, 3);
  expect(unavailable.stderr).toContain(cli.directory);
  const invalid = await cli.run(["config", "get"], { LOG_LEVEL: "loud" });
  expectFailure(invalid, 3);
  expect(invalid.stderr).toContain("LOG_LEVEL");
});
test("@S0004-R07 rejects unknown settings as usage", async () => {
  const cli = await setup();
  const result = await cli.run(["config", "set", "NO_SUCH_SETTING", "value"]);
  expectFailure(result, 2);
  expect(result.stderr).toContain("NO_SUCH_SETTING");
});
