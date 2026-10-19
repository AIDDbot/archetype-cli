import { isText } from "./checks.guard.ts";
import { ExpectedError } from "./errors/expected.error.ts";
export interface IntegerRange {
  field: string;
  min: number;
  max: number;
}
export function parseInteger(value: unknown, range: IntegerRange): number {
  const number = isText(value) ? Number(value) : value;
  const isInteger = typeof number === "number" && Number.isInteger(number);
  if (!isInteger)
    throw new ExpectedError(
      "usage",
      range.field + " must be an integer from " + range.min + " to " + range.max,
    );
  const isInRange = number >= range.min && number <= range.max;
  if (!isInRange)
    throw new ExpectedError(
      "usage",
      range.field + " must be an integer from " + range.min + " to " + range.max,
    );
  return number;
}
