import assert from "node:assert/strict";
import { test } from "node:test";
import { startShell } from "./shell.ts";

void test("the shell starts an empty command registry", () => {
  assert.doesNotThrow(() => startShell([]));
});

void test("an unknown command fails without echoing arguments", () => {
  assert.throws(() => startShell([], ["secret-token"]), { message: "Unknown command." });
});

void test("the shell executes the selected command only", () => {
  let executionCount = 0;
  startShell(
    [
      {
        name: "selected",
        execute: () => {
          executionCount += 1;
        },
      },
    ],
    ["selected"],
  );
  assert.equal(executionCount, 1);
});
