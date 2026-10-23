import type { Application } from "./app.compose.ts";
import { runShell } from "./shell.run.ts";
import { helpResult, render } from "#core/output/output.render.ts";
import type { Command } from "#shared/output/command.contract.ts";
import { resolve } from "node:path";
import { parseArguments, type Arguments } from "#core/arguments/arguments.parse.ts";
import { createLogger } from "#core/logging/logging.create.ts";
import { configFile, definitions } from "#core/settings/settings.definitions.ts";
import { loggingSettings } from "#core/settings/settings.bootstrap.ts";
import { readConfiguration, readSetting } from "#core/settings/settings.read.ts";
import type { Logger } from "#shared/logging/logging.contract.ts";
import type { SettingSources } from "#shared/settings/settings.contract.ts";
import { runInvocation } from "./invocation.run.ts";
import { manageSettings } from "#core/settings/settings.manage.ts";

export type Platform = {
  directory: string;
  args: string[];
  environment: Record<string, string | undefined>;
  read: (file: string) => Promise<string | undefined>;
  write: (file: string, text: string) => Promise<void>;
  append: (file: string, line: string) => Promise<void>;
  stderr: (line: string) => void;
  stdout: (line: string) => void;
  exit: (code: number) => void;
  clock: () => number;
  date: () => Date;
};
type Startup = {
  runtime: Platform;
  sources: SettingSources;
  configure: (sources: SettingSources) => void;
  command: (name: string) => void;
  application: Application;
  commands: readonly Command[];
};

async function configure(input: Startup): Promise<void> {
  const parsed: Arguments = parseArguments({
    args: input.runtime.args,
    definitions,
    commands: input.commands,
    publish: (options) => input.configure({ ...input.sources, options }),
  });
  input.command(parsed.command);
  const version = parsed.options.version === true;
  if (version) {
    input.runtime.stdout(`${input.application.identity.version}\n`);
    return;
  }
  const sources = { ...input.sources, options: parsed.options };
  input.configure(sources);
  const file = resolve(input.runtime.directory, readSetting(configFile, sources));
  const configuration = await readConfiguration({ path: file, read: input.runtime.read });
  const complete = { ...sources, configuration };
  input.configure(complete);
  definitions.forEach((definition) => readSetting(definition, complete));
  const result = await runShell({
    parsed,
    identity: input.application.identity,
    commands: input.commands,
  });
  render({ result, json: parsed.options.json === true, write: input.runtime.stdout });
}

function loggerFor(runtime: Platform, sources: SettingSources): Logger {
  const settings = loggingSettings({ directory: runtime.directory, sources });
  return createLogger({
    ...settings,
    source: "cli",
    clock: runtime.date,
    append: runtime.append,
    stderr: (line) => {
      const json = sources.options.json === true;
      if (json) return;
      runtime.stderr(line);
    },
  });
}

export async function runPlatform(runtime: Platform, application: Application): Promise<void> {
  const sources: SettingSources = {
    options: {},
    environment: runtime.environment,
    configuration: {},
  };
  let current = sources;
  const commands = application.features.flatMap((register) =>
    register({
      identity: application.identity,
      settings: manageSettings({
        directory: runtime.directory,
        sources: () => current,
        write: runtime.write,
      }),
    }),
  );
  let logger = loggerFor(runtime, sources);
  let command = "";
  const update = (settings: SettingSources): void => {
    current = settings;
    logger = loggerFor(runtime, settings);
  };
  const name = (value: string): void => {
    command = value;
  };
  const proxy: Logger = { write: (event) => logger.write(event), stop: () => logger.stop() };
  const code = await runInvocation({
    command: () => command,
    execute: () =>
      configure({ runtime, sources, configure: update, command: name, application, commands }),
    logger: proxy,
    stderr: runtime.stderr,
    failure: (message, usage) => {
      const json = current.options.json === true;
      if (json) {
        runtime.stdout(`${JSON.stringify({ error: message })}\n`);
        return;
      }
      const help = usage || helpResult({ identity: application.identity, commands }).text;
      runtime.stderr(`error: ${message}\n${help}\n`);
    },
    clock: runtime.clock,
  });
  runtime.exit(code);
}
