import { ExpectedError } from "#shared/errors/expected.error.ts";
import type { Logger, LogLevel } from "#shared/output/logger.type.ts";
interface Invocation {
  command: string;
  logger: Logger;
  output(message: string): void;
  error(message: string): void;
}
const exitCodes = { rule: 1, usage: 2, unavailable: 3 } as const;
export async function runApplication(
  action: () => Promise<string | undefined>,
  invocation: Invocation,
) {
  const started = performance.now();
  let code = 0;
  try {
    const output = await action();
    const hasOutput = output !== undefined;
    if (hasOutput) invocation.output(output);
  } catch (error) {
    code = reportFailure(error, invocation);
  }
  invocation.logger.log(
    levelOf(code),
    `${invocation.command} exit=${code} duration=${Math.round(performance.now() - started)}ms`,
  );
  await invocation.logger.stop();
  return code;
}

function reportFailure(error: unknown, invocation: Invocation) {
  const isExpected = error instanceof ExpectedError;
  const message = isExpected ? error.message : "Unexpected failure";
  invocation.error(`error: ${message}`);
  if (isExpected) return exitCodes[error.kind];
  invocation.logger.log("error", `Unexpected failure cause: ${describeCause(error)}`);
  return 1;
}

function levelOf(code: number): LogLevel {
  const isSuccess = code === 0;
  const isUnavailable = code === exitCodes.unavailable;
  if (isSuccess) return "info";
  return isUnavailable ? "error" : "warn";
}

function describeCause(error: unknown) {
  const kinds = [TypeError, RangeError, SyntaxError, ReferenceError, URIError, EvalError, Error];
  return kinds.find((kind) => error instanceof kind)?.name ?? "Non-error exception";
}
