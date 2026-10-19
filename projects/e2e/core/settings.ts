import { cliDirectory, cliStart } from "#shared/projects/settings.ts";
/** Reads each setting of the suite when the runner loads its configuration: an invalid value stops the run before the first test. */
export interface SuiteSettings {
  cliDirectory: string;
  cliStart: string;
}
export function checkSettings(): SuiteSettings {
  return { cliDirectory, cliStart };
}
