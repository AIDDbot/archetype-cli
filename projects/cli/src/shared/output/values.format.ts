import { formatDateTime } from "#shared/dates.format.ts";
import type { ViewValue } from "./view.type.ts";

export function formatValue(value: ViewValue): string {
  if (value instanceof Date) return formatDateTime(value);
  if (typeof value === "object") {
    if ("items" in value) return value.items.join(", ");
    return formatDuration(value.milliseconds);
  }
  return String(value);
}

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds} ms`;
  if (milliseconds < 60000) return `${milliseconds / 1000} s`;
  return `${milliseconds / 60000} min`;
}

export function machineValue(value: ViewValue): string | number | boolean | readonly string[] {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return "items" in value ? value.items : value.milliseconds;
  return value;
}
