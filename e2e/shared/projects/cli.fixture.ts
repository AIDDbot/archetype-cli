import { test as base, expect } from "@playwright/test";
import { runCli } from "./cli.run.ts";
import type { CliOptions, CliResult, CliSettings } from "./cli.type.ts";

type Fixtures = { cli: (options: CliOptions) => Promise<CliResult> };

export const test = base.extend<Fixtures>({
  cli: async ({}, use, testInfo) => {
    const settings = testInfo.config.metadata.cli as CliSettings;
    await use((options) => runCli(options, settings));
  },
});
export { expect };
