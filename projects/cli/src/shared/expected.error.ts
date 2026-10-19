export type ErrorKind = "rule" | "usage" | "unavailable";
export class ExpectedError extends Error {
  readonly kind: ErrorKind;
  constructor(kind: ErrorKind, message: string) {
    super(message);
    this.name = "ExpectedError";
    this.kind = kind;
  }
}
export async function attempt<T>(action: () => T | Promise<T>, message: string): Promise<T> {
  try {
    return await action();
  } catch {
    throw new ExpectedError("unavailable", message);
  }
}
