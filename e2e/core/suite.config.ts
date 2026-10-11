import { readCliSettings } from "./cli.config.ts";

export const suiteSettings = {
  testDir: "./features",
  testMatch: "**/*.cli.spec.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "list" as const,
  metadata: { cli: readCliSettings(process.env) },
};
