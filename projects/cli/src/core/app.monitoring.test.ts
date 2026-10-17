import { expect, test, vi } from "vite-plus/test";
import { createLogger, formatLog } from "./app.logger.ts";
import { runApplication } from "./app.lifecycle.ts";
import { ExpectedError } from "../shared/errors/expected.error.ts";
test("converts each line break to a separator", () => {
  expect(
    formatLog({
      date: new Date(2026, 9, 17, 12, 3, 4, 5),
      level: "info",
      message: "one\r\ntwo\nthree\rfour",
    }),
  ).toBe("12:03:04.005 cli INFO one | two | three | four");
});
test.each(["result", undefined])(
  "successful invocation outputs %s and stops logging",
  async (result) => {
    const logger = { log: vi.fn(), stop: vi.fn(async () => {}) };
    const output = vi.fn();
    const error = vi.fn();
    expect(
      await runApplication(async () => result, { command: "cli", logger, output, error }),
    ).toBe(0);
    expect(output.mock.calls).toEqual(result === undefined ? [] : [[result]]);
    expect(error).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      "info",
      expect.stringMatching(/^cli exit=0 duration=\d+ms$/),
    );
    expect(logger.stop).toHaveBeenCalledOnce();
  },
);
test.each([
  { kind: "rule", code: 1, level: "warn" },
  { kind: "usage", code: 2, level: "warn" },
  { kind: "unavailable", code: 3, level: "error" },
] as const)("expected $kind failure uses exit $code", async ({ kind, code, level }) => {
  const logger = { log: vi.fn(), stop: vi.fn(async () => {}) };
  const error = vi.fn();
  const action = async () => {
    throw new ExpectedError(kind, "Cannot continue");
  };
  expect(await runApplication(action, { command: "config", logger, output: vi.fn(), error })).toBe(
    code,
  );
  expect(error).toHaveBeenCalledExactlyOnceWith("error: Cannot continue");
  expect(logger.log).toHaveBeenCalledExactlyOnceWith(
    level,
    expect.stringContaining(`config exit=${code}`),
  );
  expect(logger.stop).toHaveBeenCalledOnce();
});
test("non-error failures log a safe cause", async () => {
  const logger = { log: vi.fn(), stop: vi.fn(async () => {}) };
  await runApplication(
    async () => {
      throw "private detail";
    },
    {
      command: "cli",
      logger,
      output: vi.fn(),
      error: vi.fn(),
    },
  );
  expect(logger.log).toHaveBeenCalledWith("error", "Unexpected failure cause: Non-error exception");
});

function logOutput() {
  return {
    mkdir: vi.fn(async () => undefined),
    appendFile: vi.fn(async () => {}),
    error: vi.fn(),
  };
}
test("logger filters levels, writes lines in order and mirrors warnings and errors", async () => {
  const output = logOutput();
  const logger = createLogger({ directory: "logs", level: "info" }, output);
  logger.log("debug", "hidden");
  logger.log("info", "first");
  logger.log("warn", "second");
  logger.log("error", "third");
  await logger.stop();
  expect(output.mkdir.mock.calls).toEqual(
    Array.from({ length: 3 }, () => ["logs", { recursive: true }]),
  );
  expect(output.appendFile.mock.calls).toEqual([
    [
      expect.stringMatching(/logs[/\\]\d{4}-\d{2}-\d{2}\.log$/),
      expect.stringContaining("cli INFO first\n"),
    ],
    [expect.any(String), expect.stringContaining("cli WARN second\n")],
    [expect.any(String), expect.stringContaining("cli ERROR third\n")],
  ]);
  expect(output.error.mock.calls).toEqual([
    [expect.stringContaining("cli WARN second")],
    [expect.stringContaining("cli ERROR third")],
  ]);
});
test("logger recovers from failed writes and flushes later entries", async () => {
  const output = logOutput();
  output.appendFile.mockRejectedValueOnce(new Error("unavailable"));
  const logger = createLogger({ directory: "logs", level: "debug" }, output);
  logger.log("info", "failed");
  logger.log("debug", "recovered");
  await expect(logger.stop()).resolves.toBeUndefined();
  expect(output.appendFile).toHaveBeenCalledTimes(2);
  expect(output.appendFile).toHaveBeenLastCalledWith(
    expect.any(String),
    expect.stringContaining("DEBUG recovered\n"),
  );
});
test("unexpected failures have a safe console message and flush their cause", async () => {
  const logger = { log: vi.fn(), stop: vi.fn(async () => {}) };
  const error = vi.fn();
  const code = await runApplication(
    async () => {
      throw new TypeError("password=secret");
    },
    { command: "config", logger, output: vi.fn(), error },
  );
  expect(code).toBe(1);
  expect(error).toHaveBeenCalledExactlyOnceWith("error: Unexpected failure");
  expect(logger.log).toHaveBeenCalledWith("error", "Unexpected failure cause: TypeError");
  expect(logger.stop).toHaveBeenCalledOnce();
});
test("logger without a folder mirrors warnings and writes no file", async () => {
  const output = logOutput();
  const logger = createLogger({ level: "info" }, output);
  logger.log("error", "no folder");
  await logger.stop();
  expect(output.appendFile).not.toHaveBeenCalled();
  expect(output.error.mock.calls).toEqual([[expect.stringContaining("cli ERROR no folder")]]);
});
