import { expect, it } from "vite-plus/test";
import { padText, truncateText } from "#shared/values/text/text.format.ts";

it("keeps a text that fits", () => {
  expect(truncateText("Ada", 3)).toBe("Ada");
});

it("cuts a long text with an ellipsis, inside the width", () => {
  expect(truncateText("Lovelace", 5)).toBe("Love…");
  expect(truncateText("Lovelace", 1)).toBe("…");
});

it("pads a text to a column, at the start or the end", () => {
  expect(padText("id", { width: 5, align: "start" })).toBe("id   ");
  expect(padText("42", { width: 5, align: "end" })).toBe("   42");
});

it("cuts a text that does not fit its column", () => {
  expect(padText("Lovelace", { width: 5, align: "start" })).toBe("Love…");
});
