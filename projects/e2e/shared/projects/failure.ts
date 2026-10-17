import { expect } from "vite-plus/test";
export function expectFailure(result: { code: number | null; stderr: string }, code: number) {
  expect(result.code).toBe(code);
  expect(result.stderr).toMatch(/^error: .+/m);
}
