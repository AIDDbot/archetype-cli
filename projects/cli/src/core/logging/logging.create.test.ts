import { expect, it, vi } from "vitest";
import { createLogger, type LoggerInput } from "./logging.create.ts";

function fixture(): LoggerInput {
  return {
    source: "cli",
    level: "info",
    directory: "/logs",
    clock: () => new Date(2026, 0, 1, 23, 59, 59, 7),
    append: vi.fn<LoggerInput["append"]>(async () => {}),
    stderr: vi.fn<LoggerInput["stderr"]>(),
  };
}
it("formats local time, source and multiline messages and filters debug", async () => {
  const input = fixture();
  const logger = createLogger(input);
  logger.write({ level: "debug", message: "hidden" });
  logger.write({ level: "info", message: "first\r\nsecond" });
  await logger.stop();
  expect(input.append).toHaveBeenCalledExactlyOnceWith(
    "/logs/2026-01-01.log",
    "23:59:59.007 cli INFO first | second\n",
  );
  expect(input.stderr).not.toHaveBeenCalled();
});
it.each(["debug", "info", "warn", "error"] as const)("filters levels below %s", async (level) => {
  const input = { ...fixture(), level };
  const logger = createLogger(input);
  logger.write({ level, message: "visible" });
  await logger.stop();
  expect(input.append).toHaveBeenCalledOnce();
});
it("uses each event date and waits for queued writes at stop", async () => {
  let day = 1;
  const { promise: pending, resolve: finish } = Promise.withResolvers<void>();

  const append = vi.fn<LoggerInput["append"]>(async () => pending);
  const input = { ...fixture(), clock: () => new Date(2026, 0, day), append };
  const logger = createLogger(input);
  logger.write({ level: "warn", message: "before" });
  day = 2;
  logger.write({ level: "error", message: "after" });
  const stopped = vi.fn<() => void>();
  const stopping = logger.stop().then(stopped);
  await Promise.resolve();
  expect(stopped).not.toHaveBeenCalled();
  finish();
  await stopping;
  expect(append.mock.calls.map(([file]) => file)).toEqual([
    "/logs/2026-01-01.log",
    "/logs/2026-01-02.log",
  ]);
  expect(input.stderr).toHaveBeenCalledTimes(2);
});
it("continues after a failed append", async () => {
  const append = vi
    .fn<LoggerInput["append"]>()
    .mockRejectedValueOnce(Error("disk"))
    .mockResolvedValueOnce(undefined);
  const input = { ...fixture(), append };
  const logger = createLogger(input);
  logger.write({ level: "info", message: "first" });
  logger.write({ level: "info", message: "second" });
  await logger.stop();
  expect(append).toHaveBeenCalledTimes(2);
  expect(input.stderr).toHaveBeenCalledExactlyOnceWith("23:59:59.007 cli INFO first\n");
});
it("writes only to stderr with an invalid directory", async () => {
  const input = { ...fixture(), directory: undefined };
  const logger = createLogger(input);
  logger.write({ level: "info", message: "fallback" });
  await logger.stop();
  expect(input.append).not.toHaveBeenCalled();
  expect(input.stderr).toHaveBeenCalledOnce();
});
