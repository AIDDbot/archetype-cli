import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { formatDate, formatTime } from "#shared/dates.format.ts";
import type { Logger, LogLevel } from "#shared/output/logger.type.ts";
const levels = ["debug", "info", "warn", "error"];
export interface LogOutput {
  mkdir(path: string, options: { recursive: true }): Promise<unknown>;
  appendFile(path: string, data: string): Promise<void>;
  error(message: string): void;
}
export function formatLog(input: { date: Date; level: LogLevel; message: string }) {
  return `${formatTime(input.date)} cli ${input.level.toUpperCase()} ${input.message.replace(/\r\n|\r|\n/g, " | ")}`;
}
export function createLogger(
  options: { directory?: string | undefined; level: string; quietConsole?: boolean },
  output: LogOutput = { mkdir, appendFile, error: console.error },
): Logger {
  let queue = Promise.resolve();
  return {
    log(level, message) {
      if (levels.indexOf(level) < levels.indexOf(options.level)) return;
      const date = new Date();
      const line = formatLog({ date, level, message });
      const isVisible = level === "warn" || level === "error";
      if (isVisible && !options.quietConsole) output.error(line);
      const { directory } = options;
      if (directory === undefined) return;
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
