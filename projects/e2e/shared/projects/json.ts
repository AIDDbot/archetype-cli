import { expect } from "vite-plus/test";
import type { createCli } from "./cli.ts";
export async function runJson(cli: Awaited<ReturnType<typeof createCli>>, args: string[]) {
  const result = await cli.run(["--json", ...args]);
  expect(result.stderr).toBe("");
  const data: unknown = JSON.parse(result.stdout);
  expect(data).toBeTypeOf("object");
  expect(Array.isArray(data)).toBe(false);
  expect(data).not.toBeNull();
  return { code: result.code, data };
}
