import { expect, test } from "vite-plus/test";
import { createCliSetup } from "#shared/projects/setup.ts";
import { runJson } from "#shared/projects/json.ts";
import { expectIdentity } from "#shared/projects/identity.ts";
import { readRecord } from "#shared/record.read.ts";
import { technologies } from "#shared/test-data/technologies.ts";

const setup = createCliSetup();

test("@S0006-R01 about labels and aligns identity and project facts", async () => {
  const cli = await setup();
  const about = await runJson(cli, ["about"]);
  const identity = expectIdentity(about.data);
  const result = await cli.run(["about"]);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  const facts = readRecord(result.stdout);
  const values = {
    Name: identity.name,
    Description: identity.description,
    Version: identity.version,
    Author: identity.author.name,
    Website: identity.author.url,
  };
  const column = facts.find(({ label }) => label === "Name")?.column;
  expect(column).toBeTypeOf("number");
  for (const [label, value] of Object.entries(values))
    expect(facts).toContainEqual({ label, value, column });
  for (const name of ["cli", "e2e"]) {
    const fact = facts.find(({ label }) => label === `${name} (${name})`);
    expect(fact?.column).toBe(column);
    for (const technology of technologies) expect(fact?.value).toContain(technology);
  }
});
