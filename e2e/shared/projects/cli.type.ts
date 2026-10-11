export type CliSettings = Readonly<{
  directory: string;
  command: string;
  arguments: readonly string[];
}>;
export type CliOptions = Readonly<{
  arguments: readonly string[];
  database?: string;
  environment?: NodeJS.ProcessEnv;
}>;
export type CliResult = Readonly<{ stdout: string; stderr: string; exitCode: number }>;
