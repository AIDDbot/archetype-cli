import { expect } from "vite-plus/test";
import type { CliResult } from "./cli.ts";
export function expectFailure(result: Pick<CliResult, "code" | "stderr">, code: number): void {
  expect(result.code).toBe(code);
  expect(result.stderr).toMatch(/^error: .+/m);
}
