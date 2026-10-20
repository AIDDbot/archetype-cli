import { ExpectedError } from "#shared/expected.error.ts";
import type { CommandRegistration } from "#shared/output/command.type.ts";
import { createConfigService } from "./config.service.ts";
export function registerConfig(): CommandRegistration {
  return {
    name: "config",
    summary: "Read and write local settings",
    usage: "config get [name] | config set <name> <value>",
    operations: [
      { name: "get", summary: "Read settings and their sources" },
      { name: "set", summary: "Save a setting" },
    ],
    options: [],
    async run(args, settings) {
      const service = createConfigService(settings);
      const [operation, name, value] = args;
      const isGet = operation === "get" && args.length <= 2;
      if (isGet) {
        const data = service.get(name);
        const isList = "settings" in data;
        if (isList) {
          return {
            data,
            view: {
              kind: "list",
              records: "settings",
              columns: ["Setting", "Value", "Source"],
              rows: data.settings.map((setting) => [setting.name, setting.value, setting.source]),
            },
          };
        }
        return { data, text: data.value };
      }
      const isSet = operation === "set" && args.length === 3;
      const hasValue = name !== undefined && value !== undefined;
      if (isSet && hasValue) {
        await service.set(name, value);
        return { data: {}, text: "" };
      }
      throw new ExpectedError("usage", "Use config get [name] or config set <name> <value>");
    },
  };
}
