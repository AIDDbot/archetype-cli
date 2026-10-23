import { presentValue } from "#shared/values/presentation.value.ts";
import { padText } from "#shared/values/text/text.format.ts";
import type {
  ListView,
  OutputView,
  RecordView,
  RenderedView,
  ViewField,
  ViewRecord,
} from "./view.contract.ts";

function standardRecord(
  fields: readonly ViewField[],
  record: ViewRecord,
): Readonly<Record<string, unknown>> {
  return Object.fromEntries(
    fields.map((field) => [field.key, presentValue(record[field.key]).json]),
  );
}

function recordView(view: RecordView): RenderedView {
  const width = Math.max(0, ...view.fields.map((field) => field.label.length));
  const lines = view.fields.map((field) => {
    const label = padText(`${field.label}:`, { width: width + 1, align: "start" });
    return `${label} ${presentValue(view.record[field.key]).text}`;
  });
  return { text: lines.join("\n"), json: standardRecord(view.fields, view.record) };
}

function listView(view: ListView): RenderedView {
  const columns = view.fields.map((field) => ({
    ...field,
    width: Math.max(
      field.label.length,
      ...view.records.map((record) => presentValue(record[field.key]).text.length),
    ),
  }));
  const heading = columns
    .map((column) => padText(column.label, { width: column.width, align: "start" }))
    .join("  ")
    .trimEnd();
  const rows = view.records.map((record) =>
    columns
      .map((column) =>
        padText(presentValue(record[column.key]).text, { width: column.width, align: "start" }),
      )
      .join("  ")
      .trimEnd(),
  );
  const lines = [heading, ...rows];
  const empty = view.records.length === 0;
  const hasColumns = columns.length > 0;
  const table = hasColumns ? lines.join("\n") : "";
  const text = empty ? `No ${view.name}.` : table;
  return { text, json: view.records.map((record) => standardRecord(view.fields, record)) };
}

const renderers = { record: recordView, list: listView };
export function renderView(view: OutputView): RenderedView {
  const record = view.kind === "record";
  return record ? renderers.record(view) : renderers.list(view);
}
