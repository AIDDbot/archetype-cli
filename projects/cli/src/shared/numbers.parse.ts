import { ExpectedError } from "./errors/expected.error.ts";
export interface IntegerRange {
  field: string;
  min: number;
  max: number;
}
export function parseInteger(value: unknown, range: IntegerRange): number {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  const isInteger = typeof number === "number" && Number.isInteger(number);
  if (!isInteger)
    throw new ExpectedError(
      "usage",
      range.field + " must be an integer from " + range.min + " to " + range.max,
    );
  if (number < range.min || number > range.max)
    throw new ExpectedError(
      "usage",
      range.field + " must be an integer from " + range.min + " to " + range.max,
    );
  return number;
}
