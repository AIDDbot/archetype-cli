import { test } from "#shared/projects/cli.fixture.ts";
import { invokeJson } from "#shared/projects/cli.json.ts";
import { expectVersion, expectAboutRecord, expectAboutJson } from "#shared/projects/about.check.ts";

for (const args of [["--version"], ["--version", "--json"]]) {
  test(`@S0005-R01 version is plain text ${args.join(" ")}`, async ({ cli }) => {
    const about = await invokeJson({ cli, input: { arguments: ["about"] } });
    const result = await cli.run({ arguments: args });
    expectVersion(result, about);
  });
}
test("@S0005-R02 about has aligned identity and project facts", async ({ cli }) => {
  const result = await cli.run({ arguments: ["about"] });
  const version = await cli.run({ arguments: ["--version"] });
  expectAboutRecord(result, version);
});
test("@S0005-R02 about JSON has the identity and each project technology", async ({ cli }) => {
  const result = await invokeJson({ cli, input: { arguments: ["about"] } });
  const version = await cli.run({ arguments: ["--version"] });
  expectAboutJson(result, version);
});
