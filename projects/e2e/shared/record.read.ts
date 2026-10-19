export function readRecord(text: string) {
  return text
    .trimEnd()
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = /^([^:]+):\s+(.*)$/.exec(line);
      const isRecordLine = match !== null;
      if (!isRecordLine) return [];
      return [{ label: match[1], value: match[2], column: line.length - (match[2]?.length ?? 0) }];
    });
}
