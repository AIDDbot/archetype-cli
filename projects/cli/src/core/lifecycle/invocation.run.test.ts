import { expect, it, vi } from "vitest";
import { ExpectedError, type ErrorKind } from "#shared/expected.error.ts";
import type { Logger } from "#shared/logging/logging.contract.ts";
import { runInvocation, type Invocation } from "./invocation.run.ts";

function fixture(): Invocation {
  return {
    command: () => "fixture",
    execute: async () => {},
    logger: { write: vi.fn<Logger["write"]>(), stop: vi.fn<Logger["stop"]>(async () => {}) },
    stderr: vi.fn<Invocation["stderr"]>(),
    clock: vi.fn<Invocation["clock"]>().mockReturnValueOnce(1).mockReturnValueOnce(13.4),
  };
}
it("records success duration and flushes", async () => {
  const input = fixture();
  await expect(runInvocation(input)).resolves.toBe(0);
  expect(input.logger.write).toHaveBeenCalledExactlyOnceWith({
    level: "info",
    message: "command=fixture exit=0 duration=12ms",
  });
  expect(input.logger.stop).toHaveBeenCalledOnce();
  expect(input.stderr).not.toHaveBeenCalled();
});
it.each<[ErrorKind, number, string]>([
  ["rule", 1, "warn"],
  ["usage", 2, "warn"],
  ["unavailable", 3, "error"],
])("maps %s errors", async (kind, code, level) => {
  const input = fixture();
  const execute = async (): Promise<void> => {
    throw new ExpectedError({ kind, message: "Public\nmessage" });
  };
  await expect(runInvocation({ ...input, execute })).resolves.toBe(code);
  expect(input.stderr).toHaveBeenCalledExactlyOnceWith("error: Public | message\n");
  expect(input.logger.write).toHaveBeenLastCalledWith({
    level,
    message: `command=fixture exit=${code} duration=12ms`,
  });
});
it.each([
  [Error("password=secret"), "Error"],
  [new TypeError("password=secret"), "TypeError"],
  [new RangeError("password=secret"), "RangeError"],
  [new SyntaxError("password=secret"), "SyntaxError"],
  [new ReferenceError("password=secret"), "ReferenceError"],
  [new URIError("password=secret"), "URIError"],
  [new EvalError("password=secret"), "EvalError"],
  [new AggregateError([Error("token=secret")], "password=secret"), "AggregateError"],
  [Object.assign(Error("password=secret"), { name: "token=secret", code: "secret" }), "Error"],
  [{ name: "TypeError", message: "token=secret", code: "secret" }, "object"],
  ["token=secret", "string"],
  [null, "object"],
])("hides unexpected details %j", async (error, category) => {
  const input = fixture();
  const execute = async (): Promise<void> => {
    throw error;
  };
  await expect(runInvocation({ ...input, execute })).resolves.toBe(1);
  expect(input.stderr).toHaveBeenCalledExactlyOnceWith("error: Unexpected failure\n");
  expect(input.logger.write).toHaveBeenNthCalledWith(1, {
    level: "error",
    message: `Failure: unexpected exception: ${category}`,
  });
  expect(input.logger.write).toHaveBeenNthCalledWith(2, {
    level: "warn",
    message: "command=fixture exit=1 duration=12ms",
  });
  expect(input.logger.write).toHaveBeenCalledTimes(2);
  expect(input.logger.stop).toHaveBeenCalledOnce();
});
