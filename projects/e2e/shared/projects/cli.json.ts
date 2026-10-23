import type { CliInput, CliWorkspace } from "./cli.contract.ts";
export type JsonInvocation = {
  object: Record<string, unknown>;
  code: number | null;
  stderr: string;
};
export type JsonInput = { cli: CliWorkspace; input: CliInput };
export async function invokeJson(input: JsonInput): Promise<JsonInvocation> {
  const result = await input.cli.run({
    ...input.input,
    arguments: ["--json", ...(input.input.arguments ?? [])],
  });
  return { object: JSON.parse(result.stdout), code: result.code, stderr: result.stderr };
}
