export type ErrorKind = "rule" | "usage" | "unavailable";

export type ErrorFields = Readonly<Record<string, string>>;

export type ExpectedErrorInput = {
  kind: ErrorKind;
  message: string;
  fields?: ErrorFields;
};

export class ExpectedError extends Error {
  readonly kind: ErrorKind;
  readonly fields: ErrorFields | undefined;

  constructor(input: ExpectedErrorInput) {
    super(input.message);
    this.name = "ExpectedError";
    this.kind = input.kind;
    this.fields = input.fields;
  }
}

export function attempt<Result>(action: () => Result, message: string): Result {
  try {
    return action();
  } catch (error) {
    const isExpected = error instanceof ExpectedError;
    if (isExpected) throw error;
    throw new ExpectedError({ kind: "unavailable", message });
  }
}

export function ruleError(field: string, message: string): ExpectedError {
  return new ExpectedError({
    kind: "rule",
    message: `${field} ${message}`,
    fields: { [field]: message },
  });
}
