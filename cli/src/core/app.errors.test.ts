import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedError } from "../shared/error.make.ts";
import { runSafely } from "./app.errors.ts";

void test("expected failures show the safe message", () => {
  let message = "";
  runSafely(
    () => {
      throw expectedError("Unknown command.");
    },
    (value) => {
      message = value;
    },
  );
  assert.equal(message, "Unknown command.");
});

void test("unexpected failures hide secrets, paths and stack traces", () => {
  let message = "";
  runSafely(
    () => {
      throw new Error("secret-token at C:/private/file.sqlite");
    },
    (value) => {
      message = value;
    },
  );
  assert.equal(message, "Command failed.");
});

void test("a successful command produces no error output", () => {
  runSafely(
    () => undefined,
    () => assert.fail("unexpected failure output"),
  );
});
