import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CliOptions, CliResult, CliSettings } from "./cli.type.ts";

function invoke(
  options: CliOptions & { database: string },
  settings: CliSettings,
): Promise<CliResult> {
  const npmPath = process.env.npm_execpath;
  const isNpm =
    ["npm", "npm.cmd"].includes(settings.command.toLowerCase()) && npmPath !== undefined;
  const command = isNpm ? process.execPath : settings.command;
  const argumentsList = isNpm ? [npmPath!, ...settings.arguments] : [...settings.arguments];
  return new Promise((resolveResult, reject) => {
    const child = spawn(command, [...argumentsList, ...options.arguments], {
      cwd: settings.directory,
      env: { ...process.env, ...options.environment, DATABASE_URL: options.database },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => resolveResult({ stdout, stderr, exitCode: exitCode ?? 1 }));
  });
}

export async function runCli(options: CliOptions, settings: CliSettings): Promise<CliResult> {
  const database = options.database ?? options.environment?.DATABASE_URL;
  if (database !== undefined) return invoke({ ...options, database }, settings);
  const directory = await mkdtemp(join(tmpdir(), "archetype-cli-"));
  try {
    return await invoke({ ...options, database: join(directory, "test.sqlite") }, settings);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
