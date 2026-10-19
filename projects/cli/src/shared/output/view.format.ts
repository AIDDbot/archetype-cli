import type { View } from "./view.type.ts";
import { formatValue } from "./values.format.ts";
import { emptyMessage } from "./states.format.ts";

export function formatView(view: View): string {
  const isRecordView = view.kind === "record";
  if (isRecordView) {
    const width = Math.max(...view.facts.map(({ label }) => label.length));
    return view.facts
      .map(({ label, value }) => `${`${label}:`.padEnd(width + 2)}${formatValue(value)}`)
      .join("\n");
  }
  const isEmpty = view.rows.length === 0;
  if (isEmpty) return emptyMessage(view.records);
  const rows = [view.columns, ...view.rows.map((row) => row.map(formatValue))];
  const widths = view.columns.map((_, index) =>
    Math.max(...rows.map((row) => (row[index] ?? "").length)),
  );
  return rows
    .map((row) =>
      row
        .map((value, index) => value.padEnd(widths[index] ?? 0))
        .join("  ")
        .trimEnd(),
    )
    .join("\n");
}
