import { expect } from "vitest";
import type { CliResult } from "./cli.contract.ts";
import type { JsonInvocation } from "./cli.json.ts";
export function expectApplicationHelp(result: CliResult): void {
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.stdout).toMatch(/^\S.+\n\S.+\nUsage:/);
  expect(result.stdout).toContain("help  Show command help");
}
export function expectCommandHelp(result: CliResult): void {
  expect(result.code).toBe(0);
  expect(result.stdout).toContain("Usage: help [command]");
  expect(result.stdout).toContain("--json  Write JSON");
}
export function expectUsageError(result: CliResult): void {
  expect(result.code).toBe(2);
  expect(result.stdout).toBe("");
  expect(result.stderr).toMatch(/error: .+\n/);
  expect(result.stderr).toContain("Usage:");
}
export function expectJsonHelp(result: JsonInvocation): void {
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.object).toMatchObject({
    name: expect.stringMatching(/\S/),
    commands: expect.arrayContaining([
      expect.objectContaining({
        name: "help",
        summary: expect.stringMatching(/\S/),
        usage: expect.stringMatching(/\S/),
      }),
    ]),
  });
}
export function expectJsonFailure(result: JsonInvocation): void {
  expect(result.code).toBe(2);
  expect(result.stderr).toBe("");
  expect(result.object).toEqual({ error: expect.stringMatching(/missing-command/) });
}
export function expectParserJsonFailure(result: CliResult): void {
  expect(result.code).toBe(2);
  expect(result.stderr).toBe("");
  expect(result.stdout).toBe('{"error":"Invalid command arguments"}\n');
}
export function expectPositionalJsonFailure(result: CliResult): void {
  expectUsageError(result);
  expect(result.stderr).toContain("error: Unknown command: --json\n");
  expect(result.stderr).toContain("Failure: usage");
}
export function expectConfigurationFailure(result: CliResult, path: string): void {
  expect(result.code).toBe(3);
  expect(result.stderr).toContain(`error: Cannot read configuration: ${path}`);
  expect(result.stdout).toBe("");
}
export function expectInvocationLog(text: string, value: string): void {
  expect(text).toContain("command=help exit=0");
  expect(text).not.toContain(value);
  expect(text.trim().split("\n")).toHaveLength(1);
}
