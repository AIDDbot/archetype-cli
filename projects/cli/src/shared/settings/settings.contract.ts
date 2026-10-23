export type SettingDefinition<Value = unknown> = {
  name: string;
  option: string;
  fallback: Value;
  check: (value: unknown) => Value;
};
export type SettingSources = {
  options: Readonly<Record<string, unknown>>;
  environment: Readonly<Record<string, unknown>>;
  configuration: Readonly<Record<string, unknown>>;
};
export type Settings = {
  readSetting: <Value>(definition: SettingDefinition<Value>) => Value;
  listSettings: () => readonly SettingValue[];
  getSetting: (name: string) => SettingValue;
  setSetting: (name: string, value: string) => Promise<void>;
};
export type SettingSource = "argument" | "environment" | "file" | "default";
export type SettingValue = { name: string; value: string; source: SettingSource };
