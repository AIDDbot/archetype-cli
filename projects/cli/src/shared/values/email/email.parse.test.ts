import { expect, it } from "vite-plus/test";
import { parseEmail } from "#shared/values/email/email.parse.ts";

it("trims an email and puts it in lower case", () => {
  expect(parseEmail("  Ada@Example.TEST ", "email")).toBe("ada@example.test");
});

it("rejects a value that is not an email", () => {
  for (const value of ["a", "a@b", "@b.c", "a@.", "a b@c.d", "a@b@c.d", 3, undefined])
    expect(() => parseEmail(value, "email")).toThrow("email");
});
