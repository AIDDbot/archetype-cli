import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { cliDirectory, cliStart } from "./settings.ts";
export async function createCli() {
  const directory = await mkdtemp(join(tmpdir(), "configuration-"));
  const file = join(directory, "config.json");
  const logs = join(directory, "logs");
  return {
    directory,
    file,
    logs,
    dispose: () => rm(directory, { recursive: true, force: true }),
    copy: () => copyProject(directory),
    run: (args: string[], options: Invocation = {}) =>
      invoke(args, {
        ...options,
        file: options.file === undefined ? file : options.file,
        logs: options.logs === undefined ? logs : options.logs,
      }),
  };
}
interface Invocation {
  environment?: Record<string, string>;
  cwd?: string;
  project?: string;
  file?: string | null;
  logs?: string | null;
  start?: string;
}
/** A copy of the cli and the root identity, for a test that runs on the defaults. */
async function copyProject(directory: string) {
  const project = join(directory, "cli");
  await cp(cliDirectory, project, { recursive: true });
  await cp(resolve(cliDirectory, "../../package.json"), join(directory, "package.json"));
  return { project, logs: null, start: `node "${join(project, "src/app.main.ts")}"` };
}
function environmentOf(options: Invocation) {
  const environment: NodeJS.ProcessEnv = { ...process.env, npm_config_loglevel: "silent" };
  for (const name of ["CONFIG_FILE", "LOG_DIR", "LOG_LEVEL"]) delete environment[name];
  if (options.logs != null) environment.LOG_DIR = options.logs;
  return Object.assign(environment, options.environment);
}
function invoke(args: string[], options: Invocation) {
  const environment = environmentOf(options);
  const command = options.project ?? cliDirectory;
  const argumentsList = options.file == null ? args : ["--config-file", options.file, ...args];
  const executable = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
  const text = `${options.start ?? cliStart} ${options.start === undefined ? "--" : ""} ${argumentsList.map(quote).join(" ")}`;
  const parameters = process.platform === "win32" ? ["/d", "/s", "/c", text] : ["-c", text];
  return new Promise<{ code: number | null; output: string; stdout: string; stderr: string }>(
    (resolveResult, reject) => {
      const child = spawn(executable, parameters, {
        windowsVerbatimArguments: process.platform === "win32",
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
    },
  );
}
function quote(value: string) {
  if (process.platform === "win32") return `"${value.replaceAll('"', '""')}"`;
  return `'${value.replaceAll("'", "'''")}'`;
}
