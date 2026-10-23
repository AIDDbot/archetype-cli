import type { DisplayValue } from "#shared/values/presentation.value.ts";

export type ViewField = { key: string; label: string };
export type ViewRecord = Readonly<Record<string, DisplayValue>>;
export type RecordView = { kind: "record"; fields: readonly ViewField[]; record: ViewRecord };
export type ListView = {
  kind: "list";
  fields: readonly ViewField[];
  records: readonly ViewRecord[];
  name: string;
};
export type OutputView = RecordView | ListView;
export type RenderedView = { text: string; json: unknown };
