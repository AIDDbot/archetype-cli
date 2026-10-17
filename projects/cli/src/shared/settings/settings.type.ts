export type SettingName = "CONFIG_FILE" | "LOG_DIR" | "LOG_LEVEL";
export type SettingOrigin = "argument" | "environment" | "file" | "default";
export interface SettingDefinition {
  name: SettingName;
  option: string;
  fallback: string;
  parse(value: unknown): string;
}
export interface SelectedSetting {
  name: SettingName;
  value: string;
  source: SettingOrigin;
}
export interface Settings {
  list(): SelectedSetting[];
  get(name: string): string;
  set(name: string, value: unknown): Promise<void>;
}
