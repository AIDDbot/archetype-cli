import { ExpectedError } from "#shared/expected.error.ts";
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
export function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function isOneOf<T>(value: unknown, options: readonly T[]): value is T {
  return options.some((option) => option === value);
}
export function findByName<T extends { name: string }>(
  items: readonly T[],
  name: string,
): T | undefined {
  return items.find((item) => item.name === name);
}
type NameRequest = { name: string; kind: string };
export function requireByName<T extends { name: string }>(
  items: readonly T[],
  request: NameRequest,
): T {
  const item = findByName(items, request.name);
  if (!item) throw new ExpectedError("usage", request.kind + " not found: " + request.name);
  return item;
}
