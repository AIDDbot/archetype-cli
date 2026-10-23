export function isMissing(value: unknown): value is null | undefined {
  const isNull = value === null;
  const isUndefined = value === undefined;
  return isNull || isUndefined;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  const isObject = typeof value === "object";
  const hasValue = !isMissing(value);
  const isList = Array.isArray(value);
  return isObject && hasValue && !isList;
}

export function isText(value: unknown): value is string {
  const isString = typeof value === "string";
  const trimmed = isString ? value.trim() : "";
  return trimmed.length > 0;
}

export function isEmpty(value: unknown): boolean {
  const isBlank = typeof value === "string" && !isText(value);
  const isEmptyList = Array.isArray(value) && value.length === 0;
  const isEmptyRecord = isRecord(value) && Object.keys(value).length === 0;
  return isMissing(value) || isBlank || isEmptyList || isEmptyRecord;
}

export function isOneOf<Option extends string>(
  value: unknown,
  options: readonly Option[],
): value is Option {
  return options.some((option) => option === value);
}
