import { ruleError } from "#shared/expected.error.ts";
import { isMissing, isText } from "#shared/values/values.check.ts";

export type TextLength = { field: string; min: number; max: number };

export function requireText(value: unknown, field: string): string {
  const hasText = isText(value);
  if (!hasText) throw ruleError(field, "needs text");
  return value.trim();
}

export function optionalText(value: unknown, field: string): string | undefined {
  const isBlank = typeof value === "string" && !isText(value);
  const isAbsent = isMissing(value) || isBlank;
  return isAbsent ? undefined : requireText(value, field);
}

function checkLength(length: TextLength): void {
  const isOpen = !Number.isFinite(length.min) || !Number.isFinite(length.max);
  if (isOpen) throw new Error(`${length.field} needs a closed range`);
}

export function requireLength(value: unknown, length: TextLength): string {
  checkLength(length);
  const text = requireText(value, length.field);
  const isShort = text.length < length.min;
  const isLong = text.length > length.max;
  const isOutside = isShort || isLong;
  if (isOutside) throw ruleError(length.field, `has ${length.min} to ${length.max} characters`);
  return text;
}
