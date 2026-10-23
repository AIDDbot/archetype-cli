import { ExpectedError, type ErrorKind } from "#shared/expected.error.ts";
import type { Logger, LogLevel } from "#shared/logging/logging.contract.ts";
import { formatMilliseconds } from "#shared/values/durations/durations.format.ts";

export type Invocation = {
  command: () => string;
  execute: () => Promise<void>;
  logger: Logger;
  stderr: (text: string) => void;
  clock: () => number;
  failure?: (message: string, usage: string) => void;
};
type ExitCode = 0 | 1 | 2 | 3;
const exitCodes: Record<ErrorKind, ExitCode> = { rule: 1, usage: 2, unavailable: 3 };
const levels: Record<ExitCode, LogLevel> = { 0: "info", 1: "warn", 2: "warn", 3: "error" };
const exceptionCategories = [
  TypeError,
  RangeError,
  SyntaxError,
  ReferenceError,
  URIError,
  EvalError,
  AggregateError,
  Error,
] as const;

function safeCause(error: unknown): string {
  const category = exceptionCategories.find((constructor) => error instanceof constructor);
  return `unexpected exception: ${category?.name ?? typeof error}`;
}

function report(error: unknown, input: Invocation): ExitCode {
  const expected = error instanceof ExpectedError;
  const message = expected ? error.message : "Unexpected failure";
  const code = expected ? exitCodes[error.kind] : 1;
  const usage = expected ? (error.fields?.usage ?? "") : "";
  const output =
    input.failure ??
    ((text: string): void => input.stderr(`error: ${text.replace(/[\r\n]+/g, " | ")}\n`));
  output(message, usage);
  const cause = expected ? error.kind : safeCause(error);
  input.logger.write({ level: "error", message: `Failure: ${cause}` });
  return code;
}

export async function runInvocation(input: Invocation): Promise<number> {
  const started = input.clock();
  let code: ExitCode = 0;
  try {
    await input.execute();
  } catch (error) {
    code = report(error, input);
  }
  const duration = formatMilliseconds(Math.round(input.clock() - started));
  input.logger.write({
    level: levels[code],
    message: `command=${input.command()} exit=${code} duration=${duration}`,
  });
  await input.logger.stop();
  return code;
}
