import { expect, it } from "vitest";
import { missingConfiguration } from "./configuration.missing.ts";

it("allows an absent file", () => {
  expect(missingConfiguration({ code: "ENOENT" })).toBeUndefined();
});
it.each([null, "failure", { code: "EACCES" }])(
  "preserves other read failures %j",
  async (error) => {
    await expect(readFailure(error)).rejects.toBe(error);
  },
);

async function readFailure(error: unknown): Promise<undefined> {
  return missingConfiguration(error);
}
