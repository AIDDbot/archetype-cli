import { expect, it } from "vite-plus/test";
import { formatMilliseconds, toSeconds } from "#shared/values/durations/durations.format.ts";

it("formats a duration in whole milliseconds", () => {
  expect(formatMilliseconds(9.520_999)).toBe("10ms");
  expect(formatMilliseconds(0.4)).toBe("0ms");
  expect(formatMilliseconds(1250)).toBe("1250ms");
});

it("converts whole milliseconds to seconds", () => {
  expect(toSeconds(1250.4)).toBe(1.25);
  expect(toSeconds(0)).toBe(0);
});
