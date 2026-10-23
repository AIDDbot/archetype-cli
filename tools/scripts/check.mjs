// The whole repository, with no fix: each step runs, also after a red one, so that no check hides another.
import { run } from "./shell.mjs";

const steps = [
  ["format", "vp fmt --check"],
  ["lint and types", "vp check --no-fmt"],
  ["layers", 'vp run --filter "./projects/*" layers'],
  ["crap", 'vp run --filter "./projects/*" crap'],
];

const red = [];
for (const [name, command] of steps) {
  if (!run(command)) red.push(name);
}

console.log(red.length > 0 ? `check: red in ${red.join(", ")}` : "check: green");
process.exitCode = red.length > 0 ? 1 : 0;
