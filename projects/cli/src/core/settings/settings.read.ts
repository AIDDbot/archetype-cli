import { ExpectedError } from "#shared/expected.error.ts";
import type { SettingDefinition, SettingSources } from "#shared/settings/settings.contract.ts";
import { isRecord } from "#shared/values/values.check.ts";

const defined = (value: unknown): boolean => value !== undefined;

export function readSetting<Value>(
  definition: SettingDefinition<Value>,
  sources: SettingSources,
): Value {
  const fromFile = definition.name !== "CONFIG_FILE";
  const configuration = fromFile ? sources.configuration[definition.name] : undefined;
  const candidates = [
    sources.options[definition.option],
    sources.environment[definition.name],
    configuration,
    definition.fallback,
  ];

  const value = candidates.find(defined);
  return definition.check(value);
}

export type ConfigurationInput = {
  path: string;
  read: (path: string) => Promise<string | undefined>;
};

export async function readConfiguration(
  input: ConfigurationInput,
): Promise<Record<string, unknown>> {
  try {
    const text = await input.read(input.path);
    const missing = text === undefined;
    if (missing) return {};
    const value: unknown = JSON.parse(text);
    const valid = isRecord(value);
    if (valid) return value;
  } catch {
    throw new ExpectedError({
      kind: "unavailable",
      message: `Cannot read configuration: ${input.path}`,
    });
  }
  throw new ExpectedError({
    kind: "unavailable",
    message: `Cannot read configuration: ${input.path}`,
  });
}
