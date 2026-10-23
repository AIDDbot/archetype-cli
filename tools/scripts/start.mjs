// The cli with the arguments after `--`.
import { run } from "./shell.mjs";

const args = process.argv.slice(2).map((arg) => JSON.stringify(arg)).join(" ");

process.exitCode = run(`npm start --workspace cli --if-present -- ${args}`) ? 0 : 1;
