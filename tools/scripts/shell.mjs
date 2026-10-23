// Runs one command in a shell, with its output on the console: on Windows, `vp`, `npm` and `npx` are `.cmd` files.
import { spawnSync } from "node:child_process";

// Each project but the e2e.
export const APPS = '--filter "./projects/*" --filter "!e2e"';

export function run(command) {
  return spawnSync(command, { shell: true, stdio: "inherit" }).status === 0;
}

// Runs each command in order and stops at the first red one.
export function runAll(commands) {
  return commands.every((command) => run(command));
}
