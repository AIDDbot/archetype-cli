export type TextRecord = Readonly<Record<string, string>>;
export type TextTable = readonly TextRecord[];
type Column = { label: string; start: number; end: number | undefined };

function columns(header: string): readonly Column[] {
  const matches = [...header.matchAll(/\S.*?(?= {2,}|$)/g)];
  return matches.map((match, index) => ({
    label: match[0],
    start: match.index,
    end: matches[index + 1]?.index,
  }));
}

export function readTable(text: string): TextTable {
  const [header = "", ...rows] = text.trimEnd().split("\n");
  const empty = header.startsWith("No ") && rows.length === 0;
  if (empty) return [];
  const fields = columns(header);
  return rows.map((row) =>
    Object.fromEntries(
      fields.map((field) => [field.label, row.slice(field.start, field.end).trimEnd()]),
    ),
  );
}

export function readRecord(text: string): TextRecord {
  const lines = text.trimEnd().split("\n");
  const facts = lines.filter((line) => line.includes(":"));
  return Object.fromEntries(
    facts.map((line) => {
      const separator = line.indexOf(":");
      return [line.slice(0, separator), line.slice(separator + 1).trimStart()];
    }),
  );
}
