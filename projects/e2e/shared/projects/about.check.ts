import { expect } from "vitest";
import { expectExit } from "#shared/projects/cli.check.ts";
import { readRecord } from "#shared/page-objects/output.read.ts";
import type { CliResult } from "#shared/projects/cli.contract.ts";
import type { JsonInvocation } from "#shared/projects/cli.json.ts";

const identity = {
  name: "Archetype CLI",
  description: "A local command-line application and its acceptance suite",
  author: { name: "Alberto Basalo", url: "https://x.com/albertobasalo" },
};
const technologies = [
  "TypeScript 7",
  "Node.js 26",
  "npm 12",
  "Vite+",
  "Vitest",
  "@types/node",
  "No framework",
];

export function expectVersion(result: CliResult, about: JsonInvocation): void {
  expectExit(result, 0);
  expect(result.stdout).toBe(`${String(about.object.version)}\n`);
  expect(result.stdout).toMatch(/^\d+\.\d+\.\d+\n$/);
  expect(result.stderr).toBe("");
}

export function expectAboutRecord(result: CliResult, version: CliResult): void {
  expectExit(result, 0);
  expect(result.stderr).toBe("");
  const record = readRecord(result.stdout);
  expect(record).toMatchObject({
    Name: identity.name,
    Description: identity.description,
    Version: version.stdout.trimEnd(),
    Author: `${identity.author.name} (${identity.author.url})`,
  });
  for (const project of ["cli", "e2e"]) {
    expect(record[project]).toContain(`${project} (${project})`);
    for (const technology of technologies) {
      expect(record[project]).toContain(technology);
    }
  }
  expect(record.cli).toContain("@vitest/coverage-v8");
  const columns = Object.entries(record).map(([label, value]) => {
    const line = result.stdout.split("\n").find((item) => item.startsWith(`${label}:`));
    expect(line).toBeDefined();
    return line?.indexOf(value);
  });
  expect(new Set(columns).size).toBe(1);
}

export function expectAboutJson(result: JsonInvocation, version: CliResult): void {
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.object).toEqual({
    ...identity,
    version: version.stdout.trimEnd(),
    projects: [
      {
        name: "cli",
        type: "cli",
        technologies: expect.arrayContaining([...technologies, "@vitest/coverage-v8"]),
      },
      { name: "e2e", type: "e2e", technologies: expect.arrayContaining(technologies) },
    ],
  });
}
