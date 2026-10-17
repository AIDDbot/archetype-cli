import { expect, test } from "vite-plus/test";
import { cp, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createCliSetup } from "../../shared/projects/setup.ts";
import { runJson } from "../../shared/projects/json.ts";
import { cliDirectory } from "../../shared/projects/settings.ts";
import { technologies } from "../../shared/test-data/technologies.ts";

const identity = JSON.parse(await readFile(resolve(cliDirectory, "../../package.json"), "utf8"));
const author = typeof identity.author === "string" ? identity.author : identity.author.name;
const projects = [
  { name: "cli", type: "cli", technologies },
  { name: "e2e", type: "e2e", technologies },
];
const setup = createCliSetup();

test("@S0005-R01 version writes only the root identity version", async () => {
  const cli = await setup();
  const result = await cli.run(["--version"]);
  expect(result.code).toBe(0);
  expect(result.stdout).toBe(`${identity.version}\n`);
  expect(result.stderr).toBe("");
});

test("@S0005-R02 about shows identity and each project", async () => {
  const cli = await setup();
  const result = await cli.run(["about"]);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  for (const value of [
    identity.displayName ?? identity.name,
    identity.description,
    identity.version,
    author,
    identity.homepage,
  ])
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
  expect(result.data).toMatchObject({
    name: identity.displayName ?? identity.name,
    description: identity.description,
    version: identity.version,
    author,
    homepage: identity.homepage,
    projects: expect.arrayContaining(projects),
  });
});

test("@S0005-R04 version stays text with either JSON option order", async () => {
  const cli = await setup();
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

test("@S0005-R05 absent author uses the default author and website", async () => {
  const cli = await setup();
  const project = join(cli.directory, "projects", "cli");
  await cp(join(cliDirectory, "src"), join(project, "src"), { recursive: true });
  await cp(join(cliDirectory, "package.json"), join(project, "package.json"));
  const copy = { ...identity };
  delete copy.author;
  copy.homepage = "https://example.invalid";
  await writeFile(join(cli.directory, "package.json"), JSON.stringify(copy));
  const text = await cli.run(["about"], { project });
  expect(text.code).toBe(0);
  expect(text.stdout).toContain("AIDDbot");
  expect(text.stdout).toContain("https://aiddbot.com");
  const json = await cli.run(["about", "--json"], { project });
  expect(json.code).toBe(0);
  expect(json.stderr).toBe("");
  expect(JSON.parse(json.stdout)).toMatchObject({
    author: "AIDDbot",
    homepage: "https://aiddbot.com",
  });
});
