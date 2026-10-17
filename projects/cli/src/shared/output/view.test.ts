import { expect, test } from "vite-plus/test";
import { formatView } from "./view.format.ts";
import { formatValue, machineValue } from "./values.format.ts";

test("an empty list names its records", () => {
  expect(formatView({ kind: "list", records: "settings", columns: ["Setting"], rows: [] })).toBe(
    "No settings.",
  );
});

test("tables align each column for headers and values", () => {
  const text = formatView({
    kind: "list",
    records: "settings",
    columns: ["Setting", "Value", "Source"],
    rows: [
      ["A", "long value", "default"],
      ["LONG_SETTING", "x", "file"],
    ],
  });
  const lines = text.split("\n");
  expect(
    lines.map((line) =>
      line.indexOf("Value") >= 0
        ? line.indexOf("Value")
        : line.indexOf(line.includes("long value") ? "long value" : "x"),
    ),
  ).toEqual([14, 14, 14]);
  expect(lines.map((line) => line.search(/Source|default|file/))).toEqual([26, 26, 26]);
});

test("record values start in the same column", () => {
  expect(
    formatView({
      kind: "record",
      facts: [
        { label: "Name", value: "Application" },
        { label: "Description", value: "Example" },
      ],
    }),
  ).toBe("Name:        Application\nDescription: Example");
});

test("tables format missing cells and cells without a column header", () => {
  expect(
    formatView({
      kind: "list",
      records: "settings",
      columns: ["Setting", "Value"],
      rows: [["A"], ["B", "x", "extra"]],
    }),
  ).toBe("Setting  Value\nA\nB        x      extra");
});

test("dates have a readable local value and an ISO machine value", () => {
  const date = new Date(2026, 0, 2, 3, 4, 5);
  expect(formatValue(date)).toBe("2026-01-02 03:04:05");
  expect(machineValue(date)).toBe(date.toISOString());
});

test("shared values format collections for people and retain machine arrays", () => {
  const items = ["TypeScript 7", "Node.js"];
  expect(formatValue({ items })).toBe("TypeScript 7, Node.js");
  expect(machineValue({ items })).toBe(items);
});

test("durations show readable units and preserve milliseconds for machines", () => {
  for (const [milliseconds, text] of [
    [250, "250 ms"],
    [1500, "1.5 s"],
    [120000, "2 min"],
  ] as const) {
    expect(formatValue({ milliseconds })).toBe(text);
    expect(machineValue({ milliseconds })).toBe(milliseconds);
  }
});
