import { expect, test } from "vite-plus/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cliDirectory } from "../../shared/projects/settings.ts";
import { createCliSetup } from "../../shared/projects/setup.ts";
import { readRecord } from "../../shared/record.read.ts";
import { technologies } from "../../shared/test-data/technologies.ts";

const setup = createCliSetup();

function readAuthorName(author: string | { name: string }): string {
  return typeof author === "string" ? author : author.name;
}

test("@S0006-R01 about labels and aligns identity and project facts", async () => {
  const cli = await setup();
  const identity = JSON.parse(await readFile(resolve(cliDirectory, "../../package.json"), "utf8"));
  const result = await cli.run(["about"]);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  const facts = readRecord(result.stdout);
  const values = {
    Name: identity.displayName ?? identity.name,
    Description: identity.description,
    Version: identity.version,
    Author: readAuthorName(identity.author),
    Homepage: identity.homepage,
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
