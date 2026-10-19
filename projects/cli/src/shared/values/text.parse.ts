import { isText } from "./checks.guard.ts";
import { ExpectedError } from "#shared/expected.error.ts";
export function requireText(value: unknown, field: string): string {
  if (!isText(value)) throw new ExpectedError("usage", field + " must contain text");
  return value.trim();
}
