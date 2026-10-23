import { ruleError } from "#shared/expected.error.ts";
import { isText } from "#shared/values/values.check.ts";

const isoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?)?$/;

function toDate(value: unknown): Date {
  const isIso = isText(value) && isoDate.test(value.trim());
  return isIso ? new Date(value.trim()) : new Date(Number.NaN);
}

export function parseDate(value: unknown, field: string): Date {
  const parsed = toDate(value);
  const isInvalid = Number.isNaN(parsed.getTime());
  if (isInvalid) throw ruleError(field, "is an ISO date");
  return parsed;
}
