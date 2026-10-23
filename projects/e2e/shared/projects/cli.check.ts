import { expect } from "vitest";
import type { CliResult } from "./cli.contract.ts";

export type ExpectedFailure = { code: number; message: string };

export function expectExit(result: CliResult, code: number): void {
  expect(result.code).toBe(code);
}

export function expectError(result: CliResult, expected: ExpectedFailure): void {
  expectExit(result, expected.code);
  expect(result.stderr.split(/\r?\n/)).toContain(`error: ${expected.message}`);
}
