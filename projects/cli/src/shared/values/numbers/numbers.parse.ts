import { ruleError } from "#shared/expected.error.ts";
import { isText } from "#shared/values/values.check.ts";

export type NumberRange = { field: string; min: number; max: number };

function toNumber(value: unknown): number {
  const isNumber = typeof value === "number";
  if (isNumber) return value;
  const isNumeral = isText(value);
  return isNumeral ? Number(value) : Number.NaN;
}

function checkRange(range: NumberRange): void {
  const isOpen = !Number.isFinite(range.min) || !Number.isFinite(range.max);
  if (isOpen) throw new Error(`${range.field} needs a closed range`);
}

function isInRange(value: number, range: NumberRange): boolean {
  checkRange(range);
  const isLow = value < range.min;
  const isHigh = value > range.max;
  const isNumber = !Number.isNaN(value);
  return isNumber && !isLow && !isHigh;
}

export function parseNumber(value: unknown, range: NumberRange): number {
  const parsed = toNumber(value);
  const isValid = isInRange(parsed, range);
  if (!isValid) throw ruleError(range.field, `is a number from ${range.min} to ${range.max}`);
  return parsed;
}

export function parseInteger(value: unknown, range: NumberRange): number {
  const parsed = toNumber(value);
  const isValid = Number.isInteger(parsed) && isInRange(parsed, range);
  if (!isValid) throw ruleError(range.field, `is an integer from ${range.min} to ${range.max}`);
  return parsed;
}
