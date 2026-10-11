import assert from "node:assert/strict";
import { test } from "node:test";
import { fail } from "./error.write.ts";

void test("fail writes one error line and sets exit code one without exiting early", (context) => {
  const write = context.mock.method(process.stderr, "write", () => true);
  const previousCode = process.exitCode;
  try {
    fail("Unknown command.");
    assert.equal(write.mock.calls[0]?.arguments[0], "error: Unknown command.\n");
    assert.equal(process.exitCode, 1);
  } finally {
    process.exitCode = previousCode;
    context.mock.restoreAll();
  }
});
