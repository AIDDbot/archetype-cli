import { expect, it } from "vitest";
import { requireText } from "#shared/values/text/text.parse.ts";
import { parseBoolean } from "#shared/values/booleans/booleans.parse.ts";
import { readOptions } from "./options.read.ts";

it("reads typed fields through the supplied value parsers", () => {
  const options = { name: " A ", enabled: "true" };
  expect(
    readOptions(options, (read) => ({
      name: read("name", requireText),
      enabled: read("enabled", parseBoolean),
    })),
  ).toEqual({ name: "A", enabled: true });
});
it("names the failing option", () => {
  expect(() => readOptions({}, (read) => ({ name: read("name", requireText) }))).toThrow(
    "--name needs text",
  );
});
