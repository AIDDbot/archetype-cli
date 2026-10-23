import { expect, it } from "vite-plus/test";
import { parseBoolean } from "#shared/values/booleans/booleans.parse.ts";

it("parses a boolean, a word or a digit", () => {
  expect(parseBoolean(true, "debug")).toBe(true);
  expect(parseBoolean(" TRUE ", "debug")).toBe(true);
  expect(parseBoolean("false", "debug")).toBe(false);
  expect(parseBoolean("1", "debug")).toBe(true);
  expect(parseBoolean("0", "debug")).toBe(false);
});

it("rejects any other value", () => {
  const invalid = ["yes", "", undefined, 2];
  for (const value of invalid) {
    expect(() => parseBoolean(value, "debug")).toThrow("debug is true, false, 1 or 0");
  }
});
