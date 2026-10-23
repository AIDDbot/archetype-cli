import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ChildProcess } from "node:child_process";
import { inject, test as base } from "vitest";
import type { CliInput, CliResult, CliWorkspace } from "./cli.contract.ts";
import { invokeCli, stopProcess } from "./cli.process.ts";

type Fixtures = { cli: CliWorkspace };
type UseWorkspace = (workspace: CliWorkspace) => Promise<void>;

async function withWorkspace(use: UseWorkspace): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), "aidd-cli-"));
  const children: ChildProcess[] = [];
  try {
    await mkdir(join(directory, "logs"));
    await writeFile(join(directory, "config.json"), "{}");
    const run = (input: CliInput): Promise<CliResult> =>
      invokeCli({
        settings: inject("cliSettings"),
        input,
        environment: {
          ...process.env,
          CONFIG_FILE: join(directory, "config.json"),
          LOG_DIR: join(directory, "logs"),
          ...input.environment,
        },
        track: (child) => {
          children.push(child);
        },
      });
    await use({ directory, run });
  } finally {
    await Promise.all(children.map(stopProcess));
    await rm(directory, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

export const test = base.extend<Fixtures>({
  cli: async ({ task: _task }, use) => {
    await withWorkspace(use);
  },
});
