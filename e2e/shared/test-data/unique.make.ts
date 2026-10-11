import { randomUUID } from "node:crypto";

export function uniqueValue(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}
