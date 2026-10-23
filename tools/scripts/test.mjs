// The unit tests of each project but the e2e.
import { APPS, run } from "./shell.mjs";

process.exitCode = run(`vp run ${APPS} test`) ? 0 : 1;
