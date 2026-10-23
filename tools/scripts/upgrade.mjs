// Each dependency of the root and of each project to its latest version, majors included.
import { runAll } from "./shell.mjs";

const commands = ["npx npm-check-updates@latest -u --workspaces --root", "npm install"];

process.exitCode = runAll(commands) ? 0 : 1;
