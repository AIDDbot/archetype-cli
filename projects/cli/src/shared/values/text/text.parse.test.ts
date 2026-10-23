import { expect, it } from "vite-plus/test";
import { optionalText, requireLength, requireText } from "#shared/values/text/text.parse.ts";

const name = { field: "name", min: 2, max: 5 };

it("requires text, without the end spaces", () => {
  expect(requireText("  Ada  ", "name")).toBe("Ada");
  expect(() => requireText("  ", "name")).toThrow("name needs text");
  expect(() => requireText(7, "name")).toThrow("name needs text");
});

it("gives nothing for an absent text", () => {
  const absent = [undefined, null, "  "];
  for (const value of absent) expect(optionalText(value, "note")).toBeUndefined();
  expect(optionalText(" hi ", "note")).toBe("hi");
  expect(() => optionalText(7, "note")).toThrow("note needs text");
});

it("requires a text with a length in its range", () => {
  expect(requireLength(" Al ", name)).toBe("Al");
  expect(requireLength("Grace", name)).toBe("Grace");
});

it("refuses a length with no upper limit", () => {
  const open = { field: "name", min: 2, max: Infinity };
  expect(() => requireLength("Ada", open)).toThrow("name needs a closed range");
});

it("rejects a text that is too short or too long", () => {
  const invalid = ["A", "Lovelace"];
  for (const value of invalid) {
    expect(() => requireLength(value, name)).toThrow("name has 2 to 5 characters");
  }
  expect(() => requireLength("", name)).toThrow("name needs text");
});
