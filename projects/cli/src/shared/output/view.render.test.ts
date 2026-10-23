import { expect, it } from "vitest";
import { renderView } from "./view.render.ts";

const fields = [
  { key: "name", label: "Name" },
  { key: "count", label: "Count" },
];
it("aligns record values and preserves declared fact order", () => {
  expect(
    renderView({ kind: "record", fields, record: { count: 2, name: "A", extra: "hidden" } }),
  ).toEqual({
    text: "Name:  A\nCount: 2",
    json: { name: "A", count: 2 },
  });
});
it("aligns each table column with headings and longer values", () => {
  expect(
    renderView({
      kind: "list",
      fields,
      name: "items",
      records: [{ name: "Long name", count: 12 }, { name: "A" }],
    }),
  ).toEqual({
    text: "Name       Count\nLong name  12\nA          —",
    json: [
      { name: "Long name", count: 12 },
      { name: "A", count: null },
    ],
  });
});
it("shows the empty state and a standard empty list", () => {
  expect(renderView({ kind: "list", fields, name: "items", records: [] })).toEqual({
    text: "No items.",
    json: [],
  });
});
it("handles a record with no facts and a list with no columns", () => {
  expect(renderView({ kind: "record", fields: [], record: {} })).toEqual({ text: "", json: {} });
  expect(renderView({ kind: "list", fields: [], records: [{}], name: "items" })).toEqual({
    text: "",
    json: [{}],
  });
});
