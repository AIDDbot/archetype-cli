import { formatDateTime, formatIsoDate } from "./dates/dates.format.ts";
import { formatMilliseconds } from "./durations/durations.format.ts";
import { isMissing } from "./values.check.ts";

export type DurationValue = { milliseconds: number };
export type DisplayValue = string | number | boolean | Date | DurationValue | null | undefined;
export type StandardValue = string | number | boolean | null;
export type PresentedValue = { text: string; json: StandardValue };

export function presentValue(value: DisplayValue): PresentedValue {
  const missing = isMissing(value);
  if (missing) return { text: "—", json: null };
  const date = value instanceof Date;
  if (date) return { text: formatDateTime(value), json: formatIsoDate(value) };
  const duration = typeof value === "object";
  if (duration) return { text: formatMilliseconds(value.milliseconds), json: value.milliseconds };
  return { text: String(value), json: value };
}
