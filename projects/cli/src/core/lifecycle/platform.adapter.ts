import { randomUUID } from "node:crypto";
import { appendFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { missingConfiguration } from "#core/settings/configuration.missing.ts";
import { writeConfiguration } from "#core/settings/configuration.write.ts";
import type { Platform } from "./platform.run.ts";

async function append(file: string, line: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  await appendFile(file, line, "utf8");
}

export const platform: Platform = {
  directory: fileURLToPath(new URL("../../../", import.meta.url)),
  args: process.argv.slice(2),
  environment: process.env,
  read: (file) => readFile(file, "utf8").catch(missingConfiguration),
  write: (file, text) =>
    writeConfiguration(
      {
        temporary: (path) => `${path}.${randomUUID()}.tmp`,
        write: (path, value) => writeFile(path, value, { encoding: "utf8", flag: "wx" }),
        replace: rename,
        remove: (path) => rm(path, { force: true }),
      },
      { file, text },
    ),
  append,
  stdout: (line) => {
    process.stdout.write(line);
  },
  stderr: (line) => {
    process.stderr.write(line);
  },
  exit: (code) => {
    process.exitCode = code;
  },
  clock: () => performance.now(),
  date: () => new Date(),
};
