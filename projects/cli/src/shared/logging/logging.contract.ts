export type LogLevel = "debug" | "info" | "warn" | "error";
export type LogEvent = { level: LogLevel; message: string };
export type Logger = { write: (event: LogEvent) => void; stop: () => Promise<void> };
