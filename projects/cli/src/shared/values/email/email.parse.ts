import { ruleError } from "#shared/expected.error.ts";
import { requireText } from "#shared/values/text/text.parse.ts";

const emailShape = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function parseEmail(value: unknown, field: string): string {
  const email = requireText(value, field).toLowerCase();
  const isEmail = emailShape.test(email);
  if (!isEmail) throw ruleError(field, "is a valid email");
  return email;
}
