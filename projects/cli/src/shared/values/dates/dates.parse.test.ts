import { expect, it } from "vite-plus/test";
import { parseDate } from "#shared/values/dates/dates.parse.ts";

it("parses an ISO date, or an ISO date and time", () => {
  expect(parseDate("2026-10-21", "since").toISOString()).toBe("2026-10-21T00:00:00.000Z");
  expect(parseDate(" 2026-10-21T10:30:00Z ", "since").toISOString()).toBe(
    "2026-10-21T10:30:00.000Z",
  );
});

it("rejects a value that is not an ISO date", () => {
  const invalid = ["21/10/2026", "2026-13-40", "", undefined, 20261021];
  for (const value of invalid) {
    expect(() => parseDate(value, "since")).toThrow("since is an ISO date");
  }
});
