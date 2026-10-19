import { expect, test } from "vite-plus/test";
import { isRecord, isText, isOneOf, findByName, requireByName } from "./checks.guard.ts";
import { requireText } from "./text.parse.ts";
import { parseInteger } from "./numbers.parse.ts";
import { formatDate, formatTime, formatDateTime } from "./dates.format.ts";
import { ExpectedError, attempt } from "#shared/expected.error.ts";
test("checks records, text and closed values", () => {
  expect(isRecord({})).toBe(true);
  for (const value of [null, [], "text", 1]) expect(isRecord(value)).toBe(false);
  expect(isText(" x ")).toBe(true);
  for (const value of [null, "", "  ", 1]) expect(isText(value)).toBe(false);
  expect(isOneOf("a", ["a", "b"] as const)).toBe(true);
  expect(isOneOf("c", ["a", "b"] as const)).toBe(false);
});
test("finds named items or reports the missing name and kind", () => {
  const items = [{ name: "first" }];
  expect(findByName(items, "first")).toBe(items[0]);
  expect(findByName(items, "missing")).toBeUndefined();
  expect(requireByName(items, { name: "first", kind: "item" })).toBe(items[0]);
  expect(() => requireByName(items, { name: "missing", kind: "item" })).toThrow(
    "item not found: missing",
  );
});
test("requires and trims text", () => {
  expect(requireText(" a ", "name")).toBe("a");
  expect(() => requireText("  ", "name")).toThrow(ExpectedError);
});
test("parses an integer within the declared range", () => {
  const range = { field: "count", min: 1, max: 3 };
  expect(parseInteger("2", range)).toBe(2);
  expect(parseInteger(1, range)).toBe(1);
  expect(parseInteger(3, range)).toBe(3);
  for (const value of ["", " ", null, true, "x", 1.5, 0, 4])
    expect(() => parseInteger(value, range)).toThrow("count must be an integer from 1 to 3");
});
test("formats local calendar and clock values", () => {
  const date = new Date(2026, 0, 2, 3, 4, 5, 6);
  expect(formatDate(date)).toBe("2026-01-02");
  expect(formatTime(date)).toBe("03:04:05.006");
  expect(formatDateTime(date)).toBe("2026-01-02 03:04:05");
});
test("keeps expected errors and translates external failures", async () => {
  const error = new ExpectedError("rule", "message");
  expect(error.kind).toBe("rule");
  expect(error.message).toBe("message");
  expect(await attempt(() => "result", "failed")).toBe("result");
  await expect(
    attempt(() => {
      throw new Error("internal");
    }, "failed"),
  ).rejects.toMatchObject({ kind: "unavailable", message: "failed" });
});
