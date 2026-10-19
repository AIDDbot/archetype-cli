import { formatDateTime } from "#shared/values/dates.format.ts";
import type { ViewValue } from "./view.type.ts";

export function formatValue(value: ViewValue): string {
  const isDate = value instanceof Date;
  if (isDate) return formatDateTime(value);
  const isPrimitive = typeof value !== "object";
  if (isPrimitive) return String(value);
  const isList = "items" in value;
  if (isList) return value.items.join(", ");
  return formatDuration(value.milliseconds);
}

export function formatDuration(milliseconds: number): string {
  const isUnderSecond = milliseconds < 1000;
  if (isUnderSecond) return `${milliseconds} ms`;
  const isUnderMinute = milliseconds < 60000;
  if (isUnderMinute) return `${milliseconds / 1000} s`;
  return `${milliseconds / 60000} min`;
}

export function machineValue(value: ViewValue): string | number | boolean | readonly string[] {
  const isDate = value instanceof Date;
  if (isDate) return value.toISOString();
  const isPrimitive = typeof value !== "object";
  if (isPrimitive) return value;
  const isList = "items" in value;
  return isList ? value.items : value.milliseconds;
}
