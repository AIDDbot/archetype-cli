import type { Command } from "../shared/command.type.ts";
import { expectedError } from "../shared/error.make.ts";

export function startShell(
  commands: readonly Command[],
  argumentsList: readonly string[] = [],
): void {
  if (argumentsList.length === 0) return;
  const command = commands.find((item) => item.name === argumentsList[0]);
  if (command === undefined) throw expectedError("Unknown command.");
  command.execute();
}
