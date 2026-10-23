import type { CommandResult } from "#shared/output/command.contract.ts";
import { renderView } from "#shared/output/view.render.ts";

import type { ConfigResult } from "./config.service.ts";

export function configResult(result: ConfigResult): CommandResult {
  if (result.single) return { text: result.settings[0].value, json: { ...result.settings[0] } };
  const view = renderView({
    kind: "list",
    name: "settings",
    fields: [
      { key: "name", label: "Setting" },
      { key: "value", label: "Value" },
      { key: "source", label: "Source" },
    ],
    records: result.settings,
  });
  return { text: view.text, json: { settings: result.settings } };
}
