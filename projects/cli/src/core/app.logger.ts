import { join } from "node:path";
import { formatDate, formatTime } from "#shared/values/dates.format.ts";
import type { Logger, LogLevel } from "#shared/logging/logger.type.ts";
import { logFiles } from "./files.adapter.ts";
const levels = ["debug", "info", "warn", "error"];
export interface LogOutput {
  mkdir(path: string, options: { recursive: true }): Promise<unknown>;
  appendFile(path: string, data: string): Promise<void>;
  error(message: string): void;
}
export interface LogEntry {
  date: Date;
  level: LogLevel;
  message: string;
}
export function formatLog(input: LogEntry): string {
  return `${formatTime(input.date)} cli ${input.level.toUpperCase()} ${input.message.replace(/\r\n|\r|\n/g, " | ")}`;
}
export interface LoggerOptions {
  directory?: string | undefined;
  level: string;
  quietConsole?: boolean;
}
export function createLogger(
  options: LoggerOptions,
  output: LogOutput = { ...logFiles, error: console.error },
): Logger {
  let queue = Promise.resolve();
  return {
    log(level, message) {
      const isBelowLevel = levels.indexOf(level) < levels.indexOf(options.level);
      if (isBelowLevel) return;
      const date = new Date();
      const line = formatLog({ date, level, message });
      const isVisible = level === "warn" || level === "error";
      if (isVisible && !options.quietConsole) output.error(line);
      const { directory } = options;
      const isConsoleOnly = directory === undefined;
      if (isConsoleOnly) return;
      const write = async () => {
        await output.mkdir(directory, { recursive: true });
        await output.appendFile(join(directory, `${formatDate(date)}.log`), `${line}\n`);
      };
      queue = queue
        .then(() => write())
        .catch(() => {
          /* Logging must not block a command. */
        });
    },
    stop: () => queue,
  };
}
