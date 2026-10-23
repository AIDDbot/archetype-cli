import { ruleError } from "#shared/expected.error.ts";

const words: Readonly<Record<string, boolean>> = {
  true: true,
  false: false,
  "1": true,
  "0": false,
};

export function parseBoolean(value: unknown, field: string): boolean {
  const isBoolean = typeof value === "boolean";
  if (isBoolean) return value;
  const word = String(value).trim().toLowerCase();
  const parsed = words[word];
  const isUnknown = parsed === undefined;
  if (isUnknown) throw ruleError(field, "is true, false, 1 or 0");
  return parsed;
}
