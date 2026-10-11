const expectedErrors = new WeakSet<Error>();

export function expectedError(message: string): Error {
  const error = new Error(message);
  expectedErrors.add(error);
  return error;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && expectedErrors.has(error)) return error.message;
  return "Command failed.";
}
