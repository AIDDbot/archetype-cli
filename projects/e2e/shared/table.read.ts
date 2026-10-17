export function readTable(text: string): Record<string, string>[] {
  const [header = "", ...lines] = text.trimEnd().split(/\r?\n/);
  const columns = Array.from(header.matchAll(/\S.*?(?= {2,}|$)/g), (match) => ({
    name: match[0],
    start: match.index,
  }));
  return lines.map((line) =>
    Object.fromEntries(
      columns.map((column, index) => [
        column.name,
        line.slice(column.start, columns[index + 1]?.start).trim(),
      ]),
    ),
  );
}
