import type { CommandResult } from "#shared/output/command.type.ts";
import { formatView } from "#shared/output/view.format.ts";

export function renderOutput(result: CommandResult, isJson: boolean): string | undefined {
  if (isJson) return JSON.stringify(result.data);
  const hasView = "view" in result;
  const text = hasView ? formatView(result.view) : result.text;
  return text || undefined;
}
