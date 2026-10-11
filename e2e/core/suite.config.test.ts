import assert from "node:assert/strict";
import { test } from "node:test";
import { suiteSettings } from "./suite.config.ts";

void test("the suite has no browser or persistent server", () => {
  assert.equal("projects" in suiteSettings, false);
  assert.equal("webServer" in suiteSettings, false);
  assert.equal(suiteSettings.retries, 0);
});
