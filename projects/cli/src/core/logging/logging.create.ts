import type { LogEvent, Logger, LogLevel } from "#shared/logging/logging.contract.ts";
import { formatDate, formatTime } from "#shared/values/dates/dates.format.ts";

export type LoggerInput = {
  source: string;
  level: LogLevel;
  directory: string | undefined;
  clock: () => Date;
  append: (file: string, line: string) => Promise<void>;
  stderr: (line: string) => void;
};
const ranks: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

async function persist(input: LoggerInput, entry: LogEntry): Promise<void> {
  const unavailable = input.directory === undefined;
  if (unavailable) {
    input.stderr(entry.line);
    return;
  }
  try {
    await input.append(`${input.directory}/${entry.day}.log`, entry.line);
  } catch {
    input.stderr(entry.line);
  }
}

type LogEntry = { day: string; line: string };

function formatEntry(input: LoggerInput, event: LogEvent): LogEntry {
  const date = input.clock();
  const message = event.message.replace(/[\r\n]+/g, " | ");
  return {
    day: formatDate(date),
    line: `${formatTime(date)} ${input.source} ${event.level.toUpperCase()} ${message}\n`,
  };
}

export function createLogger(input: LoggerInput): Logger {
  let queue = Promise.resolve();
  const write = (event: LogEvent): void => {
    const filtered = ranks[event.level] < ranks[input.level];
    if (filtered) return;
    const entry = formatEntry(input, event);
    const urgent = ranks[event.level] >= ranks.warn;
    if (urgent) input.stderr(entry.line);
    queue = queue.then(() => persist(input, entry));
  };
  return { write, stop: () => queue };
}
