// The unit tests of each project but the e2e, cached: a run with no change replays the last result.
import { APPS, run } from "./shell.mjs";

process.exitCode = run(`vp run --cache ${APPS} test`) ? 0 : 1;
