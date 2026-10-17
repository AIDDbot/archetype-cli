import { expect, test } from "vite-plus/test";
import { createSettingReader } from "./read.setting.ts";
test("reads the first setting source or fallback and propagates invalid values", () => {
  const readSetting = createSettingReader({
    read: (name) => (name === "present" ? "value" : undefined),
  });
  expect(readSetting({ name: "present", fallback: "fallback", parse: String })).toBe("value");
  expect(readSetting({ name: "absent", fallback: "fallback", parse: String })).toBe("fallback");
  expect(() =>
    readSetting({
      name: "present",
      fallback: "fallback",
      parse: () => {
        throw new Error("invalid");
      },
    }),
  ).toThrow("invalid");
});
