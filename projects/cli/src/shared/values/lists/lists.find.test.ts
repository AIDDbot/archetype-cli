import { expect, it } from "vite-plus/test";
import { ExpectedError } from "#shared/expected.error.ts";
import { findByName, requireByName } from "#shared/values/lists/lists.find.ts";

it("finds an item by name", () => {
  const items = [{ name: "home" }, { name: "about" }];
  expect(findByName(items, "about")).toEqual({ name: "about" });
  expect(findByName(items, "gone")).toBeUndefined();
});

it("requires an item by name", () => {
  const items = [{ name: "home" }];
  const away = { name: "away", kind: "page" };
  expect(requireByName(items, { name: "home", kind: "page" }).name).toBe("home");
  expect(() => requireByName(items, away)).toThrow(ExpectedError);
  expect(() => requireByName(items, away)).toThrow('page "away" is unknown');
});
