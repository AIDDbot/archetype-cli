import assert from "node:assert/strict";
import { test } from "node:test";
import { createHealthService } from "./health.service.ts";

void test("health records each startup and returns only status and the persistent count", () => {
  let runs = 0;
  const data = {
    recordRun: () => {
      runs += 1;
    },
    countRuns: () => runs,
  };
  const first = createHealthService(data);
  first.start();
  assert.deepEqual(first.read(), { status: "ok", runs: 1 });
  const second = createHealthService(data);
  second.start();
  assert.deepEqual(second.read(), { status: "ok", runs: 2 });
  assert.deepEqual(second.read(), { status: "ok", runs: 2 });
});

void test("a failed run record does not produce a successful startup", () => {
  const failure = new Error("database failed");
  const health = createHealthService({
    recordRun: () => {
      throw failure;
    },
    countRuns: () => 0,
  });
  assert.throws(() => health.start(), failure);
});

void test("a failed count does not produce a successful health answer", () => {
  const failure = new Error("database failed");
  const health = createHealthService({
    recordRun: () => undefined,
    countRuns: () => {
      throw failure;
    },
  });
  assert.throws(() => health.read(), failure);
});
