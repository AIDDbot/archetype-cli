import { expect, it } from "vite-plus/test";
import { isEmpty, isMissing, isOneOf, isRecord, isText } from "#shared/values/values.check.ts";

it("finds a missing value", () => {
  expect(isMissing(null)).toBe(true);
  expect(isMissing(undefined)).toBe(true);
  expect(isMissing(0)).toBe(false);
  expect(isMissing("")).toBe(false);
});

it("accepts a key-value object", () => {
  expect(isRecord({ id: 1 })).toBe(true);
  expect(isRecord([1])).toBe(false);
  expect(isRecord(null)).toBe(false);
  expect(isRecord("no")).toBe(false);
});

it("accepts text that is not only spaces", () => {
  expect(isText(" a ")).toBe(true);
  expect(isText("  ")).toBe(false);
  expect(isText(1)).toBe(false);
});

it("finds an empty value", () => {
  const empty = [undefined, null, "  ", [], {}];
  const full = ["a", [0], { id: 1 }, 0, false];
  for (const value of empty) expect(isEmpty(value)).toBe(true);
  for (const value of full) expect(isEmpty(value)).toBe(false);
});

it("narrows a closed list", () => {
  const themes = ["light", "dark"] as const;
  expect(isOneOf("dark", themes)).toBe(true);
  expect(isOneOf("blue", themes)).toBe(false);
});
