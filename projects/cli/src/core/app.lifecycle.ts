import { ExpectedError } from "../shared/errors/expected.error.ts";
import type { Logger } from "../shared/output/logger.type.ts";
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
    if (output !== undefined) invocation.output(output);
  } catch (error) {
    code = error instanceof ExpectedError ? exitCodes[error.kind] : 1;
    const message = error instanceof ExpectedError ? error.message : "Unexpected failure";
    invocation.error(`error: ${message}`);
    if (!(error instanceof ExpectedError))
      invocation.logger.log("error", `Unexpected failure cause: ${describeCause(error)}`);
  }
  const level = code === 0 ? "info" : code === 3 ? "error" : "warn";
  invocation.logger.log(
    level,
    `${invocation.command} exit=${code} duration=${Math.round(performance.now() - started)}ms`,
  );
  await invocation.logger.stop();
  return code;
}

function describeCause(error: unknown) {
  const kinds = [TypeError, RangeError, SyntaxError, ReferenceError, URIError, EvalError, Error];
  return kinds.find((kind) => error instanceof kind)?.name ?? "Non-error exception";
}
