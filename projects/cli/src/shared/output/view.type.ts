export type ViewValue =
  | string
  | number
  | boolean
  | Date
  | { milliseconds: number }
  | { items: readonly string[] };
export interface RecordView {
  kind: "record";
  facts: readonly { label: string; value: ViewValue }[];
}
export interface ListView {
  kind: "list";
  records: string;
  columns: readonly string[];
  rows: readonly (readonly ViewValue[])[];
}
export type View = RecordView | ListView;
