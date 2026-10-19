import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cliDirectory, cliStart } from "./settings.ts";
interface Invocation {
  environment?: Record<string, string>;
  cwd?: string;
  project?: string;
  file?: string | null;
  logs?: string | null;
  start?: string;
}
export interface CliResult {
  code: number | null;
  output: string;
  stdout: string;
  stderr: string;
}
export interface CliCopy {
  project: string;
  logs: null;
  start: string;
}
/** A cli in its own temporary folder, with its configuration file and its logs. */
export interface Cli {
  directory: string;
  file: string;
  logs: string;
  dispose(): Promise<void>;
  copy(): Promise<CliCopy>;
  run(args: string[], options?: Invocation): Promise<CliResult>;
}
export async function createCli(): Promise<Cli> {
  const directory = await mkdtemp(join(tmpdir(), "configuration-"));
  const file = join(directory, "config.json");
  const logs = join(directory, "logs");
  return {
    directory,
    file,
    logs,
    dispose: () => rm(directory, { recursive: true, force: true }),
    copy: () => copyProject(directory),
    run: (args, options = {}) =>
      invoke(args, {
        ...options,
        file: orDefault(options.file, file),
        logs: orDefault(options.logs, logs),
      }),
  };
}
function orDefault<T>(value: T | undefined, fallback: T): T {
  const isMissing = value === undefined;
  return isMissing ? fallback : value;
}
/** A copy of the cli and the root identity, for a test that runs on the defaults. */
async function copyProject(directory: string) {
  const project = join(directory, "projects", "cli");
  await cp(cliDirectory, project, { recursive: true });
  await cp(join(cliDirectory, "..", "..", "package.json"), join(directory, "package.json"));
  return { project, logs: null, start: `node "${join(project, "src/app.main.ts")}"` };
}
function environmentOf(options: Invocation) {
  const environment: NodeJS.ProcessEnv = { ...process.env, npm_config_loglevel: "silent" };
  for (const name of ["CONFIG_FILE", "LOG_DIR", "LOG_LEVEL"]) delete environment[name];
  const { logs } = options;
  const hasLogs = logs != null;
  if (hasLogs) environment.LOG_DIR = logs;
  return Object.assign(environment, options.environment);
}
/** The words of a start command; a quoted word keeps its spaces. No shell runs it, so no argument needs quotes. */
function wordsOf(command: string) {
  const words = command.match(/"[^"]*"|\S+/g) ?? [];
  return words.map((word) => word.replaceAll('"', ""));
}
function invoke(args: string[], options: Invocation) {
  const environment = environmentOf(options);
  const command = options.project ?? cliDirectory;
  const { file } = options;
  const hasFile = file != null;
  const argumentsList = hasFile ? ["--config-file", file, ...args] : args;
  const [executable = "node", ...parameters] = wordsOf(options.start ?? cliStart);
  return new Promise<CliResult>((resolveResult, reject) => {
    const child = spawn(executable, [...parameters, ...argumentsList], {
      cwd: options.cwd ?? command,
      env: { ...environment, npm_config_local_prefix: command },
    });
    let output = "";
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      output += String(data);
      stdout += String(data);
    });
    child.stderr.on("data", (data) => {
      output += String(data);
      stderr += String(data);
    });
    child.on("error", reject);
    child.on("close", (code) => resolveResult({ code, output, stdout, stderr }));
  });
}
