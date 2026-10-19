export type LogLevel = "debug" | "info" | "warn" | "error";
export interface Logger {
  log(level: LogLevel, message: string): void;
  stop(): Promise<void>;
}
