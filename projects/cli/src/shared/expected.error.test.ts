import { expect, it } from "vite-plus/test";
import { attempt, ExpectedError, ruleError } from "#shared/expected.error.ts";

function failWithDisk(): never {
  throw new Error("disk");
}

function failWithRule(): never {
  throw ruleError("port", "is an integer");
}

it("keeps the kind, the message and the fields", () => {
  const error = new ExpectedError({
    kind: "usage",
    message: "unknown command",
    fields: { command: "x" },
  });
  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe("ExpectedError");
  expect(error.kind).toBe("usage");
  expect(error.message).toBe("unknown command");
  expect(error.fields).toEqual({ command: "x" });
});

it("gives the result of an action that does not fail", () => {
  expect(attempt(() => 42, "no answer")).toBe(42);
});

it("changes an unknown failure into an unavailable error", () => {
  expect(() => attempt(failWithDisk, "no disk")).toThrow(ExpectedError);
  expect(() => attempt(failWithDisk, "no disk")).toThrow("no disk");
});

it("keeps an expected error as it is", () => {
  expect(() => attempt(failWithRule, "no disk")).toThrow("port is an integer");
});

it("makes a rule error for one field", () => {
  const error = ruleError("name", "needs text");
  expect(error.kind).toBe("rule");
  expect(error.message).toBe("name needs text");
  expect(error.fields).toEqual({ name: "needs text" });
});
