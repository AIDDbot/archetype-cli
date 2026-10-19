import { expect } from "vite-plus/test";
import type { Cli } from "./cli.ts";
export interface JsonResult {
  code: number | null;
  data: unknown;
}
export async function runJson(cli: Cli, args: string[]): Promise<JsonResult> {
  const result = await cli.run(["--json", ...args]);
  expect(result.stderr).toBe("");
  const data: unknown = JSON.parse(result.stdout);
  expect(data).toBeTypeOf("object");
  expect(Array.isArray(data)).toBe(false);
  expect(data).not.toBeNull();
  return { code: result.code, data };
}
