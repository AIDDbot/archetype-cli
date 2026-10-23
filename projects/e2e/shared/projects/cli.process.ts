import { spawn, type ChildProcess } from "node:child_process";
import type { CliInput, CliResult, CliSettings } from "./cli.contract.ts";

export type ProcessInput = {
  settings: CliSettings;
  input: CliInput;
  environment: Record<string, string | undefined>;
  track: (child: ChildProcess) => void;
};

export function invokeCli(options: ProcessInput): Promise<CliResult> {
  return new Promise((resolve, reject) => {
    const args = [...options.settings.arguments, ...(options.input.arguments ?? [])];
    const child = spawn(options.settings.executable, args, {
      cwd: options.settings.directory,
      env: options.environment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    options.track(child);
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (text: string) => {
      stdout += text;
    });
    child.stderr.setEncoding("utf8").on("data", (text: string) => {
      stderr += text;
    });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

export async function stopProcess(child: ChildProcess): Promise<void> {
  const unstarted = child.pid === undefined;
  if (unstarted) return;
  const ended = child.exitCode !== null || child.signalCode !== null;
  if (ended) return;
  const closed = new Promise<void>((resolve) => {
    child.once("close", () => resolve());
  });
  child.kill();
  await closed;
}
