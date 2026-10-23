import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { expectExit } from "#shared/projects/cli.check.ts";
import {
  expectApplicationHelp,
  expectCommandHelp,
  expectUsageError,
  expectJsonHelp,
  expectJsonFailure,
  expectConfigurationFailure,
  expectInvocationLog,
  expectParserJsonFailure,
  expectPositionalJsonFailure,
} from "#shared/projects/shell.check.ts";
import { test } from "#shared/projects/cli.fixture.ts";
import { invokeJson } from "#shared/projects/cli.json.ts";

for (const args of [[], ["--help"], ["help"]]) {
  test(`@S0004-R01 application help ${args.join(" ")}`, async ({ cli }) => {
    const result = await cli.run({ arguments: args });
    expectApplicationHelp(result);
  });
}
for (const args of [
  ["help", "help"],
  ["help", "--help"],
]) {
  test(`@S0004-R01 command help ${args.join(" ")}`, async ({ cli }) => {
    const result = await cli.run({ arguments: args });
    expectCommandHelp(result);
  });
}
for (const args of [["missing-command"], ["help", "--unknown"]]) {
  test(`@S0004-R02 invalid invocation ${args.join(" ")}`, async ({ cli }) => {
    const result = await cli.run({ arguments: args });
    expectUsageError(result);
  });
}
test("@S0004-R03 help returns one JSON object", async ({ cli }) => {
  const result = await invokeJson({ cli, input: { arguments: ["help"] } });
  expectJsonHelp(result);
});
for (const name of ["toString", "constructor", "__proto__"]) {
  test(`@S0004-R02 rejects undeclared inherited option ${name}`, async ({ cli }) => {
    const result = await cli.run({ arguments: ["help", `--${name}=value`] });
    expectUsageError(result);
  });
  test(`@S0004-R03 returns JSON for undeclared inherited option ${name}`, async ({ cli }) => {
    const result = await cli.run({ arguments: ["--json", "help", `--${name}=value`] });
    expectParserJsonFailure(result);
  });
}
test("@S0004-R03 failures return JSON with their exit code", async ({ cli }) => {
  const result = await invokeJson({ cli, input: { arguments: ["missing-command"] } });
  expectJsonFailure(result);
});
test("@S0004-R03 parser failures return one JSON error without stderr", async ({ cli }) => {
  const result = await cli.run({ arguments: ["--json", "help", "--unknown"] });
  expectParserJsonFailure(result);
});
test("@S0004-R03 a positional JSON token keeps text failures", async ({ cli }) => {
  const result = await cli.run({ arguments: ["--", "--json"] });
  expectPositionalJsonFailure(result);
});
test("@S0004-R04 reports a configuration file that is a folder", async ({ cli }) => {
  const result = await cli.run({
    arguments: ["help"],
    environment: { CONFIG_FILE: cli.directory },
  });
  expectConfigurationFailure(result, cli.directory);
});
test("@S0004-R05 logs command and exit code without argument values", async ({ cli }) => {
  const value = join(cli.directory, "private-log-folder");
  const result = await cli.run({ arguments: ["help", "--log-dir", value] });
  expectExit(result, 0);
  const files = await readdir(value);
  const logs = await Promise.all(files.map((file) => readFile(join(value, file), "utf8")));
  const text = logs.join("");
  expectInvocationLog(text, value);
});
