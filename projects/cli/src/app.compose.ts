import { fileURLToPath } from "node:url";
import { features } from "./features/features.manifest.ts";
import { parseShellArguments } from "./core/app.arguments.ts";
import { createSettings } from "./core/app.config.ts";
import { definitions, selectLogging, type LoggingSettings } from "./core/app.settings.ts";
import { createLogger } from "./core/app.logger.ts";
import { runApplication } from "./core/app.lifecycle.ts";
import { applicationHelp, commandHelp, settingOptions, shellOptions } from "./core/app.help.ts";
import { ExpectedError } from "./shared/errors/expected.error.ts";
import type { Logger } from "./shared/output/logger.type.ts";
import { loadIdentity } from "./core/app.identity.ts";
import { renderOutput } from "./core/app.output.ts";
const identity = loadIdentity(fileURLToPath(new URL(".", import.meta.url)));
const commands = features.map((register) => register({ identity }));
const options = settingOptions(definitions);
function parse(args: string[]) {
  return parseShellArguments(args, {
    definitions,
    options: [...shellOptions, ...commands.flatMap((command) => command.options)],
  });
}
function findCommand(requested: string) {
  const command = commands.find((item) => item.name === requested);
  const isKnown = command !== undefined;
  if (!isKnown) throw new ExpectedError("usage", `Unknown command: ${requested}`);
  return command;
}
async function run(
  parsed: ReturnType<typeof parse>,
  configure: (logging: LoggingSettings) => void,
) {
  const [name, target] = parsed.command;
  const isHelp = name === "help";
  const hasExtraHelpArguments = isHelp && parsed.command.length > 2;
  if (hasExtraHelpArguments) throw new ExpectedError("usage", "Use help [command]");
  const requested = isHelp ? target : name;
  const hasRequest = requested !== undefined;
  if (!hasRequest) return applicationHelp(commands, identity);
  const command = findCommand(requested);
  const wantsHelp = isHelp || parsed.options.help === true;
  if (wantsHelp) return commandHelp(command, options);
  const directory = fileURLToPath(new URL("../", import.meta.url));
  const sources = { argument: parsed.values, environment: process.env, file: {} };
  configure(selectLogging(sources, directory));
  const settings = await createSettings({ sources, directory });
  configure({ directory: settings.get("LOG_DIR"), level: settings.get("LOG_LEVEL") });
  return command.run(parsed.command.slice(1), settings);
}
export async function startApp() {
  const args = process.argv.slice(2);
  const directory = fileURLToPath(new URL("../", import.meta.url));
  const isJson = args.includes("--json");
  const create = (logging: LoggingSettings) => createLogger({ ...logging, quietConsole: isJson });
  const startup = { argument: {}, environment: process.env, file: {} };
  let logger: Logger = create(selectLogging(startup, directory));
  const proxy: Logger = {
    log: (level, message) => logger.log(level, message),
    stop: () => logger.stop(),
  };
  const configure = (logging: LoggingSettings) => {
    logger = create(logging);
  };
  let parsed: ReturnType<typeof parse> | undefined;
  const action = async () => {
    parsed = parse(args);
    const wantsVersion = parsed.options.version === true;
    if (wantsVersion) return identity.version;
    const result = await run(parsed, configure);
    return renderOutput(result, isJson);
  };
  return runApplication(action, {
    command: args.includes("config") ? "config" : "cli",
    logger: proxy,
    output: console.log,
    error: (message) => report(message, { isJson, parsed, args }),
  });
}
function report(
  message: string,
  context: { isJson: boolean; parsed: ReturnType<typeof parse> | undefined; args: string[] },
) {
  if (context.isJson) {
    console.log(JSON.stringify({ error: message.replace(/^error: /, "") }));
    return;
  }
  console.error(message);
  const words = context.parsed?.command ?? context.args;
  const command = commands.find((item) => words.includes(item.name));
  const hasCommand = command !== undefined;
  if (hasCommand) {
    console.error(`Usage: ${command.usage}`);
    return;
  }
  console.error(applicationHelp(commands, identity).text);
}
