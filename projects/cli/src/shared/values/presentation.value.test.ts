import { expect, it } from "vitest";
import { presentValue } from "./presentation.value.ts";

it.each([
  [null, "—", null],
  [undefined, "—", null],
  ["Name", "Name", "Name"],
  [12.5, "12.5", 12.5],
  [true, "true", true],
  [false, "false", false],
  [{ milliseconds: 1250 }, "1250ms", 1250],
] as const)("presents %s for a person and a machine", (value, text, json) => {
  expect(presentValue(value)).toEqual({ text, json });
});
it("shows local date and time with an ISO machine value", () => {
  const date = new Date(2026, 0, 2, 3, 4, 5);
  expect(presentValue(date)).toEqual({ text: "2026-01-02 03:04:05", json: date.toISOString() });
});
