import { isRecord } from "#shared/values/values.check.ts";

export function missingConfiguration(error: unknown): undefined {
  const record = isRecord(error);
  const missing = record && error.code === "ENOENT";
  if (missing) return undefined;
  throw error;
}
