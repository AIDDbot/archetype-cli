import { expectedError } from "./error.make.ts";

export function requireText(value: string, field: string): string {
  if (value.trim().length === 0) throw expectedError(`${field}: must contain text`);
  return value.trim();
}
