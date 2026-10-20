import { expect, test } from "vite-plus/test";
import { createCliSetup } from "#shared/projects/setup.ts";
import { runJson } from "#shared/projects/json.ts";
import { expectIdentity } from "#shared/projects/identity.ts";
import { technologies } from "#shared/test-data/technologies.ts";

const projects = [
  { name: "cli", type: "cli", technologies },
  { name: "e2e", type: "e2e", technologies },
];
const setup = createCliSetup();

test("@S0005-R01 version writes only the identity version", async () => {
  const cli = await setup();
  const about = await runJson(cli, ["about"]);
  const identity = expectIdentity(about.data);
  const result = await cli.run(["--version"]);
  expect(result.code).toBe(0);
  expect(result.stdout).toBe(`${identity.version}\n`);
  expect(result.stderr).toBe("");
});

test("@S0005-R02 about shows identity and each project", async () => {
  const cli = await setup();
  const about = await runJson(cli, ["about"]);
  const identity = expectIdentity(about.data);
  const result = await cli.run(["about"]);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  const { name, description, version, author } = identity;
  for (const value of [name, description, version, author.name, author.url])
    expect(result.stdout).toContain(value);
  for (const project of projects) {
    expect(result.stdout).toContain(`${project.name} (${project.type})`);
    for (const technology of project.technologies) expect(result.stdout).toContain(technology);
  }
  for (const args of [
    ["about", "extra"],
    ["about", "--unknown"],
  ]) {
    const invalid = await cli.run(args);
    expect(invalid.code).toBe(2);
    expect(invalid.stdout).toBe("");
    expect(invalid.stderr).toContain("error:");
    expect(invalid.stderr).toContain("Usage: about");
  }
});

test("@S0005-R03 about JSON contains identity and each project", async () => {
  const cli = await setup();
  const result = await runJson(cli, ["about"]);
  expect(result.code).toBe(0);
  expectIdentity(result.data);
  expect(result.data).toMatchObject({ projects: expect.arrayContaining(projects) });
});

test("@S0005-R04 version stays text with either JSON option order", async () => {
  const cli = await setup();
  const about = await runJson(cli, ["about"]);
  const identity = expectIdentity(about.data);
  for (const args of [
    ["--version", "--json"],
    ["--json", "--version"],
  ]) {
    const result = await cli.run(args);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe(`${identity.version}\n`);
    expect(result.stderr).toBe("");
  }
});
