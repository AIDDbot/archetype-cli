export type CliSettings = { directory: string; executable: string; arguments: string[] };
export type CliInput = { arguments?: string[]; environment?: Record<string, string | undefined> };
export type CliResult = { stdout: string; stderr: string; code: number | null };
export type CliWorkspace = { directory: string; run: (input: CliInput) => Promise<CliResult> };

declare module "vitest" {
  export interface ProvidedContext {
    cliSettings: CliSettings;
  }
}
